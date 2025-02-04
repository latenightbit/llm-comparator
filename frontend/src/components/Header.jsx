// src/components/Header.jsx
import React from 'react';

const Header = ({ showLeaderboard, toggleShowLeaderboard }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '1.8rem', color: '#1a1a1a' }}>
        LLM Cost Calculator
      </h1>
      <button
        onClick={toggleShowLeaderboard}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3182ce',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.95rem',
          cursor: 'pointer'
        }}
      >
        {showLeaderboard ? "Hide Leaderboard" : "Show Leaderboard"}
      </button>
    </div>
  );
};

export default Header;