import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Inbox,
  QrCode,
  RotateCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import AuthModal from '../components/AuthModal.jsx';
import './StudentId.css';

const ARENA_DEFS = [
  { key: 'leetcode_username', label: 'LeetCode', getUrl: (h) => `https://leetcode.com/u/${h}/` },
  { key: 'codeforces_username', label: 'Codeforces', getUrl: (h) => `https://codeforces.com/profile/${h}` },
  { key: 'codechef_username', label: 'CodeChef', getUrl: (h) => `https://www.codechef.com/users/${h}` },
  { key: 'github_username', label: 'GitHub', getUrl: (h) => `https://github.com/${h}` },
  { key: 'chesscom_username', label: 'Chess.com', getUrl: (h) => `https://www.chess.com/member/${h}` },
  { key: 'lichess_username', label: 'Lichess', getUrl: (h) => `https://lichess.org/@/${h}` },
  { key: 'valorant_riot_id', label: 'Valorant', getUrl: (h) => `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(h)}/overview` }
];

const BRANCH_FILTERS = ['ALL', 'DSAI', 'CSE', 'ECE'];

async function fetchPeerLiveStats(person) {
  const result = {};
  const tasks = [];

  if (person.leetcode_username) {
    const u = encodeURIComponent(person.leetcode_username.trim());
    tasks.push(
      fetch(`https://alfa-leetcode-api.onrender.com/${u}/solved`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.solvedProblem === 'number') {
            result.leetcode_solved = d.solvedProblem;
            result.leetcode_easy = d.easySolved;
            result.leetcode_medium = d.mediumSolved;
            result.leetcode_hard = d.hardSolved;
          }
        })
        .catch(() => {})
    );
    tasks.push(
      fetch(`https://alfa-leetcode-api.onrender.com/${u}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.ranking) result.leetcode_global_rank = `#${d.ranking}`;
        })
        .catch(() => {})
    );
  }

  if (person.codeforces_username) {
    const u = encodeURIComponent(person.codeforces_username.trim());
    tasks.push(
      fetch(`https://codeforces.com/api/user.info?handles=${u}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const cf = d?.result?.[0];
          if (cf) {
            result.codeforces_rating = cf.rating ?? 'Unrated';
            result.codeforces_rank = cf.rank ? cf.rank.toUpperCase() : 'NEWBIE';
            result.codeforces_max = cf.maxRating ?? '—';
          }
        })
        .catch(() => {})
    );
  }

  if (person.codechef_username) {
    const u = encodeURIComponent(person.codechef_username.trim());
    tasks.push(
      fetch(`https://codechef-api.vercel.app/handle/${u}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.currentRating) {
            result.codechef_rating = d.currentRating;
            result.codechef_stars = d.stars || '—';
          }
        })
        .catch(() => {})
    );
  }

  if (person.github_username) {
    const u = encodeURIComponent(person.github_username.trim());
    tasks.push(
      fetch(`https://api.github.com/users/${u}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && typeof d.public_repos === 'number') {
            result.github_repos = d.public_repos;
            result.github_followers = d.followers ?? 0;
          }
        })
        .catch(() => {})
    );
  }

  if (person.chesscom_username) {
    const u = encodeURIComponent(person.chesscom_username.trim().toLowerCase());
    tasks.push(
      fetch(`https://api.chess.com/pub/player/${u}/stats`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) {
            result.chesscom_rapid = d.chess_rapid?.last?.rating ?? '—';
            result.chesscom_blitz = d.chess_blitz?.last?.rating ?? '—';
            result.chesscom_bullet = d.chess_bullet?.last?.rating ?? '—';
          }
        })
        .catch(() => {})
    );
  }

  if (person.lichess_username) {
    const u = encodeURIComponent(person.lichess_username.trim());
    tasks.push(
      fetch(`https://lichess.org/api/user/${u}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.perfs) {
            result.lichess_rapid = d.perfs.rapid?.rating ?? '—';
            result.lichess_blitz = d.perfs.blitz?.rating ?? '—';
            result.lichess_bullet = d.perfs.bullet?.rating ?? '—';
          }
        })
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
  return result;
}

export default function StudentIDPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [statsMap, setStatsMap] = useState({});
  const [fetchingIds, setFetchingIds] = useState({});
  const fetchedLiveRef = useRef({});

  // Connection Requests State (Outgoing + Incoming)
  const [sentMap, setSentMap] = useState({});
  const [incomingReqs, setIncomingReqs] = useState([]);
  const [requestsDrawerOpen, setRequestsDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Deck Navigation & Directional Animation State
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('next'); // 'next' | 'prev'
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [loading, setLoading] = useState(true);

  // Soft Cursor Ambient Glow & Orb Parallax
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 45, normX: 0, normY: 0 });

  const handlePageMouseMove = (e) => {
    const xPct = (e.clientX / window.innerWidth) * 100;
    const yPct = (e.clientY / window.innerHeight) * 100;
    setCursorPos({
      x: xPct,
      y: yPct,
      normX: (xPct - 50) / 50,
      normY: (yPct - 50) / 50
    });
  };

  // Zero-Gravity 3D Magnetic Tilt & Specular Glare
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  const handleMouseMove = (e) => {
    if (isCardFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTilt({
      rx: ((y / rect.height) - 0.5) * -9,
      ry: ((x / rect.width) - 0.5) * 9,
      gx: (x / rect.width) * 100,
      gy: (y / rect.height) * 100,
      active: true
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  };

  // QR Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const videoRef = useRef(null);
  const studentsRef = useRef([]);

  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  const loadDirectoryAndConnections = async () => {
    const [{ data: profilesData }, { data: statsData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('platform_stats').select('*')
    ]);

    if (profilesData) setStudents(profilesData);
    if (statsData) {
      const map = {};
      statsData.forEach((s) => {
        map[s.user_id] = s;
      });
      setStatsMap(map);
    }

    if (user) {
      const [{ data: sent }, { data: incoming }] = await Promise.all([
        supabase
          .from('connection_requests')
          .select('id, receiver_id, status')
          .eq('sender_id', user.id),
        supabase
          .from('connection_requests')
          .select('id, status, sender:profiles!connection_requests_sender_id_fkey(id, full_name, branch, roll_number)')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (sent) {
        const rMap = {};
        sent.forEach((r) => {
          rMap[r.receiver_id] = { id: r.id, status: r.status };
        });
        setSentMap(rMap);
      }
      if (incoming) setIncomingReqs(incoming);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDirectoryAndConnections();
  }, [user]);

  const filtered = students.filter((s) => {
    if (branchFilter !== 'ALL' && (s.branch || '').toUpperCase() !== branchFilter) {
      return false;
    }
    const q = search.toLowerCase();
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.branch || '').toLowerCase().includes(q) ||
      (s.roll_number || '').toLowerCase().includes(q) ||
      (Array.isArray(s.skills) && s.skills.some((sk) => sk.toLowerCase().includes(q))) ||
      (Array.isArray(s.interests) && s.interests.some((it) => it.toLowerCase().includes(q)))
    );
  });

  const safeIndex = filtered.length > 0 ? activeIndex % filtered.length : 0;
  const current = filtered[safeIndex];
  const prevStudent = filtered.length > 1 ? filtered[(safeIndex - 1 + filtered.length) % filtered.length] : null;
  const nextStudent = filtered.length > 1 ? filtered[(safeIndex + 1) % filtered.length] : null;

  const goPrev = () => {
    if (filtered.length <= 1) return;
    setSlideDir('prev');
    setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const goNext = () => {
    if (filtered.length <= 1) return;
    setSlideDir('next');
    setActiveIndex((prev) => (prev + 1) % filtered.length);
  };

  useEffect(() => {
    setIsCardFlipped(false);
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
    if (!current || fetchedLiveRef.current[current.id]) return;
    fetchedLiveRef.current[current.id] = true;

    setFetchingIds((prev) => ({ ...prev, [current.id]: true }));
    fetchPeerLiveStats(current)
      .then((live) => {
        if (Object.keys(live).length > 0) {
          setStatsMap((prev) => ({
            ...prev,
            [current.id]: { ...(prev[current.id] || {}), ...live }
          }));
        }
      })
      .finally(() => {
        setFetchingIds((prev) => ({ ...prev, [current.id]: false }));
      });
  }, [current]);

  const verifyQrToken = async (rawToken) => {
    const clean = rawToken.trim();
    if (!clean) return;
    setScanStatus('VERIFYING...');

    const { data: pass } = await supabase
      .from('qr_passes')
      .select('*')
      .eq('token', clean)
      .single();

    if (!pass) {
      setScanStatus('INVALID TOKEN');
      return;
    }
    if (new Date(pass.expires_at) <= new Date() || pass.scans_used >= pass.max_scans) {
      setScanStatus('EXPIRED OR SCAN LIMIT REACHED');
      return;
    }

    await supabase
      .from('qr_passes')
      .update({ scans_used: pass.scans_used + 1 })
      .eq('id', pass.id);

    const idx = studentsRef.current.findIndex((s) => s.id === pass.user_id);
    if (idx !== -1) {
      setBranchFilter('ALL');
      setSearch('');
      setSlideDir('next');
      setActiveIndex(idx);
      setScannerOpen(false);
      setScanStatus('');
      setTokenInput('');
    }
  };

  useEffect(() => {
    if (!scannerOpen) return;
    let stream = null;
    let timer = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          timer = setInterval(async () => {
            if (!videoRef.current) return;
            const codes = await detector.detect(videoRef.current).catch(() => []);
            if (codes.length > 0 && codes[0].rawValue) {
              const raw = codes[0].rawValue;
              const extracted = raw.includes('/id/') ? raw.split('/id/')[1] : raw;
              verifyQrToken(extracted);
            }
          }, 900);
        }
      } catch {
        setScanStatus('CAMERA UNAVAILABLE — ENTER TOKEN');
      }
    };

    startCamera();
    return () => {
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [scannerOpen]);

  const handleConnect = async (targetId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (user.id === targetId) return;

    const { data, error } = await supabase
      .from('connection_requests')
      .insert({ sender_id: user.id, receiver_id: targetId, status: 'pending' })
      .select('id, status')
      .single();

    if (!error && data) {
      setSentMap((prev) => ({ ...prev, [targetId]: { id: data.id, status: data.status } }));
    }
  };

  const handleCancelRequest = async (targetId) => {
    const reqObj = sentMap[targetId];
    if (!reqObj?.id) return;
    const { error } = await supabase.from('connection_requests').delete().eq('id', reqObj.id);
    if (!error) {
      setSentMap((prev) => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });
    }
  };

  const handleRespondIncoming = async (reqId, newStatus) => {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: newStatus })
      .eq('id', reqId);
    if (!error) {
      setIncomingReqs((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
      );
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || filtered.length <= 1) return;
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtered.length]);

  const vis = current?.card_visibility || {
    roll: true,
    academic: true,
    status: true,
    bio: true,
    skills: true,
    interests: true,
    arenas: true,
    linkedin: true,
    hostel: false
  };
  const st = current ? statsMap[current.id] || {} : {};
  const isFetchingCurrent = current ? Boolean(fetchingIds[current.id]) : false;
  const primaryRole = Array.isArray(current?.club_roles) ? current.club_roles[0] : null;
  const pendingIncomingCount = incomingReqs.filter((r) => r.status === 'pending').length;

  const formattedLinkedinUrl = current?.linkedin_url?.trim()
    ? current.linkedin_url.trim().startsWith('http')
      ? current.linkedin_url.trim()
      : `https://${current.linkedin_url.trim()}`
    : '';

  const getHoverStats = (key, person) => {
    const pendingText = isFetchingCurrent ? 'SYNCING...' : '—';
    if (key === 'leetcode_username') {
      return [
        { label: 'HANDLE', value: `@${person.leetcode_username}` },
        { label: 'SOLVED', value: st.leetcode_solved ?? pendingText },
        {
          label: 'E / M / H',
          value:
            st.leetcode_easy != null
              ? `${st.leetcode_easy} / ${st.leetcode_medium} / ${st.leetcode_hard}`
              : pendingText
        },
        { label: 'GLOBAL RANK', value: st.leetcode_global_rank ?? pendingText }
      ];
    }
    if (key === 'codeforces_username') {
      return [
        { label: 'HANDLE', value: `@${person.codeforces_username}` },
        { label: 'RATING', value: st.codeforces_rating ?? pendingText },
        { label: 'RANK', value: st.codeforces_rank ?? pendingText },
        { label: 'MAX RATING', value: st.codeforces_max ?? pendingText }
      ];
    }
    if (key === 'codechef_username') {
      return [
        { label: 'HANDLE', value: `@${person.codechef_username}` },
        { label: 'RATING', value: st.codechef_rating ?? pendingText },
        { label: 'STARS', value: st.codechef_stars ?? pendingText }
      ];
    }
    if (key === 'github_username') {
      return [
        { label: 'USER', value: `@${person.github_username}` },
        { label: 'PUBLIC REPOS', value: st.github_repos ?? pendingText },
        { label: 'FOLLOWERS', value: st.github_followers ?? pendingText }
      ];
    }
    if (key === 'chesscom_username') {
      return [
        { label: 'PLAYER', value: `@${person.chesscom_username}` },
        { label: 'RAPID ELO', value: st.chesscom_rapid ?? pendingText },
        { label: 'BLITZ ELO', value: st.chesscom_blitz ?? pendingText }
      ];
    }
    if (key === 'lichess_username') {
      return [
        { label: 'PLAYER', value: `@${person.lichess_username}` },
        { label: 'RAPID ELO', value: st.lichess_rapid ?? pendingText },
        { label: 'BLITZ ELO', value: st.lichess_blitz ?? pendingText }
      ];
    }
    return [{ label: 'RIOT ID', value: person.valorant_riot_id }];
  };

  return (
    <div className="student-id-page" onMouseMove={handlePageMouseMove}>
      <div
        className="cursor-ambient-aura"
        style={{
          background: `radial-gradient(520px circle at ${cursorPos.x}% ${cursorPos.y}%, rgba(56, 213, 232, 0.065), rgba(16, 185, 129, 0.025) 45%, transparent 75%)`
        }}
      />
      <div
        className="id-orb-green"
        style={{
          transform: `translate3d(${cursorPos.normX * -18}px, ${cursorPos.normY * -18}px, 0)`
        }}
      />
      <div
        className="id-orb-blue"
        style={{
          transform: `translate3d(${cursorPos.normX * 22}px, ${cursorPos.normY * 22}px, 0)`
        }}
      />

      <header className="topbar">
        <Link to="/" className="brand">
          CAMPUS<b>VERSE</b>
        </Link>
        <span>STUDENT ID DECK</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {user && (
            <button
              type="button"
              onClick={() => setRequestsDrawerOpen((p) => !p)}
              className="outline-btn"
            >
              <Inbox size={15} /> REQUESTS
              {pendingIncomingCount > 0 && (
                <span className="inbox-count-pill">{pendingIncomingCount}</span>
              )}
            </button>
          )}
          <button type="button" onClick={() => setScannerOpen((p) => !p)} className="outline-btn">
            <QrCode size={15} /> {scannerOpen ? 'CLOSE SCANNER' : 'SCAN QR'}
          </button>
          <Link to="/" className="outline-btn">
            Home
          </Link>
        </div>
      </header>

      <div className="id-hub-container">
        {/* INCOMING PEER CONNECT REQUESTS DRAWER */}
        {requestsDrawerOpen && user && (
          <div className="peer-requests-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.88rem', letterSpacing: '0.12em', color: '#38d5e8' }}>
                PEER CONNECTION REQUESTS ({incomingReqs.length})
              </strong>
              <button type="button" onClick={() => setRequestsDrawerOpen(false)} className="outline-btn">
                <X size={14} />
              </button>
            </div>

            {incomingReqs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>NO INCOMING REQUESTS</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {incomingReqs.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div>
                      <strong>{req.sender?.full_name || 'STUDENT'}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                        {req.sender?.branch || 'IIITNR'} • {req.sender?.roll_number || '—'}
                      </div>
                    </div>

                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleRespondIncoming(req.id, 'accepted')}
                          className="outline-btn"
                          style={{ borderColor: '#10b981', color: '#86efac' }}
                        >
                          <UserCheck size={14} /> ACCEPT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespondIncoming(req.id, 'declined')}
                          className="outline-btn"
                          style={{ borderColor: '#ef4444', color: '#fca5a5' }}
                        >
                          <UserX size={14} /> DECLINE
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38d5e8' }}>
                        {req.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* QR SCANNER DRAWER */}
        {scannerOpen && (
          <div className="qr-scanner-drawer">
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <video
                ref={videoRef}
                style={{ width: '220px', height: '160px', borderRadius: '14px', background: '#030407', objectFit: 'cover' }}
                muted
                playsInline
              />
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Paste QR token..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      color: '#fff'
                    }}
                  />
                  <button type="button" onClick={() => verifyQrToken(tokenInput)} className="outline-btn">
                    VERIFY
                  </button>
                </div>
                {scanStatus && <span style={{ fontSize: '0.78rem', color: '#38d5e8', fontWeight: 700 }}>{scanStatus}</span>}
              </div>
            </div>
          </div>
        )}

        <div className="id-hub-toolbar">
          <div className="id-search-box">
            <Search size={16} color="#38d5e8" />
            <input
              type="text"
              placeholder="Search name, roll, skill, interest..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveIndex(0);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="branch-filter-pills">
            {BRANCH_FILTERS.map((b) => (
              <button
                key={b}
                type="button"
                className={`branch-pill-btn ${branchFilter === b ? 'active' : ''}`}
                onClick={() => {
                  setBranchFilter(b);
                  setActiveIndex(0);
                }}
              >
                {b}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', color: '#94a3b8' }}>
            {filtered.length > 0 ? `${safeIndex + 1} / ${filtered.length}` : '0 CARDS'}
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>LOADING...</p>
        ) : !current ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>NO MATCHING ID CARDS</p>
        ) : (
          <>
            {/* 3-CARD 3D ZERO-GRAVITY PERSPECTIVE STAGE */}
            <div className="carousel-3d-stage">
              <div className="antigravity-orbit-ring" />

              {/* LEFT FLANKING CARD */}
              {prevStudent && (
                <div className="wing-preview-card wing-left" onClick={goPrev}>
                  {prevStudent.cutout_url ? (
                    <img src={prevStudent.cutout_url} alt={prevStudent.full_name} className="wing-avatar" />
                  ) : (
                    <div className="wing-avatar">
                      <ShieldCheck size={34} color="#38d5e8" />
                    </div>
                  )}
                  <strong style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>
                    {prevStudent.full_name}
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: '#38d5e8', marginTop: '4px', fontWeight: 700 }}>
                    {prevStudent.branch || 'IIITNR'}
                  </span>
                </div>
              )}

              {/* CENTER HERO VERTICAL FLIPPABLE ID BADGE */}
              <div
                className="center-card-slot"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: tilt.active && !isCardFlipped
                    ? `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                    : undefined
                }}
              >
                <div className={`vertical-card-pivot ${isCardFlipped ? 'is-flipped' : ''}`}>
                  {/* FRONT FACE */}
                  <div className="vertical-face">
                    <div
                      key={current.id}
                      className={`vertical-card-shell ${current.is_verified ? 'is-verified' : ''} ${
                        slideDir === 'prev' ? 'slide-prev' : 'slide-next'
                      }`}
                    >
                      <div className="vertical-card-inner">
                        <div
                          className="card-specular-glare"
                          style={{
                            opacity: tilt.active ? 1 : 0,
                            background: `radial-gradient(circle 280px at ${tilt.gx}% ${tilt.gy}%, rgba(255, 255, 255, 0.11), transparent 70%)`
                          }}
                        />

                        <div className="vertical-card-top">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={15} color="#38d5e8" /> IIIT NAYA RAIPUR
                          </span>
                          <span
                            style={{
                              color: current.is_verified ? '#38d5e8' : '#fbbf24',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            {current.is_verified ? (
                              <>
                                <CheckCircle2 size={13} /> VERIFIED
                              </>
                            ) : (
                              <>
                                <Clock size={13} /> UNVERIFIED
                              </>
                            )}
                          </span>
                        </div>

                        <div className="vertical-portrait-ring">
                          {current.cutout_url ? (
                            <img src={current.cutout_url} alt={current.full_name} />
                          ) : (
                            <svg viewBox="0 0 128 128" width="120" height="120" fill="none">
                              <circle cx="64" cy="46" r="24" fill="rgba(255, 255, 255, 0.28)" />
                              <path
                                d="M22 118c0-23.2 18.8-42 42-42s42 18.8 42 42"
                                fill="rgba(255, 255, 255, 0.28)"
                              />
                            </svg>
                          )}
                        </div>

                        {vis.roll && (
                          <div className="vertical-roll-chip">
                            {current.roll_number || 'ID UNASSIGNED'}
                          </div>
                        )}

                        {vis.status && current.current_status && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em', color: '#38d5e8' }}>
                            ● {current.current_status}
                          </span>
                        )}

                        <h1 className="vertical-student-name">{current.full_name || 'STUDENT'}</h1>

                        {vis.academic && (
                          <div className="vertical-branch-line">
                            {current.branch ? `B.TECH ${current.branch}` : 'BRANCH UNSET'}
                            {current.batch_year ? ` • ${current.batch_year}` : ''}
                            {current.semester ? ` • SEM ${current.semester}` : ''}
                          </div>
                        )}

                        {vis.bio && current.bio && (
                          <p className="vertical-bio-text">{current.bio}</p>
                        )}

                        {/* Title-Only Clickable Badges with Live Telemetry Hover */}
                        {(vis.linkedin || vis.arenas) && (
                          <div className="vertical-links-cluster">
                            {vis.linkedin && formattedLinkedinUrl && (
                              <a
                                href={formattedLinkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="deck-platform-chip"
                                onMouseEnter={() => setHoveredBadge('linkedin')}
                                onMouseLeave={() => setHoveredBadge(null)}
                              >
                                <Briefcase size={13} color="#38d5e8" />
                                <span>LINKEDIN</span>
                                <ExternalLink size={11} color="#94a3b8" />

                                {hoveredBadge === 'linkedin' && (
                                  <div className="deck-tooltip">
                                    <h5>LINKEDIN</h5>
                                    <div className="deck-tooltip-row">
                                      <span>NAME</span>
                                      <b>{current.full_name}</b>
                                    </div>
                                    <div className="deck-tooltip-row">
                                      <span>ROLE</span>
                                      <b>{primaryRole || (current.branch ? `B.Tech ${current.branch}` : 'IIITNR')}</b>
                                    </div>
                                  </div>
                                )}
                              </a>
                            )}

                            {vis.arenas &&
                              ARENA_DEFS.filter((a) => Boolean(current[a.key])).map((arena) => (
                                <a
                                  key={arena.key}
                                  href={arena.getUrl(current[arena.key])}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="deck-platform-chip"
                                  onMouseEnter={() => setHoveredBadge(arena.key)}
                                  onMouseLeave={() => setHoveredBadge(null)}
                                >
                                  <span>{arena.label}</span>
                                  <ExternalLink size={11} color="#94a3b8" />

                                  {hoveredBadge === arena.key && (
                                    <div className="deck-tooltip">
                                      <h5>{arena.label}</h5>
                                      {getHoverStats(arena.key, current).map((row) => (
                                        <div key={row.label} className="deck-tooltip-row">
                                          <span>{row.label}</span>
                                          <b>{row.value}</b>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </a>
                              ))}
                          </div>
                        )}

                        <div className="vertical-card-actions">
                          <button type="button" onClick={() => setIsCardFlipped(true)} className="outline-btn">
                            <RotateCw size={14} /> FLIP DETAILS
                          </button>

                          {user?.id === current.id ? (
                            <Link to="/profile" className="outline-btn">
                              EDIT MY ID
                            </Link>
                          ) : sentMap[current.id]?.status === 'accepted' ? (
                            <span className="outline-btn" style={{ borderColor: '#10b981', color: '#86efac' }}>
                              <Check size={14} /> CONNECTED
                            </span>
                          ) : sentMap[current.id]?.status === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(current.id)}
                              className="outline-btn"
                              style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)' }}
                            >
                              <Clock size={14} /> REQUESTED
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConnect(current.id)}
                              className="connect-primary-btn"
                            >
                              <UserPlus size={14} /> CONNECT
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: SKILLS, INTERESTS & CLUB / HOSTEL DETAILS */}
                  <div className="vertical-face vertical-face-back">
                    <div className={`vertical-card-shell ${current.is_verified ? 'is-verified' : ''}`}>
                      <div className="vertical-card-inner" style={{ textAlign: 'left', alignItems: 'stretch' }}>
                        <div className="vertical-card-top">
                          <span>DOSSIER DETAILS</span>
                          <button type="button" onClick={() => setIsCardFlipped(false)} className="outline-btn">
                            <RotateCw size={13} /> FRONT
                          </button>
                        </div>

                        {primaryRole && (
                          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award size={15} /> {primaryRole}
                          </div>
                        )}

                        {vis.hostel && current.hostel_block && (
                          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            HOSTEL: <b>{current.hostel_block}</b> {current.room_number ? `• ${current.room_number}` : ''}
                          </div>
                        )}

                        {vis.skills && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', color: '#94a3b8', marginBottom: '0.6rem' }}>
                              TECH SKILLS
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                              {Array.isArray(current.skills) && current.skills.length > 0 ? (
                                current.skills.map((sk) => (
                                  <span key={sk} className="deck-platform-chip" style={{ cursor: 'default' }}>
                                    {sk}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>—</span>
                              )}
                            </div>
                          </div>
                        )}

                        {vis.interests && (
                          <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.14em', color: '#94a3b8', marginBottom: '0.6rem' }}>
                              INTERESTS
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                              {Array.isArray(current.interests) && current.interests.length > 0 ? (
                                current.interests.map((it) => (
                                  <span key={it} className="deck-platform-chip" style={{ borderColor: 'rgba(56, 213, 232, 0.3)', cursor: 'default' }}>
                                    {it}
                                  </span>
                                ))
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>—</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="vertical-card-actions">
                          <button type="button" onClick={() => setIsCardFlipped(false)} className="outline-btn">
                            <RotateCw size={14} /> BACK TO ID FRONT
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT FLANKING CARD */}
              {nextStudent && filtered.length > 2 && (
                <div className="wing-preview-card wing-right" onClick={goNext}>
                  {nextStudent.cutout_url ? (
                    <img src={nextStudent.cutout_url} alt={nextStudent.full_name} className="wing-avatar" />
                  ) : (
                    <div className="wing-avatar">
                      <ShieldCheck size={34} color="#38d5e8" />
                    </div>
                  )}
                  <strong style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>
                    {nextStudent.full_name}
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: '#38d5e8', marginTop: '4px', fontWeight: 700 }}>
                    {nextStudent.branch || 'IIITNR'}
                  </span>
                </div>
              )}
            </div>

            {filtered.length > 1 && (
              <>
                <div className="deck-nav-controls">
                  <button type="button" className="outline-btn" onClick={goPrev}>
                    <ChevronLeft size={16} /> PREV
                  </button>
                  <button type="button" className="outline-btn" onClick={goNext}>
                    NEXT <ChevronRight size={16} />
                  </button>
                </div>

                {/* QUICK-JUMP AVATAR ORBIT DOCK */}
                <div className="avatar-orbit-dock">
                  {filtered.map((peer, idx) => (
                    <button
                      key={peer.id}
                      type="button"
                      title={peer.full_name}
                      onClick={() => {
                        setSlideDir(idx >= safeIndex ? 'next' : 'prev');
                        setActiveIndex(idx);
                      }}
                      className={`orbit-avatar-dot ${idx === safeIndex ? 'active' : ''}`}
                    >
                      {peer.cutout_url ? (
                        <img src={peer.cutout_url} alt={peer.full_name} />
                      ) : (
                        (peer.full_name || 'S').slice(0, 2).toUpperCase()
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          loadDirectoryAndConnections();
        }}
      />
    </div>
  );
}