// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f9f9f9', padding: '2rem 0', marginTop: '2rem' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: '#777' }}>
          &copy; {new Date().getFullYear()} LLM Cost Calculator. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;