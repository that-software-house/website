import React, { useState } from 'react';
import { Zap, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import './UsageBanner.css';

const UsageBanner = () => {
  const { user, usage, signOut, isAuthenticated, isPremium } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const usagePercent = (usage.used / usage.limit) * 100;
  const isLow = usage.remaining <= 3;
  const isExhausted = usage.remaining === 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      <div className={`usage-banner ${isExhausted ? 'exhausted' : isLow ? 'low' : ''}`}>
        <div className="usage-banner-content">
          <div className="usage-info">
            <Zap size={16} />
            <span className="usage-text">
              <strong>{usage.remaining}</strong> of {usage.limit} requests remaining today
            </span>
            {isPremium && (
              <span className="premium-badge">
                <Crown size={12} />
                Premium
              </span>
            )}
          </div>

          <div className="usage-bar">
            <div
              className="usage-bar-fill"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="usage-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User size={16} />
                <span>{user.email?.split('@')[0]}</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-email">{user.email}</span>
                    {isPremium ? (
                      <span className="tier-badge premium">Premium</span>
                    ) : (
                      <span className="tier-badge free">Free Tier</span>
                    )}
                  </div>
                  <button className="user-dropdown-item" onClick={handleSignOut}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="usage-signin-btn"
              onClick={() => setShowAuthModal(true)}
            >
              Sign in for more
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default UsageBanner;
