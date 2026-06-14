import React, { useState } from 'react';

export default function LandingPage({ onLaunch }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "How does the congestion-dodging system calculate routes?",
      a: "The navigation engine translates the street grid into a live mathematical web. By combining actual road distance with real-time congestion levels, speed limits, and road lanes, it computes travel times on-the-fly to steer cars onto faster, clearer streets."
    },
    {
      q: "Can I customize and draw my own city streets?",
      a: "Absolutely! The Planning Tool lets you click on the map to place new intersections and draw connecting roadways. The simulation instantly adapts, letting you test how new street infrastructure alleviates gridlock."
    },
    {
      q: "What does the 'Optimal Grid Backbone' do?",
      a: "This feature calculates a master layout that connects all selected intersections using the shortest total length of roadway possible without cycles. It is ideal for routing synchronized traffic signal cables or underground utilities."
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#040810',
      color: '#f8fafc',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* BACKGROUND FLOATING NEON ORBS */}
      <div className="floating-orb-1" style={{
        position: 'absolute',
        top: '10%',
        left: '-10vw',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0) 70%)',
        filter: 'blur(90px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div className="floating-orb-2" style={{
        position: 'absolute',
        top: '60%',
        right: '-15vw',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%)',
        filter: 'blur(90px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div className="floating-orb-3" style={{
        position: 'absolute',
        top: '120%',
        left: '20vw',
        width: '35vw',
        height: '35vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
        filter: 'blur(80px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* HEADER BAR */}
      <header style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🚦</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Urban<span style={{ color: '#a855f7' }}>Pulse</span>
          </span>
        </div>
        <button
          onClick={onLaunch}
          className="btn-primary"
          style={{
            fontSize: '0.85rem',
            padding: '10px 24px',
            borderRadius: '20px'
          }}
        >
          Launch Live Map
        </button>
      </header>

      {/* CORE CONTAINER */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px 100px 20px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '120px'
      }}>
        
        {/* 1. HERO SECTION */}
        <section style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.8rem',
            color: '#22d3ee',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            alignSelf: 'center'
          }}>
            📍 Real-World Manhattan Routing
          </div>
          
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '4.2rem',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #f8fafc 20%, #a855f7 65%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '850px'
          }}>
            Optimize City Transit with UrbanPulse
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '650px',
            lineHeight: 1.6
          }}>
            A smart street network planning and traffic simulation environment. Draw roadways, schedule red lights, and calculate optimal paths in real-time.
          </p>

          <div style={{ marginTop: '10px' }}>
            <button
              onClick={onLaunch}
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '18px 48px',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(168, 85, 247, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(168, 85, 247, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.35)';
              }}
            >
              Launch Live Traffic Map ⚡
            </button>
          </div>
        </section>

        {/* 2. CARD FEATURES */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          width: '100%'
        }}>
          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #10b981' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🧭</span>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>Smart Congestion Dodging</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Quickly calculates dynamic travel times by weighting speed limits and traffic density, routing commuter vehicles away from jammed lanes.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #06b6d4' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🌿</span>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>Direct Eco-Scenic Paths</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Focuses routing priority on geographic straight-line orientation, helping drivers locate direct pathways and conserve fuel consumption.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #a855f7' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🕸️</span>
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>Optimal Grid Backbone</h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Computes a cycle-free road grid network to connect all intersections using the minimum total asphalt possible. Ideal for infrastructure layout.
            </p>
          </div>
        </section>

        {/* 3. HOW IT WORKS */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: "'Outfit', sans-serif" }}>Three Steps to Traffic Optimization</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '8px' }}>Explore the intuitive tools built directly inside the UrbanPulse simulator.</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {[
              { step: "01", title: "Map the City Grid", desc: "Use the map creator tools to place intersections and connect them with roads. Adjust lanes, speed limits, and traffic light timers easily." },
              { step: "02", title: "Simulate Congestions", desc: "Inject traffic bottlenecks, play/pause vehicle dots flowing along lanes, and watch how red light cycles trigger natural slowdowns." },
              { step: "03", title: "Launch Path Calculations", desc: "Select any start and end node. The simulator visually pulses search waves and highlights the calculated optimal path instantly." }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'rgba(168, 85, 247, 0.25)',
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: '1'
                }}>{item.step}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ fontSize: '1.1rem', color: '#f8fafc' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. METRICS / SUSTAINABLE IMPACT */}
        <section className="glass-panel" style={{
          padding: '50px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.0rem', fontFamily: "'Outfit', sans-serif" }}>Sustainable Urban Outcomes</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>
              Optimizing street navigation reduces fuel usage, exhaust emissions, and wasted time in gridlocks.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
            textAlign: 'center'
          }}>
            {[
              { val: "35%", label: "Emissions Reduced", desc: "By bypassing idle traffic queues." },
              { val: "40%", label: "Travel Time Saved", desc: "Avoiding congested roadways." },
              { val: "25%", label: "Fuel Saved", desc: "Commutes are direct and fluid." }
            ].map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  fontSize: '2.8rem',
                  fontWeight: 800,
                  color: idx === 0 ? '#10b981' : (idx === 1 ? '#06b6d4' : '#a855f7'),
                  fontFamily: "'Outfit', sans-serif",
                  textShadow: '0 0 15px rgba(255,255,255,0.05)'
                }}>{stat.val}</div>
                <h4 style={{ fontSize: '1.0rem', color: '#f8fafc' }}>{stat.label}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '180px', lineHeight: '1.4' }}>{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ SECTION */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', fontFamily: "'Outfit', sans-serif" }}>Frequently Asked Questions</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '8px' }}>Everything you need to know about the street planning simulator.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqData.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: openFaq === idx ? 'rgba(255,255,255,0.02)' : 'var(--bg-panel)'
                }}
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.0rem', color: '#f8fafc', fontWeight: 600 }}>{item.q}</h4>
                  <span style={{ fontSize: '1.2rem', color: '#a855f7', transition: 'transform 0.2s ease', transform: openFaq === idx ? 'rotate(45deg)' : 'none' }}>
                    ＋
                  </span>
                </div>
                {openFaq === idx && (
                  <p style={{
                    marginTop: '12px',
                    fontSize: '0.88rem',
                    color: '#94a3b8',
                    lineHeight: '1.6',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '12px'
                  }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER BAR */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        width: '100%',
        padding: '30px 20px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b',
        position: 'relative',
        zIndex: 10
      }}>
        <p>© {new Date().getFullYear()} UrbanPulse Simulator. All rights reserved.</p>
      </footer>
    </div>
  );
}
