import React, { useState, useEffect } from 'react';

export default function LandingPage({ onLaunch }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Track scroll position to show/hide the Scroll to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(4, 8, 16, 0.9) 0%, rgba(4, 8, 16, 0.98) 100%), url("/city_traffic_bg.png") center/cover no-repeat fixed',
      color: '#f8fafc',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif",
      scrollBehavior: 'smooth'
    }}>
      {/* 1. FLOATING NEON ORBS */}
      <div className="floating-orb-1" style={{
        position: 'absolute',
        top: '5%',
        left: '-15vw',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0) 70%)',
        filter: 'blur(100px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div className="floating-orb-2" style={{
        position: 'absolute',
        top: '50%',
        right: '-15vw',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0) 70%)',
        filter: 'blur(100px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* HEADER BAR */}
      <header style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>🚦</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Urban<span style={{ color: '#a855f7' }}>Pulse</span>
          </span>
        </div>
        <button
          onClick={onLaunch}
          className="btn-primary"
          style={{
            fontSize: '0.8rem',
            padding: '8px 20px',
            borderRadius: '20px',
            fontWeight: 600
          }}
        >
          Launch Simulator
        </button>
      </header>

      {/* CORE CONTAINER */}
      <main style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 20px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '120px'
      }}>
        
        {/* HERO SECTION */}
        <section style={{
          minHeight: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          paddingBottom: '60px',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '0.75rem',
            color: '#c084fc',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            Graph-Based Road Network Planner
          </div>
          
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '3.6rem',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f8fafc 15%, #a855f7 65%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '800px'
          }}>
            City Traffic Navigation System
          </h1>
          
          <p style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            A complete working dashboard utilizing advanced graph data structures to optimize city transit flow and simulate live traffic dynamics.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              onClick={onLaunch}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                padding: '14px 36px',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Launch Live Map ⚡
            </button>
          </div>

          {/* Animated Scroll Down mouse indicator */}
          <div 
            onClick={handleScrollDown}
            style={{
              position: 'absolute',
              bottom: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              animation: 'bounce 2s infinite'
            }}
          >
            <div style={{
              width: '24px',
              height: '38px',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              justifyContent: 'center',
              padding: '6px'
            }}>
              <div style={{
                width: '4px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: '#a855f7',
                animation: 'scroll-dot 1.5s infinite'
              }} />
            </div>
            <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Scroll to Explore
            </span>
          </div>
        </section>

        {/* SECTION 2: GRAPH DATA STRUCTURE IMPLEMENTATION */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif", color: '#f8fafc' }}>
              The Graph Architecture
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              How the city's road grid is modeled inside the algorithm's database.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>📍</div>
              <h4 style={{ fontSize: '1.05rem', color: '#c084fc', marginBottom: '8px' }}>Intersections (Nodes)</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.6' }}>
                Modeled as coordinates containing geographic positions. Features a light control state that cycles green/red timers, regulating vehicle crossings.
              </p>
            </div>
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🛣️</div>
              <h4 style={{ fontSize: '1.05rem', color: '#06b6d4', marginBottom: '8px' }}>Roadways (Edges)</h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.6' }}>
                Modeled as directed links connecting nodes. Holds distance metrics, lanes configuration, speed limits, and a dynamic congestion index.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PATH ROUTING PRIORITY */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: "'Outfit', sans-serif", color: '#f8fafc' }}>
              Path Optimization Methods
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              Three optimization modes designed to calculate pathways across nodes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                title: "Intelligent Congestion-Dodging",
                color: "#10b981",
                desc: "Calculates live travel delays based on speed limits and current gridlock levels, routing cars to clear streets."
              },
              {
                title: "Traditional Shortest Distance",
                color: "#64748b",
                desc: "Determines paths based strictly on road lengths, representing standard shortest-line algorithms."
              },
              {
                title: "Direct Eco-Scenic",
                color: "#a855f7",
                desc: "Uses straight-line geometric estimation towards the destination node to ensure direct routing."
              }
            ].map((method, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderLeft: `3px solid ${method.color}`,
                  background: 'rgba(10, 17, 32, 0.4)'
                }}
              >
                <h4 style={{ fontSize: '1.0rem', color: '#f8fafc', marginBottom: '8px' }}>{method.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>{method.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: NETWORK MINIMUM SPANNING TREE */}
        <section className="glass-panel" style={{
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem' }}>🕸️</div>
          <h2 style={{ fontSize: '1.6rem', fontFamily: "'Outfit', sans-serif" }}>
            Optimal Grid Backbone Layout
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '650px', lineHeight: '1.6' }}>
            Utilizes Kruskal's algorithm to calculate the absolute minimum length of roadway required to connect all intersections without loops. This core layout represents optimal routing configurations for synchronized transit signaling cables and utility piping.
          </p>
        </section>

      </main>

      {/* FOOTER BAR */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        width: '100%',
        padding: '30px 20px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#5e6b7d',
        marginTop: '100px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px'
      }}>
        <span>© {new Date().getFullYear()} UrbanPulse Simulator</span>
        <span>Made with 💜</span>
      </footer>

      {/* CSS Bounce & Scroll Dot Animations */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        @keyframes scroll-dot {
          0% { opacity: 0; transform: translateY(-4px); }
          50% { opacity: 1; transform: translateY(4px); }
          100% { opacity: 0; transform: translateY(8px); }
        }
      `}</style>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(10, 17, 32, 0.9)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            cursor: 'pointer',
            fontSize: '1rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ↑
        </button>
      )}
    </div>
  );
}
