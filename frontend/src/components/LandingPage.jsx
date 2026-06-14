import React from 'react';

export default function LandingPage({ onLaunch }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060913',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Background Animated Neon Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0) 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      {/* Main Core Container */}
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        textAlign: 'center',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px'
      }}>
        {/* Logo and Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.85rem',
            color: '#c084fc',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            alignSelf: 'center'
          }}>
            🚦 Smart Transit Visualizer
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '3.8rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f8fafc 30%, #a855f7 70%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(168, 85, 247, 0.25)'
          }}>
            MetroFlow
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '620px',
            lineHeight: 1.6,
            alignSelf: 'center',
            fontWeight: 400
          }}>
            Experience smarter urban routing. Design intersections, adjust real-time congestion, and simulate traffic flows with intelligent eco-friendly pathways.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onLaunch}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 700,
              padding: '16px 40px',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(168, 85, 247, 0.45)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(168, 85, 247, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.45)';
            }}
          >
            Launch Live Traffic Map ⚡
          </button>
        </div>

        {/* Feature Cards Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          width: '100%',
          marginTop: '20px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{
            padding: '24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '3px solid #10b981'
          }}>
            <span style={{ fontSize: '2rem' }}>🧭</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Smart Traffic Avoidance</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Automatically map alternative paths that bypass congested bottlenecks, keeping city transit moving smoothly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{
            padding: '24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '3px solid #06b6d4'
          }}>
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Eco-Friendly Routes</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Compute paths that prioritize direct scenic routing, lowering vehicle emissions and fuel consumption.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{
            padding: '24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderTop: '3px solid #a855f7'
          }}>
            <span style={{ fontSize: '2rem' }}>🏗️</span>
            <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>Optimal Grid Planner</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Establish a core layout that links all parts of your city with the minimum total roadway required, reducing building costs.
            </p>
          </div>
        </div>

        {/* Quick Simulator Highlight */}
        <div style={{
          fontSize: '0.8rem',
          color: '#64748b',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '20px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px'
        }}>
          <span>📈 Real-Time Data Flow</span>
          <span>🚗 Interactive Road Builder</span>
          <span>🚥 Intelligent Light Control</span>
        </div>
      </div>
    </div>
  );
}
