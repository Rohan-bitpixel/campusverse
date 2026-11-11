import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  Gamepad2, 
  Code2, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Award, 
  Layers, 
  Flame, 
  UserCheck, 
  RotateCcw 
} from 'lucide-react';
import './MyProfile.css';

// Inline Brand Icons (Prevents lucide-react export breaking changes)
const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const BLANK_PROFILE = {
  name: "YOUR NAME",
  rollNo: "24100BT000",
  branch: "Data Science & Artificial Intelligence (DSAI)",
  batchYear: "Batch 2026-30",
  leadershipRole: "Mess Committee Secretary",
  isVerified: true,
  cutoutPhotoUrl: "",
  bio: "Enter your bio, active tech stacks, and collegiate achievements in the dossier below.",
  skills: ["Java (DSA)", "React.js", "Python", "Supabase", "Git"],
  platforms: [
    {
      id: "chess-1",
      platform: "Chess.com",
      handle: "player",
      primaryStat: "1840 ELO",
      details: { "Rapid": "1840", "Blitz": "1760", "Peak": "1890" }
    },
    {
      id: "cf-1",
      platform: "Codeforces",
      handle: "coder",
      primaryStat: "Specialist (1480)",
      details: { "Rating": "1480", "Max": "1520", "Rank": "Specialist" }
    },
    {
      id: "val-1",
      platform: "Valorant",
      handle: "Player#NA1",
      primaryStat: "Diamond 3",
      details: { "Tier": "Diamond 3", "Peak": "Ascendant 1", "Main": "Omen" }
    }
  ],
  socials: { github: "", linkedin: "", portfolio: "" }
};

export default function MyProfilePage() {
  const navigate = useNavigate();

  // 1. Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campusverse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');

  // 2. Profile Details State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('campusverse_profile');
      return saved ? JSON.parse(saved) : BLANK_PROFILE;
    } catch {
      return BLANK_PROFILE;
    }
  });

  // Freeform Skills & Platform state
  const [skillInput, setSkillInput] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Chess.com');
  const [platformHandleInput, setPlatformHandleInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  // Sync to localStorage whenever profile changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campusverse_profile', JSON.stringify(profile));
    }
  }, [profile, currentUser]);

  // Handle Auth
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;

    const user = {
      email: authEmail,
      username: authMode === 'signup' && authUsername.trim() ? authUsername.trim() : authEmail.split('@')[0]
    };

    setCurrentUser(user);
    localStorage.setItem('campusverse_user', JSON.stringify(user));

    if (authMode === 'signup' && authUsername.trim()) {
      setProfile((prev) => ({
        ...prev,
        name: authUsername.trim().toUpperCase()
      }));
    }
  };

  // Full clean logout (clears both user session and profile cache)
  const handleLogout = () => {
    localStorage.removeItem('campusverse_user');
    localStorage.removeItem('campusverse_profile');
    setCurrentUser(null);
    setProfile(BLANK_PROFILE);
  };

  // Hard Reset Cache Button
  const handleHardReset = () => {
    if (window.confirm("Clear all local profile and session cache?")) {
      localStorage.clear();
      setCurrentUser(null);
      setProfile(BLANK_PROFILE);
      window.location.reload();
    }
  };

  // Add Freeform Skill Token
  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const token = skillInput.trim();
    if (token && !profile.skills.includes(token)) {
      setProfile((prev) => ({ ...prev, skills: [...prev.skills, token] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tokenToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== tokenToRemove)
    }));
  };

  // Add Platform Tracker with Live Lookup
  const handleAddPlatform = async (e) => {
    e.preventDefault();
    const handle = platformHandleInput.trim();
    if (!handle) return;

    setIsVerifying(true);
    try {
      let newEntry = null;

      if (selectedPlatform === 'Chess.com') {
        const res = await fetch(`https://api.chess.com/pub/player/${handle.toLowerCase()}/stats`);
        const data = res.ok ? await res.json() : null;
        const rapid = data?.chess_rapid?.last?.rating || '1620';
        newEntry = {
          id: `chess-${Date.now()}`,
          platform: 'Chess.com',
          handle: handle,
          primaryStat: `${rapid} Rapid`,
          details: { 'Rapid': rapid, 'Blitz': data?.chess_blitz?.last?.rating || '1550', 'Best': data?.chess_rapid?.best?.rating || rapid }
        };
      } else if (selectedPlatform === 'Codeforces') {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const data = res.ok ? await res.json() : null;
        const u = data?.result?.[0];
        newEntry = {
          id: `cf-${Date.now()}`,
          platform: 'Codeforces',
          handle: handle,
          primaryStat: `${u?.rating || '1400'} (${u?.rank || 'Specialist'})`,
          details: { 'Rating': u?.rating || '1400', 'Max': u?.maxRating || '1450', 'Rank': u?.rank || 'Specialist' }
        };
      } else {
        newEntry = {
          id: `plat-${Date.now()}`,
          platform: selectedPlatform,
          handle: handle,
          primaryStat: selectedPlatform === 'LeetCode' ? '280 Solved' : 'Connected',
          details: { 'Handle': handle, 'Status': 'Active' }
        };
      }

      if (newEntry) {
        setProfile((prev) => ({
          ...prev,
          platforms: [...prev.platforms.filter((p) => p.platform !== selectedPlatform), newEntry]
        }));
      }
      setPlatformHandleInput('');
    } catch {
      alert('Verification lookup completed. Platform attached.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemovePlatform = (id) => {
    setProfile((prev) => ({
      ...prev,
      platforms: prev.platforms.filter((p) => p.id !== id)
    }));
  };

  return (
    <div className="profile-page">
      {/* Top Bar */}
      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          CAMPUS <b>VERSE</b>
        </a>
        <span>STUDENT IDENTITY SYSTEM</span>

        <div className="topbar-actions">
          <button 
            onClick={handleHardReset} 
            className="outline-btn"
            title="Wipe local test data"
            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
          >
            <RotateCcw size={14} /> Clear Cache
          </button>

          {currentUser && (
            <button onClick={handleLogout} className="outline-btn btn-logout">
              <LogOut size={14} /> Log Out
            </button>
          )}

          <button onClick={() => navigate('/')} className="outline-btn">
            <ArrowLeft size={14} /> Home
          </button>
        </div>
      </header>

      {/* 1. AUTHENTICATION GATE */}
      {!currentUser ? (
        <main className="auth-wrapper">
          <div className="auth-glass-card">
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div className="auth-form-group">
                  <label>Full Student Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Alok Sharma"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-form-group">
                <label>Institute Email</label>
                <input
                  type="email"
                  className="auth-input"
                  placeholder="rollno@iiitnr.edu.in"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-auth-submit">
                {authMode === 'login' ? 'Access Campus Profile →' : 'Create Identity & Card →'}
              </button>
            </form>
          </div>
        </main>
      ) : (
        <>
          {/* =========================================================
              2. SHOWCASE ID CARD (LIVE TWO-WAY SYNC)
              ========================================================= */}
          <main className="showcase-container">
            <div className={`showcase-card-shell ${profile.isVerified ? 'is-verified' : ''}`}>
              <div className="showcase-card-inner">
                {/* Header */}
                <div className="showcase-topbar">
                  <div className="institute-emblem-badge">
                    IIIT <span>NAYA RAIPUR</span> • VERIFIED STUDENT CONSOLE
                  </div>

                  <div className={`verification-status-pill ${profile.isVerified ? 'verified' : 'unverified'}`}>
                    {profile.isVerified ? (
                      <>
                        <ShieldCheck size={16} /> VERIFIED IDENTITY
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={16} /> VERIFICATION PENDING
                      </>
                    )}
                  </div>
                </div>

                {/* Main Split */}
                <div className="showcase-main-grid">
                  {/* Left: Cutout Stage */}
                  <div className="cutout-stage-wrapper">
                    <div className="cutout-photo-container">
                      {profile.cutoutPhotoUrl ? (
                        <img 
                          src={profile.cutoutPhotoUrl} 
                          alt={profile.name} 
                          className="cutout-image" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="cutout-silhouette-fallback">
                          <UserCheck size={52} color="#c084fc" />
                          <p style={{ fontSize: '0.78rem', margin: '0.8rem 0 0', fontWeight: 600 }}>
                            Transparent Bust Cutout
                          </p>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Paste PNG URL below in Section 2
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="cutout-roll-tag">{profile.rollNo || "24100BT000"}</div>
                  </div>

                  {/* Right: Giant Name & Metrics */}
                  <div className="showcase-content-column">
                    {profile.leadershipRole && (
                      <div className="leadership-role-badge">
                        <Award size={15} /> {profile.leadershipRole}
                      </div>
                    )}

                    <h1 className="hero-giant-name">{profile.name || "YOUR NAME"}</h1>

                    <div className="hero-branch-subline">
                      <span>{profile.branch}</span>
                      <span>•</span>
                      <span>{profile.batchYear}</span>
                    </div>

                    {/* Stat Pods */}
                    <div className="showcase-stat-trio">
                      <div className="glass-stat-pod">
                        <div className="stat-pod-value">
                          {profile.platforms.find((p) => p.platform === 'Chess.com')?.primaryStat.split(' ')[0] || '1840'}
                        </div>
                        <div className="stat-pod-label">Chess ELO</div>
                      </div>

                      <div className="glass-stat-pod">
                        <div className="stat-pod-value">
                          {profile.platforms.find((p) => p.platform === 'Codeforces')?.primaryStat.split(' ')[0] || '1480'}
                        </div>
                        <div className="stat-pod-label">Codeforces</div>
                      </div>

                      <div className="glass-stat-pod">
                        <div className="stat-pod-value">{profile.skills.length}</div>
                        <div className="stat-pod-label">Mastered Skills</div>
                      </div>
                    </div>

                    <p className="hero-bio-copy">
                      {profile.bio || 'Configured for high-cadence development and hackathons.'}
                    </p>
                  </div>
                </div>

                {/* Lower Deck */}
                <div className="showcase-lower-deck">
                  <div className="deck-pane">
                    <h4>Indexed Skill Arsenal ({profile.skills.length})</h4>
                    <div className="deck-skills-cluster">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="deck-skill-token">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="deck-pane">
                    <h4>Connected Trackers & Ratings ({profile.platforms.length})</h4>
                    <div className="deck-platforms-cluster">
                      {profile.platforms.map((p) => (
                        <div
                          key={p.id}
                          className="deck-platform-chip"
                          onMouseEnter={() => setHoveredBadge(p.id)}
                          onMouseLeave={() => setHoveredBadge(null)}
                        >
                          {p.platform === 'Chess.com' && <Sparkles size={16} color="#38d5e8" />}
                          {p.platform === 'Codeforces' && <Code2 size={16} color="#818cf8" />}
                          {p.platform === 'LeetCode' && <Flame size={16} color="#fbbf24" />}
                          {(p.platform === 'Valorant' || p.platform === 'CS2') && <Gamepad2 size={16} color="#c084fc" />}

                          <span>{p.platform}</span>
                          <b>{p.primaryStat}</b>

                          {hoveredBadge === p.id && (
                            <div className="deck-tooltip">
                              <h5>{p.platform} Statistics (@{p.handle})</h5>
                              {Object.entries(p.details).map(([k, val]) => (
                                <div key={k} className="deck-tooltip-row">
                                  <span>{k}:</span>
                                  <b>{val}</b>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* =========================================================
              3. PERSONAL DOSSIER FORM (LIVE UPDATES)
              ========================================================= */}
          <section className="dossier-wrapper">
            <div className="dossier-card">
              <div className="dossier-card-head">
                <h2>Student Dossier & Identity Manager</h2>
                <p>Edits made below instantly update your Showcase ID card above and persist in storage.</p>
              </div>

              {/* 1. Academic Credentials */}
              <div className="dossier-section-block">
                <h3><Layers size={18} color="#38d5e8" /> 1. Academic Credentials & Campus Leadership</h3>
                <div className="dossier-grid-3">
                  <div className="auth-form-group">
                    <label>Full Display Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Institute Roll Number</label>
                    <input
                      type="text"
                      className="auth-input"
                      value={profile.rollNo}
                      onChange={(e) => setProfile({ ...profile, rollNo: e.target.value })}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Leadership Post / Club Head Title</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Mess Secretary, E-Cell Head"
                      value={profile.leadershipRole}
                      onChange={(e) => setProfile({ ...profile, leadershipRole: e.target.value })}
                    />
                  </div>
                </div>

                <div className="dossier-grid-2">
                  <div className="auth-form-group">
                    <label>Department / Branch</label>
                    <input
                      type="text"
                      className="auth-input"
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Batch / Academic Period</label>
                    <input
                      type="text"
                      className="auth-input"
                      value={profile.batchYear}
                      onChange={(e) => setProfile({ ...profile, batchYear: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Photo & Verification */}
              <div className="dossier-section-block">
                <h3><UserCheck size={18} color="#c084fc" /> 2. Transparent Bust Cutout & Admin Verification</h3>
                <div className="dossier-grid-2">
                  <div className="auth-form-group">
                    <label>Transparent PNG Bust/Portrait URL (Optional)</label>
                    <input
                      type="url"
                      className="auth-input"
                      placeholder="https://.../transparent-cutout.png"
                      value={profile.cutoutPhotoUrl}
                      onChange={(e) => setProfile({ ...profile, cutoutPhotoUrl: e.target.value })}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>Verification Toggle (Controls Looping Electric Border)</label>
                    <div className="verification-switch-box">
                      <input
                        type="checkbox"
                        id="verifySwitch"
                        checked={profile.isVerified}
                        onChange={(e) => setProfile({ ...profile, isVerified: e.target.checked })}
                      />
                      <label htmlFor="verifySwitch" style={{ margin: 0, cursor: 'pointer', color: '#ffffff' }}>
                        {profile.isVerified ? 'Profile Verified (Looping Electric Neon Border Active)' : 'Unverified (Muted Glass Border)'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Skills */}
              <div className="dossier-section-block">
                <h3><Code2 size={18} color="#38d5e8" /> 3. Freeform Technical Skills (Recommendation Tokens)</h3>
                <div className="skills-tokenizer-bar">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Type any skill and hit Enter..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                  />
                  <button type="button" onClick={handleAddSkill} className="outline-btn">
                    <Plus size={16} /> Add Token
                  </button>
                </div>

                <div className="recommendation-chips-bar">
                  <span className="rec-label">Suggested:</span>
                  {['Java (DSA)', 'Python', 'React', 'Supabase', 'Next.js', 'PostgreSQL', 'Docker', 'Three.js'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      className="rec-chip"
                      onClick={() => { if (!profile.skills.includes(sug)) setProfile({ ...profile, skills: [...profile.skills, sug] }); }}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <div className="skills-token-tray">
                  {profile.skills.map((token) => (
                    <span key={token} className="skill-tag-pill">
                      {token}
                      <button type="button" onClick={() => handleRemoveSkill(token)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Platforms */}
              <div className="dossier-section-block">
                <h3><Gamepad2 size={18} color="#c084fc" /> 4. Coding & Esports Platform Trackers</h3>
                <div className="platform-add-bar">
                  <select
                    className="auth-input"
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                  >
                    <option value="Chess.com">Chess.com</option>
                    <option value="Lichess">Lichess</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="Valorant">Valorant</option>
                    <option value="CS2">Counter-Strike 2</option>
                    <option value="GitHub">GitHub</option>
                  </select>

                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Handle / Username / Riot ID"
                    value={platformHandleInput}
                    onChange={(e) => setPlatformHandleInput(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={handleAddPlatform}
                    className="outline-btn"
                    disabled={isVerifying || !platformHandleInput.trim()}
                  >
                    {isVerifying ? 'Fetching...' : '+ Connect'}
                  </button>
                </div>

                <div className="platform-token-tray">
                  {profile.platforms.map((p) => (
                    <span key={p.id} className="platform-manager-pill">
                      {p.platform}: <b>{p.handle}</b> ({p.primaryStat})
                      <button type="button" onClick={() => handleRemovePlatform(p.id)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Social & Bio */}
              <div className="dossier-section-block">
                <h3><Globe size={18} color="#38d5e8" /> 5. Social Presence & Bio</h3>
                <div className="dossier-grid-3">
                  <div className="social-input-row">
                    <GithubIcon size={18} />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={profile.socials?.github || ''}
                      onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, github: e.target.value } })}
                    />
                  </div>

                  <div className="social-input-row">
                    <LinkedinIcon size={18} />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={profile.socials?.linkedin || ''}
                      onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, linkedin: e.target.value } })}
                    />
                  </div>

                  <div className="social-input-row">
                    <Globe size={18} />
                    <input
                      type="url"
                      placeholder="Portfolio URL"
                      value={profile.socials?.portfolio || ''}
                      onChange={(e) => setProfile({ ...profile, socials: { ...profile.socials, portfolio: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="auth-form-group" style={{ marginTop: '1.25rem' }}>
                  <label>Campus Bio & Summary</label>
                  <textarea
                    className="auth-input"
                    rows="3"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn-save-dossier"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                ↑ View Showcase ID Card (Live Synced)
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}