import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

const NotFound = () => {
  useSEO({
    title: '404 - Page Not Found | That Software House',
    description: 'The page you are looking for does not exist.',
  });

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, marginBottom: '0.5rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#888', marginBottom: '2rem' }}>
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 2rem',
          background: '#0a0a0a',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
