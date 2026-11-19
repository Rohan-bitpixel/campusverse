import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Fingerprint, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'signup' | 'forgot'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setMsg({ type: '', text: '' });
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSubmitting(true);

    try {
      if (authMode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setMsg({ type: 'error', text: error.message });
        } else {
          setMsg({ type: 'success', text: 'Reset link sent to your @iiitnr.edu.in inbox.' });
        }
      } else if (authMode === 'signup') {
        const { error } = await signUp({
          email,
          password,
          fullName
        });
        if (error) {
          setMsg({ type: 'error', text: error.message });
        } else {
          setMsg({ type: 'success', text: 'ID created. Pending admin verification.' });
          onSuccess?.();
        }
      } else {
        const { error } = await signIn({ email, password });
        if (error) {
          setMsg({ type: 'error', text: error.message });
        } else {
          onSuccess?.();
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="crystal-auth-backdrop" onClick={onClose}>
      <div
        className="crystal-auth-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="crystal-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="crystal-auth-header">
          <div className="crystal-auth-badge">
            <Fingerprint size={26} />
          </div>
          <h2>IIITNR ACCESS</h2>
          <p>@iiitnr.edu.in</p>
        </div>

        {authMode !== 'forgot' && (
          <div className="crystal-auth-tabs">
            <button
              type="button"
              className={`crystal-auth-tab ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signin');
                setMsg({ type: '', text: '' });
              }}
            >
              SIGN IN
            </button>
            <button
              type="button"
              className={`crystal-auth-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup');
                setMsg({ type: '', text: '' });
              }}
            >
              REGISTER
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {authMode === 'signup' && (
            <div className="crystal-auth-group">
              <label>Full Name</label>
              <input
                type="text"
                required
                className="crystal-auth-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="crystal-auth-group">
            <label>Institute Email</label>
            <input
              type="email"
              required
              className="crystal-auth-input"
              placeholder="name@iiitnr.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {authMode !== 'forgot' && (
            <div className="crystal-auth-group">
              <label>Password</label>
              <div className="crystal-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="crystal-auth-input"
                  style={{ paddingRight: '2.6rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="crystal-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {authMode === 'signin' && (
            <div className="crystal-forgot-row">
              <button
                type="button"
                className="crystal-link-btn"
                onClick={() => {
                  setAuthMode('forgot');
                  setMsg({ type: '', text: '' });
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {msg.text && (
            <div className={`crystal-auth-alert ${msg.type === 'error' ? 'error' : ''}`}>
              {msg.text}
            </div>
          )}

          <button type="submit" disabled={submitting} className="crystal-auth-submit">
            {submitting
              ? 'WAIT...'
              : authMode === 'forgot'
              ? 'SEND RESET LINK'
              : authMode === 'signin'
              ? 'ENTER'
              : 'CREATE ID'}
          </button>

          {authMode === 'forgot' && (
            <div style={{ textAlign: 'center', marginTop: '0.95rem' }}>
              <button
                type="button"
                className="crystal-link-btn"
                onClick={() => {
                  setAuthMode('signin');
                  setMsg({ type: '', text: '' });
                }}
              >
                Back
              </button>
            </div>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}