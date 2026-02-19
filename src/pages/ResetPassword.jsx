import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import './ResetPassword.css';

const ResetPassword = () => {
  useSEO({
    title: 'Reset Password | That Software House',
    description: 'Set a new password for your That Software House account.',
  });

  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isActive = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isActive) return;
      setHasRecoverySession(Boolean(session));
      setCheckingSession(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setHasRecoverySession(Boolean(session));
        setCheckingSession(false);
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(password);
      setSuccess('Password updated successfully. Redirecting...');
      setTimeout(() => navigate('/projects/invoice-chaser', { replace: true }), 1200);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        <h1>Set a new password</h1>
        <p>Use a new password to secure your account and continue.</p>

        {checkingSession && (
          <div className="reset-password-info">
            <Loader2 size={16} className="reset-password-spinner" />
            <span>Validating reset link...</span>
          </div>
        )}

        {!checkingSession && !hasRecoverySession && (
          <div className="reset-password-notice error">
            <AlertCircle size={16} />
            <span>This reset link is invalid or expired. Request a new one from Sign in.</span>
          </div>
        )}

        {error && (
          <div className="reset-password-notice error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="reset-password-notice success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <label>
            <span>New password</span>
            <div className="reset-password-input">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                minLength={6}
                required
                disabled={!hasRecoverySession || saving || checkingSession}
              />
            </div>
          </label>

          <label>
            <span>Confirm password</span>
            <div className="reset-password-input">
              <Lock size={16} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                minLength={6}
                required
                disabled={!hasRecoverySession || saving || checkingSession}
              />
            </div>
          </label>

          <button
            type="submit"
            className="reset-password-submit"
            disabled={!hasRecoverySession || saving || checkingSession}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="reset-password-spinner" />
                Updating...
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>

        <Link className="reset-password-back" to="/">
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default ResetPassword;
