import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Check,
  Copy,
  Globe,
  Lock,
  Plus,
  Send,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import AuthModal from '../components/AuthModal.jsx';
import './Collab.css';

const TEAM_CATEGORIES = ['Hackathon', 'Research', 'Project', 'Competition', 'Open Source'];

export default function CollabPage() {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteCodeParam = searchParams.get('join');

  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'create' | 'requests'
  const [teams, setTeams] = useState([]);
  const [membersByTeam, setMembersByTeam] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth modal for invite link or join actions
  const [authOpen, setAuthOpen] = useState(false);

  // Invite link join modal
  const [inviteTeam, setInviteTeam] = useState(null);
  const [inviteRolePart, setInviteRolePart] = useState('');
  const [joiningInvite, setJoiningInvite] = useState(false);

  // Join Request modal
  const [requestTeam, setRequestTeam] = useState(null);
  const [desiredRole, setDesiredRole] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const [copiedCode, setCopiedCode] = useState('');

  // Create Team form state
  const [creating, setCreating] = useState(false);
  const [teamForm, setTeamForm] = useState({
    title: '',
    category: 'Hackathon',
    description: '',
    tech_stack: '',
    visibility: 'public',
    lead_name: '',
    lead_role: 'Team Lead',
    max_members: 4
  });
  const [initialMembers, setInitialMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  useEffect(() => {
    if (profile?.full_name && !teamForm.lead_name) {
      setTeamForm((prev) => ({ ...prev, lead_name: profile.full_name }));
    }
  }, [profile]);

  const loadCollabData = async () => {
    setLoading(true);
    const [{ data: teamsData }, { data: membersData }] = await Promise.all([
      supabase.from('collab_teams').select('*').order('created_at', { ascending: false }),
      supabase.from('collab_members').select('*').order('joined_at', { ascending: true })
    ]);

    if (teamsData) setTeams(teamsData);
    if (membersData) {
      const grouped = {};
      membersData.forEach((m) => {
        if (!grouped[m.team_id]) grouped[m.team_id] = [];
        grouped[m.team_id].push(m);
      });
      setMembersByTeam(grouped);
    }

    if (user) {
      const { data: reqData } = await supabase
        .from('collab_requests')
        .select('*, team:collab_teams(id, title, lead_id)')
        .order('created_at', { ascending: false });
      if (reqData) setRequests(reqData);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCollabData();
  }, [user]);

  // Handle ?join=INVITE_CODE link (prompts login first if logged out)
  useEffect(() => {
    if (!inviteCodeParam) {
      setInviteTeam(null);
      return;
    }
    if (!user) {
      setAuthOpen(true);
      return;
    }

    supabase
      .from('collab_teams')
      .select('*')
      .eq('invite_code', inviteCodeParam.trim())
      .single()
      .then(({ data }) => {
        if (data) setInviteTeam(data);
      });
  }, [inviteCodeParam, user]);

  const handleAddInitialMember = () => {
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    setInitialMembers((prev) => [
      ...prev,
      { name: newMemberName.trim(), role: newMemberRole.trim() }
    ]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setCreating(true);
    try {
      const code = `CV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const techArr = teamForm.tech_stack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const { data: created, error } = await supabase
        .from('collab_teams')
        .insert({
          lead_id: user.id,
          lead_name: teamForm.lead_name.trim() || profile?.full_name || 'Team Lead',
          lead_role: teamForm.lead_role.trim() || 'Team Lead',
          title: teamForm.title.trim(),
          category: teamForm.category,
          description: teamForm.description.trim() || null,
          tech_stack: techArr,
          visibility: teamForm.visibility,
          invite_code: code,
          max_members: Number(teamForm.max_members) || 4,
          initial_members: initialMembers
        })
        .select()
        .single();

      if (error) throw error;

      // Insert Lead as first approved member in collab_members
      await supabase.from('collab_members').insert({
        team_id: created.id,
        user_id: user.id,
        member_name: teamForm.lead_name.trim() || profile?.full_name || 'Team Lead',
        role_part: teamForm.lead_role.trim() || 'Team Lead',
        joined_via: 'lead'
      });

      setTeamForm({
        title: '',
        category: 'Hackathon',
        description: '',
        tech_stack: '',
        visibility: 'public',
        lead_name: profile?.full_name || '',
        lead_role: 'Team Lead',
        max_members: 4
      });
      setInitialMembers([]);
      setActiveTab('board');
      loadCollabData();
    } finally {
      setCreating(false);
    }
  };

  const handleJoinViaInvite = async (e) => {
    e.preventDefault();
    if (!user || !inviteTeam) return;
    setJoiningInvite(true);
    try {
      await supabase.from('collab_members').upsert(
        {
          team_id: inviteTeam.id,
          user_id: user.id,
          member_name: profile?.full_name || user.email.split('@')[0],
          role_part: inviteRolePart.trim() || 'Member',
          joined_via: 'invite_link'
        },
        { onConflict: 'team_id,user_id' }
      );
      setInviteTeam(null);
      setInviteRolePart('');
      setSearchParams({});
      loadCollabData();
    } finally {
      setJoiningInvite(false);
    }
  };

  const handleSendJoinRequest = async (e) => {
    e.preventDefault();
    if (!user || !requestTeam) return;
    setSendingRequest(true);
    try {
      await supabase.from('collab_requests').insert({
        team_id: requestTeam.id,
        requester_id: user.id,
        requester_name: profile?.full_name || user.email.split('@')[0],
        desired_role: desiredRole.trim(),
        note: requestNote.trim() || null,
        status: 'pending'
      });
      setRequestTeam(null);
      setDesiredRole('');
      setRequestNote('');
      loadCollabData();
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRespondRequest = async (reqItem, decision) => {
    const { error } = await supabase
      .from('collab_requests')
      .update({ status: decision })
      .eq('id', reqItem.id);

    if (!error) {
      if (decision === 'accepted') {
        await supabase.from('collab_members').upsert(
          {
            team_id: reqItem.team_id,
            user_id: reqItem.requester_id,
            member_name: reqItem.requester_name,
            role_part: reqItem.desired_role,
            joined_via: 'request'
          },
          { onConflict: 'team_id,user_id' }
        );
      }
      loadCollabData();
    }
  };

  const copyInviteLink = (code) => {
    const link = `${window.location.origin}/collab?join=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Requests visible to user (as Team Lead or Approved Team Member)
  const teamReviewRequests = requests.filter(
    (r) => r.requester_id !== user?.id && r.status === 'pending'
  );

  // Visible teams on board: Public teams + Private teams where user is Lead or Approved Member
  const visibleTeams = teams.filter((t) => {
    if (t.visibility === 'public') return true;
    if (!user) return false;
    if (t.lead_id === user.id) return true;
    const approved = membersByTeam[t.id] || [];
    return approved.some((m) => m.user_id === user.id);
  });

  return (
    <div className="collab-page">
      <div className="collab-orb-green" />
      <div className="collab-orb-blue" />

      <header className="topbar">
        <Link to="/" className="brand">
          CAMPUS<b>VERSE</b>
        </Link>
        <span>COLLAB BOARD</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <Link to="/" className="outline-btn">
            Home
          </Link>
        </div>
      </header>

      <div className="collab-container">
        <div className="collab-toolbar">
          <div className="collab-tabs">
            <button
              type="button"
              className={`collab-tab-btn ${activeTab === 'board' ? 'active' : ''}`}
              onClick={() => setActiveTab('board')}
            >
              <Users size={15} /> TEAMS ({visibleTeams.length})
            </button>

            <button
              type="button"
              className={`collab-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => {
                if (!user) {
                  setAuthOpen(true);
                } else {
                  setActiveTab('create');
                }
              }}
            >
              <Plus size={15} /> CREATE TEAM
            </button>

            {user && (
              <button
                type="button"
                className={`collab-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                REQUESTS
                {teamReviewRequests.length > 0 && (
                  <span className="collab-badge-pill">{teamReviewRequests.length}</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* INVITE LINK JOIN MODAL */}
        {inviteTeam && user && (
          <div className="collab-glass-panel" style={{ borderColor: '#38d5e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>JOIN VIA INVITE: {inviteTeam.title}</h2>
              <button
                type="button"
                className="outline-btn"
                onClick={() => {
                  setInviteTeam(null);
                  setSearchParams({});
                }}
              >
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleJoinViaInvite} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                required
                className="collab-input"
                style={{ flex: 1, minWidth: '220px' }}
                placeholder="Your part / role (e.g. Frontend, ML, Backend)"
                value={inviteRolePart}
                onChange={(e) => setInviteRolePart(e.target.value)}
              />
              <button type="submit" disabled={joiningInvite} className="outline-btn">
                <Check size={15} /> {joiningInvite ? 'JOINING...' : 'JOIN TEAM'}
              </button>
            </form>
          </div>
        )}

        {/* SEND JOIN REQUEST MODAL */}
        {requestTeam && (
          <div className="collab-glass-panel" style={{ borderColor: '#38d5e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>REQUEST TO JOIN: {requestTeam.title}</h2>
              <button type="button" className="outline-btn" onClick={() => setRequestTeam(null)}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSendJoinRequest}>
              <div className="collab-form-grid-2">
                <div className="collab-field">
                  <label>PART / ROLE YOU WILL TAKE UP</label>
                  <input
                    type="text"
                    required
                    className="collab-input"
                    placeholder="React Frontend / AI Model"
                    value={desiredRole}
                    onChange={(e) => setDesiredRole(e.target.value)}
                  />
                </div>
                <div className="collab-field">
                  <label>NOTE</label>
                  <input
                    type="text"
                    className="collab-input"
                    placeholder="Relevant skills or experience"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={sendingRequest} className="outline-btn">
                <Send size={14} /> {sendingRequest ? 'SENDING...' : 'SEND REQUEST'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 1: CREATE TEAM */}
        {activeTab === 'create' && (
          <div className="collab-glass-panel">
            <form onSubmit={handleCreateTeam}>
              <div className="collab-form-grid-3">
                <div className="collab-field">
                  <label>TEAM / PROJECT TITLE</label>
                  <input
                    type="text"
                    required
                    className="collab-input"
                    value={teamForm.title}
                    onChange={(e) => setTeamForm({ ...teamForm, title: e.target.value })}
                  />
                </div>

                <div className="collab-field">
                  <label>CATEGORY</label>
                  <select
                    className="collab-input"
                    value={teamForm.category}
                    onChange={(e) => setTeamForm({ ...teamForm, category: e.target.value })}
                  >
                    {TEAM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="collab-field">
                  <label>VISIBILITY</label>
                  <select
                    className="collab-input"
                    value={teamForm.visibility}
                    onChange={(e) => setTeamForm({ ...teamForm, visibility: e.target.value })}
                  >
                    <option value="public">PUBLIC (+ INVITE LINK)</option>
                    <option value="private">PRIVATE (INVITE LINK ONLY)</option>
                  </select>
                </div>

                <div className="collab-field">
                  <label>LEAD NAME</label>
                  <input
                    type="text"
                    required
                    className="collab-input"
                    value={teamForm.lead_name}
                    onChange={(e) => setTeamForm({ ...teamForm, lead_name: e.target.value })}
                  />
                </div>

                <div className="collab-field">
                  <label>LEAD PART / ROLE</label>
                  <input
                    type="text"
                    required
                    className="collab-input"
                    placeholder="System Architecture"
                    value={teamForm.lead_role}
                    onChange={(e) => setTeamForm({ ...teamForm, lead_role: e.target.value })}
                  />
                </div>

                <div className="collab-field">
                  <label>MAXIMUM MEMBERS</label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    required
                    className="collab-input"
                    value={teamForm.max_members}
                    onChange={(e) => setTeamForm({ ...teamForm, max_members: e.target.value })}
                  />
                </div>
              </div>

              <div className="collab-form-grid-2">
                <div className="collab-field">
                  <label>TECH STACK (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    className="collab-input"
                    placeholder="React, Python, Supabase"
                    value={teamForm.tech_stack}
                    onChange={(e) => setTeamForm({ ...teamForm, tech_stack: e.target.value })}
                  />
                </div>

                <div className="collab-field">
                  <label>ADD EXISTING MEMBERS & THEIR PART</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="collab-input"
                      placeholder="Member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="collab-input"
                      placeholder="Part / Role"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                    />
                    <button type="button" onClick={handleAddInitialMember} className="outline-btn">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {initialMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.1rem' }}>
                  {initialMembers.map((m, idx) => (
                    <span
                      key={`${m.name}-${idx}`}
                      className="outline-btn"
                      style={{ borderRadius: '10px', cursor: 'default' }}
                    >
                      {m.name} — <b style={{ color: '#38d5e8' }}>{m.role}</b>
                      <button
                        type="button"
                        onClick={() => setInitialMembers((prev) => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="collab-field">
                <label>DESCRIPTION</label>
                <textarea
                  rows={2}
                  className="collab-input"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                />
              </div>

              <button type="submit" disabled={creating} className="outline-btn">
                <Plus size={16} /> {creating ? 'CREATING...' : 'CREATE TEAM'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: INCOMING TEAM REQUESTS (VISIBLE TO LEAD & APPROVED MEMBERS) */}
        {activeTab === 'requests' && (
          <div className="collab-glass-panel">
            {teamReviewRequests.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>NO PENDING TEAM REQUESTS</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {teamReviewRequests.map((req) => (
                  <div
                    key={req.id}
                    className="team-roster-list"
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.96rem' }}>
                        {req.requester_name} → {req.team?.title}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: '#38d5e8', marginTop: '3px' }}>
                        PART: {req.desired_role} {req.note ? `• "${req.note}"` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req, 'accepted')}
                        className="outline-btn"
                        style={{ borderColor: '#10b981', color: '#86efac' }}
                      >
                        <UserCheck size={14} /> ACCEPT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req, 'rejected')}
                        className="outline-btn"
                        style={{ borderColor: '#ef4444', color: '#fca5a5' }}
                      >
                        <UserX size={14} /> REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVE TEAMS BOARD */}
        {activeTab === 'board' && (
          loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>LOADING...</p>
          ) : visibleTeams.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>NO TEAMS YET</p>
          ) : (
            <div className="collab-teams-grid">
              {visibleTeams.map((team) => {
                const dbMembers = membersByTeam[team.id] || [];
                const extraInitial = Array.isArray(team.initial_members) ? team.initial_members : [];
                const totalFilled = dbMembers.length + extraInitial.length;
                const isMemberOrLead =
                  user &&
                  (team.lead_id === user.id || dbMembers.some((m) => m.user_id === user.id));
                const myExistingReq = requests.find(
                  (r) => r.team_id === team.id && r.requester_id === user?.id
                );

                return (
                  <div key={team.id} className="team-glass-card">
                    <div className="team-card-top">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="team-tag">{team.category}</span>
                        <span className="team-tag" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#cbd5e1' }}>
                          {team.visibility === 'private' ? (
                            <><Lock size={11} style={{ marginRight: '4px' }} /> PRIVATE</>
                          ) : (
                            <><Globe size={11} style={{ marginRight: '4px' }} /> PUBLIC</>
                          )}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38d5e8' }}>
                        {totalFilled} / {team.max_members} SLOTS
                      </span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{team.title}</h2>

                    {team.description && (
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-sub)', lineHeight: 1.55 }}>
                        {team.description}
                      </p>
                    )}

                    {/* Current Roster & Roles */}
                    <div className="team-roster-list">
                      {dbMembers.map((m) => (
                        <div key={m.id} className="team-roster-row">
                          <strong>
                            {m.member_name} {m.user_id === team.lead_id ? '(LEAD)' : ''}
                          </strong>
                          <span>{m.role_part}</span>
                        </div>
                      ))}
                      {extraInitial.map((im, i) => (
                        <div key={`init-${i}`} className="team-roster-row">
                          <strong>{im.name}</strong>
                          <span>{im.role}</span>
                        </div>
                      ))}
                    </div>

                    {Array.isArray(team.tech_stack) && team.tech_stack.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {team.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            style={{
                              fontSize: '0.74rem',
                              padding: '3px 9px',
                              borderRadius: '7px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="team-card-footer">
                      {/* Shareable Invite Link (Available for both Public & Private teams) */}
                      <button
                        type="button"
                        onClick={() => copyInviteLink(team.invite_code)}
                        className="outline-btn"
                      >
                        {copiedCode === team.invite_code ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === team.invite_code ? 'LINK COPIED' : 'INVITE LINK'}
                      </button>

                      {!isMemberOrLead && totalFilled < team.max_members && (
                        myExistingReq ? (
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8' }}>
                            {myExistingReq.status.toUpperCase()}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!user) {
                                setAuthOpen(true);
                              } else {
                                setRequestTeam(team);
                              }
                            }}
                            className="outline-btn"
                          >
                            <Send size={14} /> REQUEST JOIN
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          loadCollabData();
        }}
      />
    </div>
  );
}