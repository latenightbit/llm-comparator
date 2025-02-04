import React from 'react';

const Header = ({ }) => {
    return (
        <>
            {/* TOP NAV BAR */}
            <header className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 0'
            }}>
                {/* Left: LLM Calc Logo & Name */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="https://via.placeholder.com/40"
                        alt="LLM Calc Logo"
                        style={{ borderRadius: '4px', marginRight: '0.5rem' }}
                    />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>LLM Calculator</h1>
                </div>

                {/* Middle: Nav Items */}
                <nav style={{ flex: '1 1 auto', marginLeft: '2rem' }}>
                    <ul style={{
                        listStyle: 'none',
                        display: 'flex',
                        gap: '1.5rem',
                        fontSize: '1rem'
                    }}>
                        <li style={{ cursor: 'pointer' }}>Providers</li>
                        <li style={{ cursor: 'pointer' }}>Benchmarks</li>
                        <li style={{ cursor: 'pointer' }}>Tutorial</li>
                        <li style={{ cursor: 'pointer' }}>FAQs</li>
                    </ul>
                </nav>

                {/* Right: Leaderboard Toggle - REMOVED */}
            </header>

            {/* HERO SECTION */}
            <section className="container" style={{
                textAlign: 'center',
                padding: '3rem 0'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <span
                        style={{
                            backgroundColor: '#ffe6db',
                            color: '#ff6200',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        Compare top LLMs & optimize your costs
                    </span>
                </div>

                <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Make LLM Costs Crystal Clear
                </h2>
                <p style={{ fontSize: '1.125rem', color: '#444', marginBottom: '2rem' }}>
                    Stop juggling tokens & unpredictable usage fees.<br />
                    Our unified dashboard calculates your LLM costs across multiple providers in seconds.
                </p>

                <button className="btn btn-primary" style={{ fontSize: '1rem' }}>
                    Try the Calculator
                </button>
                <div className="small-text" style={{ marginTop: '0.5rem' }}>
                    Instant cost estimates for GPT-4, Claude, Cohere, & more.
                </div>
            </section>

            {/* BRAND LOGOS ROW (Optional) */}
            <section className="container" style={{
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                    Trusted by teams who deploy large-scale LLMs
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <img src="https://via.placeholder.com/100x40?text=BigCo" alt="BigCo" />
                    <img src="https://via.placeholder.com/60?text=reizoko." alt="reizoko" />
                    <img src="https://via.placeholder.com/80?text=DAKAI" alt="DAKAI" />
                    <img src="https://via.placeholder.com/80?text=Courier" alt="Courier" />
                    <img src="https://via.placeholder.com/110x40?text=UnityML" alt="UnityML" />
                </div>
            </section>

            {/* BLACK SECTION: Developer Pitch */}
            <section style={{
                backgroundColor: '#111',
                color: '#fff',
                padding: '4rem 0',
                textAlign: 'center',
                marginBottom: '3rem'
            }}>
                <div className="container" style={{ maxWidth: '720px' }}>
                    <h3 style={{
                        color: '#4EB3FF',
                        fontWeight: '500',
                        fontSize: '1rem',
                        marginBottom: '1rem'
                    }}>
                        BUILT FOR DEVELOPERS
                    </h3>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        A Single Interface <br /> for All Your LLM Costs
                    </h2>
                    <p style={{ fontSize: '1.125rem', color: '#ccc', marginBottom: '2rem' }}>
                        Whether you’re prototyping or scaling a product,
                        <br />
                        quickly find the cheapest or most powerful LLM for your use case.
                    </p>
                    <button className="btn btn-secondary" style={{ fontWeight: '600' }}>
                        Explore Providers
                    </button>
                </div>
            </section>
        </>
    );
};

export default Header;