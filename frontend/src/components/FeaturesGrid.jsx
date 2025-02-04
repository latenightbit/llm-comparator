// src/components/FeaturesGrid.jsx
import React from 'react';

const featuresData = [
  {
    icon: '📊',
    title: 'Multi-Provider Estimates',
    description: 'Instantly calculate usage costs for GPT-4, Claude, Cohere, and custom open-source LLMs.'
  },
  {
    icon: '⚡',
    title: 'Fast & Intuitive',
    description: 'No complicated spreadsheets needed. Quickly tweak your token inputs and see results.'
  },
  {
    icon: '🚀',
    title: 'Benchmark Leaderboard',
    description: 'Compare performance metrics across different models, from MMLU to HumanEval.'
  },
  {
    icon: '🔒',
    title: 'Privacy-Focused',
    description: 'We don’t store your queries; all data is fetched in real-time from official sources.'
  },
  {
    icon: '🛠',
    title: 'Custom Providers',
    description: 'Easily add your own rates or local GPU cost for a truly comprehensive comparison.'
  },
  {
    icon: '💾',
    title: 'Saves Your Config',
    description: 'All custom providers and token presets are stored locally, so you never lose them.'
  }
];

const FeaturesGrid = () => {
  return (
    <section className="container" style={{ padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>A New Way to Manage LLM Costs</h2>
        <p style={{ fontSize: '1rem', color: '#444', maxWidth: '680px', margin: '1rem auto' }}>
          Don’t let hidden fees catch you off guard. Our cost calculator empowers you with clear insights to build the most cost-effective AI solutions.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {featuresData.map((feat, idx) => (
          <div key={idx} style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: '#fff'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{feat.icon}</div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {feat.title}
            </h4>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '1.4' }}>
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;