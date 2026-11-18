import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  CalendarPlus,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  FileUp,
  Fingerprint,
  GraduationCap,
  Inbox,
  Layers,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  RotateCw,
  Save,
  ShieldCheck,
  Sliders,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import './MyProfile.css';

const PRODUCTION_APP_URL = (import.meta.env.VITE_APP_URL || 'https://campusverse-trqc.vercel.app').replace(/\/$/, '');

const RECOMMENDED_SKILLS = [
  'Java', 'Python', 'React', 'Three.js', 'C++', 'SQL',
  'Machine Learning', 'Django', 'Node.js', 'UI/UX', 'Docker', 'DSA'
];

const RECOMMENDED_INTERESTS = [
  'AI Research', '5K Running', 'CTF', 'Hackathons', 'Chess', 'Open Source'
];

const VIBE_STATUS_OPTIONS = [
  'OPEN TO HACK',
  'BUILDING',
  'GRINDING DSA',
  'RESEARCH',
  'FREE TO CHILL'
];

const PLATFORM_OPTIONS = [
  {
    key: 'leetcode_username',
    label: 'LeetCode',
    placeholder: 'handle',
    getUrl: (h) => `https://leetcode.com/u/${h}/`
  },
  {
    key: 'codeforces_username',
    label: 'Codeforces',
    placeholder: 'handle',
    getUrl: (h) => `https://codeforces.com/profile/${h}`
  },
  {
    key: 'codechef_username',
    label: 'CodeChef',
    placeholder: 'handle',
    getUrl: (h) => `https://www.codechef.com/users/${h}`
  },
  {
    key: 'github_username',
    label: 'GitHub',
    placeholder: 'username',
    getUrl: (h) => `https://github.com/${h}`
  },
  {
    key: 'chesscom_username',
    label: 'Chess.com',
    placeholder: 'username',
    getUrl: (h) => `https://www.chess.com/member/${h}`
  },
  {
    key: 'lichess_username',
    label: 'Lichess',
    placeholder: 'username',
    getUrl: (h) => `https://lichess.org/@/${h}`
  },
  {
    key: 'valorant_riot_id',
    label: 'Valorant',
    placeholder: 'Name#TAG',
    getUrl: (h) => `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(h)}/overview`
  }
];

const DEFAULT_VISIBILITY = {
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

const VISIBILITY_LABELS = [
  { key: 'roll', label: 'ROLL TAG' },
  { key: 'academic', label: 'BRANCH & SEM' },
  { key: 'status', label: 'LIVE STATUS' },
  { key: 'bio', label: '2-LINE TAGLINE' },
  { key: 'skills', label: 'TECH SKILLS' },
  { key: 'interests', label: 'INTERESTS' },
  { key: 'arenas', label: 'ARENA BADGES' },
  { key: 'linkedin', label: 'LINKEDIN BADGE' },
  { key: 'hostel', label: 'HOSTEL BLOCK' }
];

const BRANCH_OPTIONS = ['DSAI', 'CSE', 'ECE'];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const EVENT_CATEGORIES = [
  'Seminar',
  'Orientation',
  'Counseling',
  'Workshop',
  'Hackathon',
  'Talk',
  'Competition',
  'Fest',
  'Other'
];

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

async function fetchLivePlatformTelemetry(handles) {
  const result = {};
  const tasks = [];

  if (handles.leetcode_username) {
    tasks.push(
      fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(handles.leetcode_username)}/solved`)
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
      fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(handles.leetcode_username)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.ranking) result.leetcode_global_rank = `#${d.ranking}`;
        })
        .catch(() => {})
    );
  }

  if (handles.codeforces_username) {
    tasks.push(
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handles.codeforces_username)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const u = d?.result?.[0];
          if (u) {
            result.codeforces_rating = u.rating ?? 'Unrated';
            result.codeforces_rank = u.rank ? u.rank.toUpperCase() : 'NEWBIE';
            result.codeforces_max = u.maxRating ?? '—';
          }
        })
        .catch(() => {})
    );
  }

  if (handles.codechef_username) {
    tasks.push(
      fetch(`https://codechef-api.vercel.app/handle/${encodeURIComponent(handles.codechef_username)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.currentRating) {
            result.codechef_rating = d.currentRating;
            result.codechef_stars = d.stars || '—';
            result.codechef_max_rating = d.highestRating || '—';
          }
        })
        .catch(() => {})
    );
  }

  if (handles.github_username) {
    tasks.push(
      fetch(`https://api.github.com/users/${encodeURIComponent(handles.github_username)}`)
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

  if (handles.chesscom_username) {
    tasks.push(
      fetch(`https://api.chess.com/pub/player/${encodeURIComponent(handles.chesscom_username.toLowerCase())}/stats`)
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

  if (handles.lichess_username) {
    tasks.push(
      fetch(`https://lichess.org/api/user/${encodeURIComponent(handles.lichess_username)}`)
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

export default function MyProfilePage() {
  const { user, profile, loading, signIn, signUp, resetPassword, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // 3D Tilt, Glass Spotlight & Card Flip State
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, active: false });

  const handleCardMouseMove = (e) => {
    if (isFlipped) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCardTilt({
      rotateX: ((y / rect.height) - 0.5) * -5,
      rotateY: ((x / rect.width) - 0.5) * 5,
      glowX: (x / rect.width) * 100,
      glowY: (y / rect.height) * 100,
      active: true
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, active: false });
  };

  // Time & Scan-Limited QR Pass State
  const [qrPass, setQrPass] = useState(null);
  const [qrDurationMins, setQrDurationMins] = useState(30);
  const [qrMaxScans, setQrMaxScans] = useState(5);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  // Connect & Collab Team Requests Inbox State
  const [inboxOpen, setInboxOpen] = useState(false);
  const [inboxTab, setInboxTab] = useState('incoming');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);

  // Auth fallback state
  const [authMode, setAuthMode] = useState('signin');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' });
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const hydratedProfileIdRef = useRef(null);

  // Profile & Live API Telemetry State
  const [stats, setStats] = useState({});
  const [syncingStats, setSyncingStats] = useState(false);
  const [hoveredBadge, setHoveredBadge] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState({ type: '', text: '' });

  // Club Head / Admin Event Publisher state
  const [myEvents, setMyEvents] = useState([]);
  const [eventMediaFiles, setEventMediaFiles] = useState([]);
  const [publishingEvent, setPublishingEvent] = useState(false);
  const [eventBanner, setEventBanner] = useState({ type: '', text: '' });
  const [eventForm, setEventForm] = useState({
    title: '',
    club_name: '',
    category: 'Seminar',
    venue: '',
    start_time: '',
    registration_link: '',
    entry_type: 'Free',
    description: ''
  });

  // Admin Console state
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [adminBanner, setAdminBanner] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    full_name: '',
    roll_number: '',
    branch: '',
    batch_year: '',
    semester: '',
    current_status: 'OPEN TO HACK',
    bio: '',
    skills: [],
    club_roles: '',
    interests: [],
    hostel_block: '',
    room_number: '',
    phone_number: '',
    show_contact: false,
    linkedin_url: '',
    github_username: '',
    leetcode_username: '',
    codechef_username: '',
    codeforces_username: '',
    chesscom_username: '',
    lichess_username: '',
    valorant_riot_id: '',
    card_visibility: { ...DEFAULT_VISIBILITY }
  });

  const userRole = profile?.role || (profile?.is_admin ? 'admin' : 'user');
  const canPublishEvents = userRole === 'head' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const syncAllLiveTelemetry = async (handleMap, userId) => {
    setSyncingStats(true);
    try {
      const live = await fetchLivePlatformTelemetry(handleMap);
      if (Object.keys(live).length > 0) {
        setStats((prev) => ({ ...prev, ...live }));
        if (userId) {
          await supabase.from('platform_stats').upsert(
            {
              user_id: userId,
              leetcode_solved: live.leetcode_solved ?? null,
              leetcode_global_rank: live.leetcode_global_rank ?? null,
              codeforces_rating: typeof live.codeforces_rating === 'number' ? live.codeforces_rating : null,
              codeforces_rank: live.codeforces_rank ?? null,
              codechef_rating: typeof live.codechef_rating === 'number' ? live.codechef_rating : null,
              codechef_stars: live.codechef_stars ?? null,
              github_repos: live.github_repos ?? null,
              chesscom_rapid: typeof live.chesscom_rapid === 'number' ? live.chesscom_rapid : null,
              chesscom_blitz: typeof live.chesscom_blitz === 'number' ? live.chesscom_blitz : null,
              lichess_rapid: typeof live.lichess_rapid === 'number' ? live.lichess_rapid : null,
              lichess_blitz: typeof live.lichess_blitz === 'number' ? live.lichess_blitz : null,
              last_synced_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
          );
        }
      }
    } finally {
      setSyncingStats(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      hydratedProfileIdRef.current = null;
      return;
    }
    if (hydratedProfileIdRef.current === profile.id) return;
    hydratedProfileIdRef.current = profile.id;

    const loadedHandles = {
      github_username: profile.github_username || '',
      leetcode_username: profile.leetcode_username || '',
      codechef_username: profile.codechef_username || '',
      codeforces_username: profile.codeforces_username || '',
      chesscom_username: profile.chesscom_username || '',
      lichess_username: profile.lichess_username || '',
      valorant_riot_id: profile.valorant_riot_id || ''
    };

    setForm({
      full_name: profile.full_name || '',
      roll_number: profile.roll_number || '',
      branch: profile.branch || '',
      batch_year: profile.batch_year ? String(profile.batch_year) : '',
      semester: profile.semester ? String(profile.semester) : '',
      current_status: profile.current_status || 'OPEN TO HACK',
      bio: profile.bio || '',
      skills: Array.isArray(profile.skills) ? profile.skills : [],
      club_roles: (profile.club_roles || []).join(', '),
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      hostel_block: profile.hostel_block || '',
      room_number: profile.room_number || '',
      phone_number: profile.phone_number || '',
      show_contact: Boolean(profile.show_contact),
      linkedin_url: profile.linkedin_url || '',
      ...loadedHandles,
      card_visibility: {
        ...DEFAULT_VISIBILITY,
        ...(profile.card_visibility || {})
      }
    });

    supabase
      .from('platform_stats')
      .select('*')
      .eq('user_id', profile.id)
      .single()
      .then(({ data }) => {
        if (data) setStats((prev) => ({ ...prev, ...data }));
      });

    syncAllLiveTelemetry(loadedHandles, profile.id);
  }, [profile]);

  const fetchConnections = async () => {
    if (!user) return;
    const [{ data: incoming }, { data: outgoing }, { data: collabReqs }] = await Promise.all([
      supabase
        .from('connection_requests')
        .select('id, status, created_at, sender:profiles!connection_requests_sender_id_fkey(id, full_name, branch, roll_number, cutout_url)')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('connection_requests')
        .select('id, status, created_at, receiver:profiles!connection_requests_receiver_id_fkey(id, full_name, branch, roll_number, cutout_url)')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('collab_requests')
        .select('*, team:collab_teams(id, title, lead_id)')
        .neq('requester_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    if (incoming) setIncomingRequests(incoming);
    if (outgoing) setOutgoingRequests(outgoing);
    if (collabReqs) setTeamRequests(collabReqs);
  };

  const fetchQrPass = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('qr_passes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setQrPass(data);
  };

  const fetchEvents = async () => {
    const query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    const { data } = isAdmin ? await query : await query.eq('created_by', user.id);
    if (data) setMyEvents(data);
  };

  const fetchAllUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, roll_number, branch, batch_year, is_verified, role, created_at')
      .order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  useEffect(() => {
    if (!user || !profile) return;
    fetchConnections();
    fetchQrPass();
    if (canPublishEvents) fetchEvents();
    if (isAdmin) fetchAllUsers();
  }, [user, profile, canPublishEvents, isAdmin]);

  const handleGenerateQrPass = async () => {
    if (!user) return;
    setQrGenerating(true);
    try {
      const randomToken = `${user.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + Number(qrDurationMins) * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('qr_passes')
        .upsert(
          {
            user_id: user.id,
            token: randomToken,
            expires_at: expiresAt,
            max_scans: Number(qrMaxScans) || 5,
            scans_used: 0,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (!error && data) setQrPass(data);
    } finally {
      setQrGenerating(false);
    }
  };

  const handleStopQrPass = async () => {
    if (!user) return;
    setQrGenerating(true);
    try {
      await supabase.from('qr_passes').delete().eq('user_id', user.id);
      setQrPass(null);
    } finally {
      setQrGenerating(false);
    }
  };

  const handleRespondConnection = async (reqId, newStatus) => {
    const { error } = await supabase
      .from('connection_requests')
      .update({ status: newStatus })
      .eq('id', reqId);
    if (!error) {
      setIncomingRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
      );
    }
  };

  const handleWithdrawConnection = async (reqId) => {
    const { error } = await supabase
      .from('connection_requests')
      .delete()
      .eq('id', reqId);
    if (!error) {
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== reqId));
    }
  };

  const handleRespondTeamRequest = async (reqItem, decision) => {
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
      setTeamRequests((prev) =>
        prev.map((r) => (r.id === reqItem.id ? { ...r, status: decision } : r))
      );
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMsg({ type: '', text: '' });
    setAuthSubmitting(true);

    try {
      if (authMode === 'forgot') {
        const { error } = await resetPassword(authEmail);
        if (error) {
          setAuthMsg({ type: 'error', text: error.message });
        } else {
          setAuthMsg({ type: 'success', text: 'Reset link sent to your @iiitnr.edu.in inbox.' });
        }
      } else if (authMode === 'signup') {
        const { error } = await signUp({
          email: authEmail,
          password: authPassword,
          fullName: authName
        });
        if (error) {
          setAuthMsg({ type: 'error', text: error.message });
        } else {
          setAuthMsg({ type: 'success', text: 'Confirm your @iiitnr.edu.in email link, then sign in.' });
        }
      } else {
        const { error } = await signIn({ email: authEmail, password: authPassword });
        if (error) setAuthMsg({ type: 'error', text: error.message });
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleUpdateRecoveredPassword = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (!error) {
        setIsRecoveryMode(false);
        setNewPassword('');
        setBanner({ type: 'success', text: 'Password updated.' });
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTaglineChange = (rawVal) => {
    const lines = rawVal.split('\n');
    const clamped = lines.slice(0, 2).map((line) => line.slice(0, 68)).join('\n');
    updateField('bio', clamped);
  };

  const toggleVisibilityKey = (visKey) => {
    setForm((prev) => ({
      ...prev,
      card_visibility: {
        ...prev.card_visibility,
        [visKey]: !prev.card_visibility[visKey]
      }
    }));
  };

  const addSkill = (rawSkill) => {
    const cleaned = rawSkill.trim();
    if (!cleaned || form.skills.includes(cleaned)) return;
    updateField('skills', [...form.skills, cleaned]);
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    updateField('skills', form.skills.filter((s) => s !== skillToRemove));
  };

  const addInterest = (rawInterest) => {
    const cleaned = rawInterest.trim();
    if (!cleaned || form.interests.includes(cleaned)) return;
    updateField('interests', [...form.interests, cleaned]);
    setInterestInput('');
  };

  const removeInterest = (interestToRemove) => {
    updateField('interests', form.interests.filter((i) => i !== interestToRemove));
  };

  const deletePreviousCutoutFromStorage = async (cutoutUrl) => {
    if (!cutoutUrl || !cutoutUrl.includes('/cutouts/')) return;
    const oldStoragePath = cutoutUrl.split('/cutouts/')[1]?.split('?')[0];
    if (oldStoragePath) {
      await supabase.storage.from('cutouts').remove([decodeURIComponent(oldStoragePath)]);
    }
  };

  const handleCutoutUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setBanner({ type: 'error', text: 'PNG, JPG, JPEG, or WebP only.' });
      return;
    }

    setUploading(true);
    setBanner({ type: '', text: '' });

    try {
      await deletePreviousCutoutFromStorage(profile?.cutout_url);

      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/cutout-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('cutouts')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cutouts')
        .getPublicUrl(filePath);

      const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ cutout_url: freshUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (dbError) throw dbError;

      await refreshProfile();
      setBanner({ type: 'success', text: 'Photo updated.' });
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveCutout = async () => {
    if (!user || !profile?.cutout_url) return;
    setUploading(true);
    try {
      await deletePreviousCutoutFromStorage(profile.cutout_url);
      await supabase
        .from('profiles')
        .update({ cutout_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      await refreshProfile();
      setBanner({ type: 'success', text: 'Photo removed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDossier = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setBanner({ type: '', text: '' });

    const toArray = (str) =>
      str
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        roll_number: form.roll_number.trim() || null,
        branch: form.branch || null,
        batch_year: form.batch_year ? Number(form.batch_year) : null,
        semester: form.semester ? Number(form.semester) : null,
        current_status: form.current_status || null,
        bio: form.bio.trim(),
        skills: form.skills,
        club_roles: toArray(form.club_roles),
        interests: form.interests,
        hostel_block: form.hostel_block.trim() || null,
        room_number: form.room_number.trim() || null,
        phone_number: form.phone_number.trim() || null,
        show_contact: form.card_visibility.hostel,
        linkedin_url: form.linkedin_url.trim() || null,
        github_username: form.github_username.trim() || null,
        leetcode_username: form.leetcode_username.trim() || null,
        codechef_username: form.codechef_username.trim() || null,
        codeforces_username: form.codeforces_username.trim() || null,
        chesscom_username: form.chesscom_username.trim() || null,
        lichess_username: form.lichess_username.trim() || null,
        valorant_riot_id: form.valorant_riot_id.trim() || null,
        card_visibility: form.card_visibility,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      await syncAllLiveTelemetry(form, user.id);
      await refreshProfile();
      setBanner({ type: 'success', text: 'Saved & Telemetry Synced.' });
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishEvent = async (e) => {
    e.preventDefault();
    if (!user || !canPublishEvents) return;

    setPublishingEvent(true);
    setEventBanner({ type: '', text: '' });

    try {
      const uploadedUrls = [];
      let firstImageUrl = null;

      for (let i = 0; i < eventMediaFiles.length; i += 1) {
        const file = eventMediaFiles[i];
        const ext = file.name.split('.').pop();
        const mediaPath = `${user.id}/event-${Date.now()}-${i}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('event-media')
          .upload(mediaPath, file, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: pubData } = supabase.storage
          .from('event-media')
          .getPublicUrl(mediaPath);

        uploadedUrls.push(pubData.publicUrl);
        if (!firstImageUrl && file.type?.startsWith('image/')) {
          firstImageUrl = pubData.publicUrl;
        }
      }

      const { error: insertErr } = await supabase.from('events').insert({
        title: eventForm.title.trim(),
        club_name: eventForm.club_name.trim(),
        category: eventForm.category,
        venue: eventForm.venue.trim() || null,
        start_time: new Date(eventForm.start_time).toISOString(),
        registration_link: eventForm.registration_link.trim() || null,
        entry_type: eventForm.entry_type,
        description: eventForm.description.trim() || null,
        banner_url: firstImageUrl,
        media_url: uploadedUrls[0] || null,
        media_urls: uploadedUrls,
        created_by: user.id
      });

      if (insertErr) throw insertErr;

      setEventForm({
        title: '',
        club_name: '',
        category: 'Seminar',
        venue: '',
        start_time: '',
        registration_link: '',
        entry_type: 'Free',
        description: ''
      });
      setEventMediaFiles([]);
      setEventBanner({ type: 'success', text: 'Published.' });
      fetchEvents();
    } catch (err) {
      setEventBanner({ type: 'error', text: err.message || 'Publish failed.' });
    } finally {
      setPublishingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) {
      setMyEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    }
  };

  const handleAdminUpdateUser = async (targetUserId, updates) => {
    setAdminBanner({ type: '', text: '' });
    const payload = { ...updates };
    if ('role' in updates) {
      payload.is_admin = updates.role === 'admin';
    }

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', targetUserId);

    if (error) {
      setAdminBanner({ type: 'error', text: error.message });
    } else {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, ...payload } : u))
      );
      if (targetUserId === user.id) refreshProfile();
      setAdminBanner({ type: 'success', text: 'Updated.' });
    }
  };

  const handleAdminDeleteUser = async (targetUser) => {
    if (!targetUser || targetUser.id === user?.id) return;
    const confirmed = window.confirm(
      `Permanently delete ${targetUser.full_name || targetUser.email} from CampusVerse? This removes their login account, ID card, connections, and team records.`
    );
    if (!confirmed) return;

    setAdminBanner({ type: '', text: '' });

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('cutout_url')
      .eq('id', targetUser.id)
      .single();

    if (targetProfile?.cutout_url) {
      await deletePreviousCutoutFromStorage(targetProfile.cutout_url);
    }

    const { error } = await supabase.rpc('admin_delete_student', {
      target_user_id: targetUser.id
    });

    if (error) {
      setAdminBanner({ type: 'error', text: error.message });
    } else {
      setAllUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setAdminBanner({
        type: 'success',
        text: `Removed ${targetUser.full_name || targetUser.email}.`
      });
    }
  };

  const activePlatforms = PLATFORM_OPTIONS.filter((p) => Boolean(form[p.key])).map((p) => ({
    ...p,
    handle: form[p.key].trim()
  }));

  const primaryRole = form.club_roles
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean)[0];

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const pendingTeamCount = teamRequests.filter((r) => r.status === 'pending').length;
  const totalBadgeCount = pendingIncomingCount + pendingTeamCount;

  const vis = form.card_visibility;

  const signalChecks = [
    Boolean(form.full_name.trim()),
    Boolean(form.roll_number.trim()),
    Boolean(form.branch),
    Boolean(form.semester),
    Boolean(profile?.cutout_url),
    form.skills.length > 0,
    activePlatforms.length > 0,
    Boolean(form.bio.trim())
  ];
  const signalPercent = Math.round((signalChecks.filter(Boolean).length / signalChecks.length) * 100);

  const isQrActive =
    Boolean(qrPass) &&
    new Date(qrPass.expires_at) > new Date() &&
    qrPass.scans_used < qrPass.max_scans;

  const qrShareUrl = isQrActive
    ? `${PRODUCTION_APP_URL}/id/${qrPass.token}`
    : `${PRODUCTION_APP_URL}/profile`;

  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(qrShareUrl)}`;

  const formattedLinkedinUrl = form.linkedin_url.trim()
    ? form.linkedin_url.trim().startsWith('http')
      ? form.linkedin_url.trim()
      : `https://${form.linkedin_url.trim()}`
    : '';

  const linkedinSlug = formattedLinkedinUrl
    ? formattedLinkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')
    : '';

  const filteredUsers = allUsers.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.roll_number || '').toLowerCase().includes(q)
    );
  });

  const getTooltipRows = (key) => {
    if (key === 'leetcode_username') {
      return [
        { label: 'HANDLE', value: `@${form.leetcode_username}` },
        { label: 'SOLVED', value: stats?.leetcode_solved ?? (syncingStats ? 'SYNCING...' : '—') },
        {
          label: 'E / M / H',
          value:
            stats?.leetcode_easy != null
              ? `${stats.leetcode_easy} / ${stats.leetcode_medium} / ${stats.leetcode_hard}`
              : '—'
        },
        { label: 'GLOBAL RANK', value: stats?.leetcode_global_rank ?? '—' }
      ];
    }
    if (key === 'codeforces_username') {
      return [
        { label: 'HANDLE', value: `@${form.codeforces_username}` },
        { label: 'RATING', value: stats?.codeforces_rating ?? (syncingStats ? 'SYNCING...' : '—') },
        { label: 'RANK', value: stats?.codeforces_rank ?? '—' },
        { label: 'MAX RATING', value: stats?.codeforces_max ?? '—' }
      ];
    }
    if (key === 'codechef_username') {
      return [
        { label: 'HANDLE', value: `@${form.codechef_username}` },
        { label: 'RATING', value: stats?.codechef_rating ?? (syncingStats ? 'SYNCING...' : '—') },
        { label: 'STARS', value: stats?.codechef_stars ?? '—' }
      ];
    }
    if (key === 'github_username') {
      return [
        { label: 'USER', value: `@${form.github_username}` },
        { label: 'PUBLIC REPOS', value: stats?.github_repos ?? (syncingStats ? 'SYNCING...' : '—') },
        { label: 'FOLLOWERS', value: stats?.github_followers ?? '—' }
      ];
    }
    if (key === 'chesscom_username') {
      return [
        { label: 'PLAYER', value: `@${form.chesscom_username}` },
        { label: 'RAPID ELO', value: stats?.chesscom_rapid ?? (syncingStats ? 'SYNCING...' : '—') },
        { label: 'BLITZ ELO', value: stats?.chesscom_blitz ?? '—' },
        { label: 'BULLET ELO', value: stats?.chesscom_bullet ?? '—' }
      ];
    }
    if (key === 'lichess_username') {
      return [
        { label: 'PLAYER', value: `@${form.lichess_username}` },
        { label: 'RAPID ELO', value: stats?.lichess_rapid ?? (syncingStats ? 'SYNCING...' : '—') },
        { label: 'BLITZ ELO', value: stats?.lichess_blitz ?? '—' },
        { label: 'BULLET ELO', value: stats?.lichess_bullet ?? '—' }
      ];
    }
    return [
      { label: 'RIOT ID', value: form.valorant_riot_id },
      { label: 'TRACKER', value: 'CLICK TO VIEW' }
    ];
  };

  return (
    <div className="profile-page">
      <div className="ambient-emerald-orb" />
      <div className="ambient-cyan-orb" />

      {/* STICKY TOPBAR */}
      <header className="topbar">
        <Link to="/" className="brand">
          CAMPUS<b>VERSE</b>
        </Link>
        <span>STUDENT IDENTITY</span>

        <div className="topbar-actions">
          <Link to="/" className="outline-btn">
            Home
          </Link>
          {user && (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="outline-btn btn-logout"
            >
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem 1rem', color: 'var(--text-muted)' }}>
          LOADING...
        </div>
      ) : isRecoveryMode ? (
        <div className="auth-wrapper">
          <div className="auth-glass-card">
            <div className="auth-card-header">
              <div className="auth-shield-badge">
                <Fingerprint size={26} />
              </div>
              <h2>RESET PASSWORD</h2>
            </div>
            <form onSubmit={handleUpdateRecoveredPassword}>
              <div className="auth-form-group">
                <label>New Password</label>
                <div className="password-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="auth-input"
                    style={{ paddingRight: '2.6rem' }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={authSubmitting} className="btn-auth-submit">
                {authSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      ) : !user ? (
        /* DIRECT /profile FALLBACK AUTH */
        <div className="auth-wrapper">
          <div className="auth-glass-card">
            <div className="auth-card-header">
              <div className="auth-shield-badge">
                <Fingerprint size={26} />
              </div>
              <h2>IIITNR ACCESS</h2>
              <p>@iiitnr.edu.in</p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signin');
                  setAuthMsg({ type: '', text: '' });
                }}
              >
                SIGN IN
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthMsg({ type: '', text: '' });
                }}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div className="auth-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    className="auth-input"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}

              <div className="auth-form-group">
                <label>Institute Email</label>
                <input
                  type="email"
                  required
                  className="auth-input"
                  placeholder="name@iiitnr.edu.in"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              {authMode !== 'forgot' && (
                <div className="auth-form-group">
                  <label>Password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="auth-input"
                      style={{ paddingRight: '2.6rem' }}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'signin' && (
                <div className="forgot-link-row">
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => {
                      setAuthMode('forgot');
                      setAuthMsg({ type: '', text: '' });
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {authMsg.text && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    marginBottom: '0.85rem',
                    background: authMsg.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${authMsg.type === 'error' ? '#ef4444' : '#38d5e8'}`,
                    color: authMsg.type === 'error' ? '#fca5a5' : '#ffffff'
                  }}
                >
                  {authMsg.text}
                </div>
              )}

              <button type="submit" disabled={authSubmitting} className="btn-auth-submit">
                {authSubmitting
                  ? 'WAIT...'
                  : authMode === 'forgot'
                  ? 'SEND RESET LINK'
                  : authMode === 'signin'
                  ? 'ENTER'
                  : 'CREATE ID'}
              </button>

              {authMode === 'forgot' && (
                <div style={{ textAlign: 'center', marginTop: '0.9rem' }}>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => setAuthMode('signin')}
                  >
                    Back
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* 2. FLOATING 3D FLIPPABLE SMOKED CRYSTAL ID CARD */}
          <div className="showcase-container">
            <div className="id-floating-rig">
              <div className="card-flip-scene">
                <div className={`card-flip-pivot ${isFlipped ? 'is-flipped' : ''}`}>
                  {/* FRONT FACE: STUDENT ID PASS */}
                  <div className="card-face">
                    <div
                      className={`showcase-card-shell ${profile?.is_verified ? 'is-verified' : ''}`}
                      onMouseMove={handleCardMouseMove}
                      onMouseLeave={handleCardMouseLeave}
                      style={{
                        transform: cardTilt.active && !isFlipped
                          ? `perspective(1200px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`
                          : undefined
                      }}
                    >
                      <div className="showcase-card-inner">
                        <div
                          className="id-cursor-spotlight"
                          style={{
                            opacity: cardTilt.active ? 1 : 0,
                            background: `radial-gradient(circle 340px at ${cardTilt.glowX}% ${cardTilt.glowY}%, rgba(255, 255, 255, 0.09), transparent 70%)`
                          }}
                        />
                        <div className="id-biometric-scanline" />
                        <div className="holographic-foil-seal">IIITNR</div>

                        <div className="showcase-topbar">
                          <div className="institute-emblem-badge">
                            <ShieldCheck size={18} style={{ color: '#38d5e8' }} />
                            IIIT NAYA RAIPUR <span>• DIGITAL PASS</span>
                          </div>

                          <div className="topbar-badges-group">
                            <span className={`role-status-pill role-${userRole}`}>
                              <Crown size={13} />
                              {userRole === 'admin' ? 'ADMIN' : userRole === 'head' ? 'CLUB HEAD' : 'STUDENT'}
                            </span>

                            <div className={`verification-status-pill ${profile?.is_verified ? 'verified' : 'unverified'}`}>
                              {profile?.is_verified ? (
                                <>
                                  <CheckCircle2 size={14} /> VERIFIED
                                </>
                              ) : (
                                <>
                                  <Clock size={14} /> UNVERIFIED
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="showcase-main-grid">
                          <div className="cutout-stage-wrapper">
                            <div className="cutout-photo-container">
                              {profile?.cutout_url ? (
                                <img src={profile.cutout_url} alt={form.full_name} className="cutout-image" />
                              ) : (
                                <div className="wa-default-avatar">
                                  <svg viewBox="0 0 128 128" width="160" height="160" fill="none">
                                    <circle cx="64" cy="46" r="24" fill="rgba(255, 255, 255, 0.28)" />
                                    <path
                                      d="M22 118c0-23.2 18.8-42 42-42s42 18.8 42 42"
                                      fill="rgba(255, 255, 255, 0.28)"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {vis.roll && (
                              <div className="cutout-roll-tag">
                                {form.roll_number || 'ID UNASSIGNED'}
                              </div>
                            )}
                          </div>

                          <div className="showcase-content-column">
                            <div className="identity-badges-row">
                              {primaryRole && (
                                <div className="leadership-role-badge">
                                  <Award size={14} /> {primaryRole}
                                </div>
                              )}

                              {vis.status && form.current_status && (
                                <div className="live-vibe-pill">
                                  <span className="live-vibe-dot" />
                                  {form.current_status}
                                </div>
                              )}

                              {vis.hostel && form.hostel_block && (
                                <div className="leadership-role-badge" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                  {form.hostel_block} {form.room_number ? `• ${form.room_number}` : ''}
                                </div>
                              )}
                            </div>

                            <h1 className="hero-giant-name">{form.full_name || 'UNREGISTERED NAME'}</h1>

                            {vis.academic && (
                              <div className="hero-branch-subline">
                                {form.branch ? `B.TECH ${form.branch}` : 'BRANCH UNSET'}
                                <span>•</span>
                                {form.batch_year ? `BATCH ${form.batch_year}` : 'BATCH —'}
                                <span>•</span>
                                {form.semester ? `SEM ${form.semester}` : 'SEM —'}
                              </div>
                            )}

                            {vis.bio && (
                              <p className="hero-bio-copy">
                                {form.bio || '—'}
                              </p>
                            )}

                            {(vis.linkedin || vis.arenas) && (
                              <div className="card-links-strip">
                                {vis.linkedin && formattedLinkedinUrl && (
                                  <a
                                    href={formattedLinkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="deck-platform-chip"
                                    onMouseEnter={() => setHoveredBadge('linkedin')}
                                    onMouseLeave={() => setHoveredBadge(null)}
                                  >
                                    <Briefcase size={15} style={{ color: '#38d5e8' }} />
                                    <span>LINKEDIN</span>
                                    <ExternalLink size={12} style={{ color: '#94a3b8' }} />

                                    {hoveredBadge === 'linkedin' && (
                                      <div className="deck-tooltip">
                                        <h5>LINKEDIN PROFILE</h5>
                                        <div className="deck-tooltip-row">
                                          <span>NAME</span>
                                          <b>{form.full_name || '—'}</b>
                                        </div>
                                        <div className="deck-tooltip-row">
                                          <span>HANDLE</span>
                                          <b>/{linkedinSlug || 'profile'}</b>
                                        </div>
                                        <div className="deck-tooltip-row">
                                          <span>ROLE</span>
                                          <b>{primaryRole || (form.branch ? `B.Tech ${form.branch}` : 'IIITNR')}</b>
                                        </div>
                                      </div>
                                    )}
                                  </a>
                                )}

                                {vis.arenas &&
                                  activePlatforms.map((plat) => (
                                    <a
                                      key={plat.key}
                                      href={plat.getUrl(plat.handle)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="deck-platform-chip"
                                      onMouseEnter={() => setHoveredBadge(plat.key)}
                                      onMouseLeave={() => setHoveredBadge(null)}
                                    >
                                      <span>{plat.label}</span>
                                      <ExternalLink size={12} style={{ color: '#94a3b8' }} />

                                      {hoveredBadge === plat.key && (
                                        <div className="deck-tooltip">
                                          <h5>{plat.label} TELEMETRY</h5>
                                          {getTooltipRows(plat.key).map((row) => (
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
                          </div>
                        </div>

                        {(vis.skills || vis.interests) && (
                          <div className="showcase-lower-deck">
                            {vis.skills && (
                              <div className="deck-pane">
                                <h4>TECH SKILLS</h4>
                                <div className="deck-skills-cluster">
                                  {form.skills.length > 0 ? (
                                    form.skills.map((skill) => (
                                      <span key={skill} className="deck-skill-token">
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: 'var(--text-dark)', fontSize: '0.84rem' }}>—</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {vis.interests && (
                              <div className="deck-pane">
                                <h4>INTERESTS</h4>
                                <div className="deck-skills-cluster">
                                  {form.interests.length > 0 ? (
                                    form.interests.map((item) => (
                                      <span key={item} className="deck-skill-token">
                                        {item}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: 'var(--text-dark)', fontSize: '0.84rem' }}>—</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BACK FACE: BLURRED-WHEN-INACTIVE QR PASS */}
                  <div className="card-face card-face-back">
                    <div className={`showcase-card-shell ${profile?.is_verified ? 'is-verified' : ''}`}>
                      <div className="showcase-card-inner">
                        <div className="showcase-topbar">
                          <div className="institute-emblem-badge">
                            <QrCode size={18} style={{ color: '#38d5e8' }} />
                            QR PASS
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsFlipped(false)}
                            className="outline-btn"
                          >
                            <RotateCw size={14} /> FRONT
                          </button>
                        </div>

                        <div className="qr-back-grid">
                          <div className="qr-frame-box">
                            <div className={`qr-white-plate ${!isQrActive ? 'is-blurred' : ''}`}>
                              <img src={qrImageSrc} alt="Student QR Pass" width={175} height={175} />
                              {!isQrActive && <span className="qr-blur-badge">INACTIVE</span>}
                            </div>
                            <span style={{ fontSize: '0.74rem', letterSpacing: '0.14em', color: 'var(--electric-cyan)', fontWeight: 800 }}>
                              {isQrActive ? qrPass.token : 'NOT SHARING'}
                            </span>
                            {isQrActive && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                SCANS: {qrPass.scans_used} / {qrPass.max_scans} • EXP {new Date(qrPass.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem' }}>
                              ACCESS & SCAN LIMITS
                            </h2>

                            <div className="qr-controls-grid">
                              <div className="auth-form-group">
                                <label>VALID DURATION (MINS)</label>
                                <div className="pill-selector-group">
                                  {[15, 30, 60, 1440].map((mins) => (
                                    <button
                                      key={mins}
                                      type="button"
                                      onClick={() => setQrDurationMins(mins)}
                                      className={`pill-option-btn ${qrDurationMins === mins ? 'selected' : ''}`}
                                    >
                                      {mins === 1440 ? '24H' : `${mins}M`}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="auth-form-group">
                                <label>MAX SCANS</label>
                                <div className="pill-selector-group">
                                  {[1, 5, 15, 50].map((scans) => (
                                    <button
                                      key={scans}
                                      type="button"
                                      onClick={() => setQrMaxScans(scans)}
                                      className={`pill-option-btn ${qrMaxScans === scans ? 'selected' : ''}`}
                                    >
                                      {scans}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={handleGenerateQrPass}
                                disabled={qrGenerating}
                                className="outline-btn"
                              >
                                <RefreshCw size={15} />
                                {qrGenerating ? 'WAIT...' : isQrActive ? 'REGENERATE' : 'START SHARING'}
                              </button>

                              {isQrActive && (
                                <>
                                  <button
                                    type="button"
                                    onClick={handleStopQrPass}
                                    disabled={qrGenerating}
                                    className="outline-btn btn-logout"
                                  >
                                    <X size={15} /> STOP SHARING
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(qrShareUrl);
                                      setCopiedQr(true);
                                      setTimeout(() => setCopiedQr(false), 2000);
                                    }}
                                    className="outline-btn"
                                  >
                                    {copiedQr ? <Check size={15} /> : <Copy size={15} />}
                                    {copiedQr ? 'COPIED' : 'COPY LINK'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING GLASS DOCK */}
          <div className="floating-glass-dock">
            <div className="dock-pill-bar">
              <button
                type="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`dock-action-btn ${isFlipped ? 'active' : ''}`}
              >
                <QrCode size={16} />
                {isFlipped ? 'SHOW ID FRONT' : 'FLIP FOR QR PASS'}
              </button>

              <button
                type="button"
                onClick={() => setInboxOpen((prev) => !prev)}
                className={`dock-action-btn ${inboxOpen ? 'active' : ''}`}
              >
                <Inbox size={16} />
                CONNECT INBOX
                {totalBadgeCount > 0 && (
                  <span className="dock-badge-count">{totalBadgeCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* CONNECT & COLLAB TEAM REQUESTS INBOX */}
          {inboxOpen && (
            <div className="dossier-wrapper">
              <div className="dossier-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div className="auth-tabs" style={{ marginBottom: 0, minWidth: '340px' }}>
                    <button
                      type="button"
                      className={`auth-tab ${inboxTab === 'incoming' ? 'active' : ''}`}
                      onClick={() => setInboxTab('incoming')}
                    >
                      INCOMING ({incomingRequests.length})
                    </button>
                    <button
                      type="button"
                      className={`auth-tab ${inboxTab === 'outgoing' ? 'active' : ''}`}
                      onClick={() => setInboxTab('outgoing')}
                    >
                      OUTGOING ({outgoingRequests.length})
                    </button>
                    <button
                      type="button"
                      className={`auth-tab ${inboxTab === 'team' ? 'active' : ''}`}
                      onClick={() => setInboxTab('team')}
                    >
                      TEAM ({teamRequests.length})
                    </button>
                  </div>

                  <button type="button" onClick={() => setInboxOpen(false)} className="outline-btn">
                    <X size={15} /> CLOSE
                  </button>
                </div>

                {inboxTab === 'incoming' ? (
                  <div className="console-list-grid">
                    {incomingRequests.length === 0 ? (
                      <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem' }}>NO INCOMING REQUESTS</p>
                    ) : (
                      incomingRequests.map((req) => (
                        <div key={req.id} className="console-row-item">
                          <div className="console-row-meta">
                            <strong>
                              {req.sender?.full_name || 'STUDENT'} ({req.sender?.branch || 'UNSET'} • {req.sender?.roll_number || '—'})
                            </strong>
                            <span>STATUS: {req.status.toUpperCase()}</span>
                          </div>

                          <div className="console-row-controls">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRespondConnection(req.id, 'accepted')}
                                  className="verify-toggle-btn is-verified"
                                >
                                  <UserCheck size={14} /> ACCEPT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRespondConnection(req.id, 'declined')}
                                  className="outline-btn btn-logout"
                                >
                                  <UserX size={14} /> DECLINE
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--electric-cyan)' }}>
                                {req.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : inboxTab === 'outgoing' ? (
                  <div className="console-list-grid">
                    {outgoingRequests.length === 0 ? (
                      <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem' }}>NO OUTGOING REQUESTS</p>
                    ) : (
                      outgoingRequests.map((req) => (
                        <div key={req.id} className="console-row-item">
                          <div className="console-row-meta">
                            <strong>
                              {req.receiver?.full_name || 'STUDENT'} ({req.receiver?.branch || 'UNSET'} • {req.receiver?.roll_number || '—'})
                            </strong>
                            <span>STATUS: {req.status.toUpperCase()}</span>
                          </div>

                          <div className="console-row-controls">
                            <button
                              type="button"
                              onClick={() => handleWithdrawConnection(req.id)}
                              className="outline-btn btn-logout"
                            >
                              <Trash2 size={14} /> WITHDRAW
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="console-list-grid">
                    {teamRequests.length === 0 ? (
                      <p style={{ color: 'var(--text-dark)', fontSize: '0.88rem' }}>NO TEAM REQUESTS</p>
                    ) : (
                      teamRequests.map((req) => (
                        <div key={req.id} className="console-row-item">
                          <div className="console-row-meta">
                            <strong>
                              {req.requester_name} → {req.team?.title || 'TEAM'}
                            </strong>
                            <span>
                              PART: {req.desired_role} {req.note ? `• "${req.note}"` : ''} • {req.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="console-row-controls">
                            {req.status === 'pending' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRespondTeamRequest(req, 'accepted')}
                                  className="verify-toggle-btn is-verified"
                                >
                                  <UserCheck size={14} /> ACCEPT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRespondTeamRequest(req, 'rejected')}
                                  className="outline-btn btn-logout"
                                >
                                  <UserX size={14} /> REJECT
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--electric-cyan)' }}>
                                {req.status.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. STACKED GLASS IDENTITY STUDIO */}
          <div className="dossier-wrapper">
            <form onSubmit={handleSaveDossier} className="dossier-card">
              <div className="signal-meter-header">
                <span>SIGNAL INTEGRITY</span>
                <b>{signalPercent}%</b>
              </div>
              <div className="signal-meter-track">
                <div className="signal-meter-fill" style={{ width: `${signalPercent}%` }} />
              </div>

              {banner.text && (
                <div
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: banner.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                    border: `1px solid ${banner.type === 'error' ? '#ef4444' : '#38d5e8'}`,
                    color: banner.type === 'error' ? '#fca5a5' : '#ffffff'
                  }}
                >
                  {banner.text}
                </div>
              )}

              {/* MODULE 01: IDENTITY & 2-LINE TAGLINE */}
              <div className="dossier-section-block">
                <h3>
                  <span><GraduationCap size={19} style={{ color: '#38d5e8', verticalAlign: 'middle', marginRight: '8px' }} /> 01 IDENTITY</span>
                </h3>
                <div className="dossier-grid-3">
                  <div className="auth-form-group">
                    <label>FULL NAME</label>
                    <input
                      type="text"
                      required
                      className="auth-input"
                      value={form.full_name}
                      onChange={(e) => updateField('full_name', e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>ROLL NUMBER</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="261020045"
                      value={form.roll_number}
                      onChange={(e) => updateField('roll_number', e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label>BATCH YEAR</label>
                    <input
                      type="number"
                      className="auth-input"
                      placeholder="2026"
                      value={form.batch_year}
                      onChange={(e) => updateField('batch_year', e.target.value)}
                    />
                  </div>
                </div>

                <div className="dossier-grid-2">
                  <div className="auth-form-group">
                    <label>BRANCH</label>
                    <div className="pill-selector-group">
                      {BRANCH_OPTIONS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => updateField('branch', form.branch === b ? '' : b)}
                          className={`pill-option-btn ${form.branch === b ? 'selected' : ''}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label>SEMESTER</label>
                    <div className="pill-selector-group">
                      {SEMESTER_OPTIONS.map((sem) => (
                        <button
                          key={sem}
                          type="button"
                          onClick={() =>
                            updateField('semester', String(form.semester) === String(sem) ? '' : String(sem))
                          }
                          className={`pill-option-btn ${String(form.semester) === String(sem) ? 'selected' : ''}`}
                        >
                          {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="auth-form-group">
                  <label>LIVE VIBE STATUS</label>
                  <div className="pill-selector-group">
                    {VIBE_STATUS_OPTIONS.map((statusOpt) => (
                      <button
                        key={statusOpt}
                        type="button"
                        onClick={() =>
                          updateField('current_status', form.current_status === statusOpt ? '' : statusOpt)
                        }
                        className={`pill-option-btn ${form.current_status === statusOpt ? 'selected' : ''}`}
                      >
                        {statusOpt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dossier-grid-2">
                  <div className="auth-form-group">
                    <label>PORTRAIT PHOTO</label>
                    <div className="photo-actions-row">
                      <label className="outline-btn" style={{ flex: 1, justifyContent: 'center', padding: '0.78rem' }}>
                        <Camera size={16} />
                        {uploading ? 'WAIT...' : profile?.cutout_url ? 'CHANGE' : 'UPLOAD'}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                          onChange={handleCutoutUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {profile?.cutout_url && (
                        <button
                          type="button"
                          onClick={handleRemoveCutout}
                          disabled={uploading}
                          className="outline-btn btn-logout"
                          style={{ padding: '0.78rem 1rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label>CLUB / E-CELL ROLES</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="E-Cell Ops, SAC"
                      value={form.club_roles}
                      onChange={(e) => updateField('club_roles', e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-form-group" style={{ marginBottom: 0 }}>
                  <label>TAGLINE (MAX 2 LINES)</label>
                  <textarea
                    rows={2}
                    className="auth-input"
                    placeholder={'Basketball | Football | Cyber Security\nBusiness Informatics'}
                    value={form.bio}
                    onChange={(e) => handleTaglineChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && form.bio.includes('\n')) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>

              {/* MODULE 02: CARD DISPLAY VISIBILITY */}
              <div className="dossier-section-block">
                <h3>
                  <span><Layers size={19} style={{ color: '#818cf8', verticalAlign: 'middle', marginRight: '8px' }} /> 02 CARD DISPLAY</span>
                </h3>
                <div className="visibility-chips-grid">
                  {VISIBILITY_LABELS.map((item) => {
                    const active = Boolean(vis[item.key]);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleVisibilityKey(item.key)}
                        className={`visibility-chip-btn ${active ? 'active' : ''}`}
                      >
                        <span>{item.label}</span>
                        {active ? <Eye size={15} style={{ color: '#38d5e8' }} /> : <EyeOff size={15} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MODULE 03: SKILLS & INTERESTS */}
              <div className="dossier-section-block">
                <h3>
                  <span><Cpu size={19} style={{ color: '#38d5e8', verticalAlign: 'middle', marginRight: '8px' }} /> 03 SKILLS & INTERESTS</span>
                </h3>

                <div className="dossier-grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-sub)', marginBottom: '0.45rem' }}>
                      TECH SKILLS
                    </label>
                    <div className="skills-tokenizer-bar">
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Add skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(skillInput);
                          }
                        }}
                      />
                      <button type="button" onClick={() => addSkill(skillInput)} className="outline-btn" aria-label="Add skill">
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="recommendation-chips-bar">
                      {RECOMMENDED_SKILLS.filter((s) => !form.skills.includes(s)).map((rec) => (
                        <button key={rec} type="button" onClick={() => addSkill(rec)} className="rec-chip">
                          + {rec}
                        </button>
                      ))}
                    </div>

                    {form.skills.length > 0 && (
                      <div className="skills-token-tray">
                        {form.skills.map((skill) => (
                          <span key={skill} className="skill-tag-pill">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-sub)', marginBottom: '0.45rem' }}>
                      INTERESTS
                    </label>
                    <div className="skills-tokenizer-bar">
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Add interest..."
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addInterest(interestInput);
                          }
                        }}
                      />
                      <button type="button" onClick={() => addInterest(interestInput)} className="outline-btn" aria-label="Add interest">
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="recommendation-chips-bar">
                      {RECOMMENDED_INTERESTS.filter((item) => !form.interests.includes(item)).map((rec) => (
                        <button key={rec} type="button" onClick={() => addInterest(rec)} className="rec-chip">
                          + {rec}
                        </button>
                      ))}
                    </div>

                    {form.interests.length > 0 && (
                      <div className="skills-token-tray">
                        {form.interests.map((item) => (
                          <span key={item} className="skill-tag-pill">
                            {item}
                            <button type="button" onClick={() => removeInterest(item)}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* MODULE 04: LIVE ARENAS & LINKEDIN */}
              <div className="dossier-section-block">
                <h3>
                  <span><Code2 size={19} style={{ color: '#818cf8', verticalAlign: 'middle', marginRight: '8px' }} /> 04 ARENAS & LINKEDIN</span>
                  <button
                    type="button"
                    onClick={() => syncAllLiveTelemetry(form, user?.id)}
                    disabled={syncingStats}
                    className="outline-btn"
                  >
                    <RefreshCw size={14} /> {syncingStats ? 'SYNCING...' : 'SYNC LIVE STATS'}
                  </button>
                </h3>

                <div className="arena-tiles-grid">
                  {PLATFORM_OPTIONS.map((plat) => {
                    const isLinked = Boolean(form[plat.key]?.trim());
                    return (
                      <div key={plat.key} className={`arena-tile-card ${isLinked ? 'linked' : ''}`}>
                        <div className="arena-tile-top">
                          <span>{plat.label}</span>
                          <span className="arena-status-dot" />
                        </div>
                        <input
                          type="text"
                          className="auth-input"
                          placeholder={plat.placeholder}
                          value={form[plat.key]}
                          onChange={(e) => updateField(plat.key, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="social-input-row">
                  <Briefcase size={18} />
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/in/username"
                    value={form.linkedin_url}
                    onChange={(e) => updateField('linkedin_url', e.target.value)}
                  />
                </div>
              </div>

              {/* MODULE 05: HOSTEL */}
              <div className="dossier-section-block" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <h3>
                  <span><Sliders size={19} style={{ color: '#38d5e8', verticalAlign: 'middle', marginRight: '8px' }} /> 05 HOSTEL</span>
                </h3>
                <div className="dossier-grid-3">
                  <div className="auth-form-group" style={{ marginBottom: 0 }}>
                    <label>HOSTEL BLOCK</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Ramanujan"
                      value={form.hostel_block}
                      onChange={(e) => updateField('hostel_block', e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group" style={{ marginBottom: 0 }}>
                    <label>ROOM NUMBER</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="B-204"
                      value={form.room_number}
                      onChange={(e) => updateField('room_number', e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group" style={{ marginBottom: 0 }}>
                    <label>PHONE</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="+91..."
                      value={form.phone_number}
                      onChange={(e) => updateField('phone_number', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving} className="btn-save-dossier">
                <Save size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                {saving ? 'SAVING...' : 'SAVE'}
              </button>
            </form>
          </div>

          {/* 4. CLUB HEAD & ADMIN EVENT PUBLISHER */}
          {canPublishEvents && (
            <div className="dossier-wrapper">
              <div className="dossier-card">
                <div className="dossier-card-head">
                  <h2>
                    <CalendarPlus size={22} style={{ color: '#38d5e8' }} /> 06 PUBLISH EVENT
                  </h2>
                </div>

                {eventBanner.text && (
                  <div
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      marginBottom: '1.25rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: eventBanner.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${eventBanner.type === 'error' ? '#ef4444' : '#38d5e8'}`,
                      color: eventBanner.type === 'error' ? '#fca5a5' : '#ffffff'
                    }}
                  >
                    {eventBanner.text}
                  </div>
                )}

                <form onSubmit={handlePublishEvent}>
                  <div className="dossier-grid-3">
                    <div className="auth-form-group">
                      <label>TITLE</label>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label>CLUB / BODY</label>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        value={eventForm.club_name}
                        onChange={(e) => setEventForm({ ...eventForm, club_name: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label>CATEGORY</label>
                      <select
                        className="auth-input"
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      >
                        {EVENT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="auth-form-group">
                      <label>DATE & TIME</label>
                      <input
                        type="datetime-local"
                        required
                        className="auth-input"
                        value={eventForm.start_time}
                        onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label>VENUE</label>
                      <input
                        type="text"
                        className="auth-input"
                        value={eventForm.venue}
                        onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label>ATTACHMENTS (MULTIPLE)</label>
                      <label className="outline-btn" style={{ width: '100%', justifyContent: 'center', padding: '0.78rem' }}>
                        <FileUp size={16} />
                        {eventMediaFiles.length > 0 ? `${eventMediaFiles.length} FILE(S) SELECTED` : 'ADD FILES'}
                        <input
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp,.pdf"
                          onChange={(e) => {
                            const picked = Array.from(e.target.files || []);
                            if (picked.length > 0) {
                              setEventMediaFiles((prev) => [...prev, ...picked]);
                            }
                            e.target.value = '';
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {eventMediaFiles.length > 0 && (
                    <div className="skills-token-tray" style={{ marginTop: 0, marginBottom: '1.25rem' }}>
                      {eventMediaFiles.map((file, idx) => (
                        <span key={`${file.name}-${idx}`} className="skill-tag-pill">
                          {file.name.slice(0, 24)}
                          <button
                            type="button"
                            onClick={() =>
                              setEventMediaFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="dossier-grid-2">
                    <div className="auth-form-group">
                      <label>REGISTRATION LINK</label>
                      <input
                        type="url"
                        className="auth-input"
                        value={eventForm.registration_link}
                        onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })}
                      />
                    </div>

                    <div className="auth-form-group">
                      <label>ENTRY</label>
                      <select
                        className="auth-input"
                        value={eventForm.entry_type}
                        onChange={(e) => setEventForm({ ...eventForm, entry_type: e.target.value })}
                      >
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="auth-form-group" style={{ marginBottom: 0 }}>
                    <label>DESCRIPTION</label>
                    <textarea
                      rows={2}
                      className="auth-input"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={publishingEvent} className="btn-save-dossier">
                    {publishingEvent ? 'PUBLISHING...' : 'PUBLISH'}
                  </button>
                </form>

                {myEvents.length > 0 && (
                  <div className="console-list-grid">
                    {myEvents.map((ev) => (
                      <div key={ev.id} className="console-row-item">
                        <div className="console-row-meta">
                          <strong>
                            [{ev.category}] {ev.title} — {ev.club_name}
                          </strong>
                          <span>{new Date(ev.start_time).toLocaleString()}</span>
                        </div>
                        <div className="console-row-controls">
                          {ev.media_url && (
                            <a href={ev.media_url} target="_blank" rel="noopener noreferrer" className="outline-btn">
                              MEDIA
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="outline-btn btn-logout"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. ADMIN VERIFICATION & ROLE CONSOLE */}
          {isAdmin && (
            <div className="dossier-wrapper">
              <div className="dossier-card">
                <div className="dossier-card-head">
                  <h2>
                    <Users size={22} style={{ color: '#818cf8' }} /> 07 ADMIN CONTROL
                  </h2>
                </div>

                {adminBanner.text && (
                  <div
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: adminBanner.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${adminBanner.type === 'error' ? '#ef4444' : '#38d5e8'}`,
                      color: adminBanner.type === 'error' ? '#fca5a5' : '#ffffff'
                    }}
                  >
                    {adminBanner.text}
                  </div>
                )}

                <div className="auth-form-group">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Search name, email, roll..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                <div className="console-list-grid">
                  {filteredUsers.map((student) => {
                    const stRole = student.role || 'user';
                    return (
                      <div key={student.id} className="console-row-item">
                        <div className="console-row-meta">
                          <strong>
                            {student.full_name} ({student.branch || 'UNSET'} • {student.roll_number || '—'})
                          </strong>
                          <span>{student.email}</span>
                        </div>

                        <div className="console-row-controls">
                          <select
                            className="console-select"
                            value={stRole}
                            onChange={(e) => handleAdminUpdateUser(student.id, { role: e.target.value })}
                          >
                            <option value="user">USER</option>
                            <option value="head">CLUB HEAD</option>
                            <option value="admin">ADMIN</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleAdminUpdateUser(student.id, { is_verified: !student.is_verified })}
                            className={`verify-toggle-btn ${student.is_verified ? 'is-verified' : 'not-verified'}`}
                          >
                            {student.is_verified ? (
                              <>
                                <CheckCircle2 size={14} /> VERIFIED
                              </>
                            ) : (
                              <>
                                <Clock size={14} /> VERIFY
                              </>
                            )}
                          </button>
                          {student.id !== user?.id && (
                            <button
                              type="button"
                              onClick={() => handleAdminDeleteUser(student)}
                              className="outline-btn btn-logout"
                              title="Delete student permanently"
                              aria-label={`Delete ${student.full_name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}