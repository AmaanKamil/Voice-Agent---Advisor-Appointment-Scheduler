'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useModal } from './context/ModalContext';
import { RetellWebClient } from 'retell-client-js-sdk';

// Use environment variable for Agent ID, fallback to the hardcoded one only for existing demos
const AGENT_ID = process.env.NEXT_PUBLIC_RETELL_AGENT_ID || 'agent_54d778e00a202388dd8e430ff3';

export default function Home() {
  const { openQuote } = useModal();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, analyzing, done
  const retellClientRef = useRef<RetellWebClient | null>(null);

  const intents = [
    { title: 'Appointment Booking', desc: 'Secure slots instantly via voice negotiation.', color: 'var(--primary)' },
    { title: 'Inbound Inquiry', desc: 'Answer FAQs about hours, location, and services.', color: 'var(--secondary)' },
    { title: 'Lead Qualification', desc: 'Filter prospects before they reach your team.', color: '#ef4444' },
    { title: 'Rescheduling', desc: 'Move dates effortlessly without staff intervention.', color: 'var(--accent)' },
    { title: 'After-Hours Support', desc: 'Never let a voicemail go unanswered.', color: '#10b981' },
  ];

  useEffect(() => {
    // Initialize SDK on mount
    const client = new RetellWebClient();
    retellClientRef.current = client;

    // Event Listeners
    client.on('call_started', () => {
      console.log('Call started');
      setCallStatus('connected');
    });

    client.on('call_ended', () => {
      console.log('Call ended');
      setCallStatus('analyzing');
      setTimeout(() => setCallStatus('done'), 2000);
    });

    client.on('error', (error) => {
      console.error('Retell Error:', error);
      alert('Call failed to start: ' + error.message);
      setCallStatus('idle');
    });

    return () => {
      client.stopCall();
    };
  }, []);

  const handleStartDemo = async () => {
    setIsDemoOpen(true);
    setCallStatus('calling');

    try {
      // 1. Get Access Token from Backend
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/create-web-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: AGENT_ID }) // Send the Agent ID
      });

      if (!response.ok) {
        throw new Error('Failed to get access token from backend');
      }

      const data = await response.json();

      // 2. Start Call with SDK
      if (retellClientRef.current) {
        await retellClientRef.current.startCall({
          accessToken: data.access_token,
        });
      }

    } catch (err: any) {
      console.error('Demo Start Error:', err);
      alert('Could not start voice demo. Check console for details.');
      setCallStatus('idle');
    }
  };

  const handleEndDemo = () => {
    // Manually hang up
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-text">
              <span className="intent-badge">Automated Receptionist</span>
              <h1>Your Business, <br /> <span style={{ color: 'var(--accent)' }}>Always Listening.</span></h1>
              <p>
                Capture every lead, schedule every appointment, and never miss a call again.
                CallNest is your 24/7 AI-powered receptionist that handles inbound inquiries
                with human-like precision and integrates instantly with your calendar.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={handleStartDemo}>
                  Try Live Voice Demo
                </button>
                <button className="btn btn-secondary" style={{ marginLeft: '1rem' }} onClick={openQuote}>
                  Request a Quote
                </button>
              </div>
            </div>
            <div className="hero-image animate-float">
              <Image
                src="/callnest_hero_visual_v2.png"
                alt="CallNest AI Visualization"
                width={600}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section" style={{ padding: '2rem 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', letterSpacing: '0.05em' }}>TRUSTED BY 500+ FORWARD-THINKING BUSINESSES</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', opacity: 0.5, filter: 'grayscale(1)', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>DENTAL<span style={{ fontWeight: '400' }}>PLUS</span></div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>REAL<span style={{ fontWeight: '400' }}>ESTATE.AI</span></div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>LAW<span style={{ fontWeight: '400' }}>FIRM</span></div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>CLINIC<span style={{ fontWeight: '400' }}>OS</span></div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      {/* Features List - Matching Reference Image */}
      <section id="features" className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {intents.map((intent, idx) => (
              <div key={idx} className="glass-card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                padding: '2.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '1rem'
              }}>
                <div style={{
                  minWidth: '64px',
                  height: '64px',
                  background: intent.color,
                  borderRadius: '16px',
                  boxShadow: `0 0 20px ${intent.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Optional icon placeholder if needed */}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>{intent.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>{intent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Moved to Home */}
      <section id="pricing" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>Simple, Usage-Based Pricing.</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Start small and scale as your call volume grows.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'Starter', price: '$0.25', unit: '/min', features: ['Pay as you go', 'Standard Voice Model', 'Email Support'] },
              { name: 'Growth', price: '$0.25', unit: '/min', features: ['Volume Discounts applied', 'Premium Voice Models', 'Priority Support', 'Custom Fine-tuning'], popular: true },
              { name: 'Scale', price: 'Custom', unit: '', features: ['Dedicated Infrastructure', 'SLA', '24/7 Phone Support', 'On-premise Deployment'] }
            ].map((tier, idx) => (
              <div key={idx} className="glass-card" style={{
                padding: '3rem',
                position: 'relative',
                background: tier.popular ? 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))' : 'rgba(255,255,255,0.02)',
                border: tier.popular ? '1px solid var(--primary)' : '1px solid var(--border)'
              }}>
                {tier.popular && <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold' }}>POPULAR</div>}
                <h3 style={{ marginBottom: '1rem', color: tier.popular ? 'var(--primary)' : 'white' }}>{tier.name}</h3>
                <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: 1 }}>{tier.price}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{tier.unit}</span></div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>No monthly fees. No hidden costs.</p>

                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                  {tier.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: '1rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>

                <button className={`btn ${tier.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%' }} onClick={openQuote}>
                  {tier.price === 'Custom' ? 'Contact Sales' : 'Start with $50 Credit'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="solutions" className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="hero-grid" style={{ gridTemplateColumns: '0.8fr 1.2fr' }}>
            <div className="glass-card animate-float">
              <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Enterprise-Grade Voice</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Industry-leading sub-second latency and human-like intonation.</p>
              <div style={{ marginTop: '2rem', height: '4px', background: 'var(--primary)', width: '60%', borderRadius: '2px' }}></div>
            </div>
            {/* Intelligent Automation Section - Matching Reference Image */}
            <div style={{ paddingLeft: '4rem' }}>
              <h2 style={{ fontSize: '3rem', marginBottom: '3rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'white' }}>Intelligent Automation.</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'monospace', opacity: 0.8 }}>01</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>High-Fidelity Context Analysis</h4>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>Our neural engine instantly processes conversation nuance to detect customer intent with near-human precision.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'monospace', opacity: 0.8 }}>02</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>Smart Action Router</h4>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>Automatically trigger complex workflows—from calendar negotiation to CRM updates—without manual oversight.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'monospace', opacity: 0.8 }}>03</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>Audit & Compliance Layer</h4>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1rem' }}>Every interaction is securely logged and analyzed for quality assurance, ensuring operational transparency.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {isDemoOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ padding: '3rem', maxWidth: '600px' }}>
            <button className="close-btn" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setIsDemoOpen(false)}>&times;</button>

            {callStatus === 'calling' && (
              <div className="call-status">
                <div className="pulsing-circle"></div>
                <h3 style={{ marginTop: '1.5rem' }}>Connecting...</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Dialing the AI Scheduling Agent</p>
              </div>
            )}

            {callStatus === 'connected' && (
              <div className="call-status">
                <div className="pulsing-circle" style={{ background: 'var(--accent)' }}></div>
                <h3>Active Conversation</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  The AI is listening and negotiating slots.
                </p>
                <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'center', padding: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: '600' }}>AI PROCESSING SECURELY</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Optimizing natural language parameters in real-time</p>
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '2rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={handleEndDemo}>
                  Leave Call
                </button>
              </div>
            )}

            {callStatus === 'analyzing' && (
              <div className="call-status">
                <div className="pulsing-circle" style={{ background: 'var(--secondary)', animationDuration: '1s' }}></div>
                <h3>Intelligent Analysis</h3>
                <p className="text-muted">Our intelligent AI is analyzing the conversation and confirming details...</p>
              </div>
            )}

            {callStatus === 'done' && (
              <div className="call-status">
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#22c55e' }}>Execution Successful</h3>
                <p style={{ marginBottom: '2rem' }}>The conversation has been successfully processed and your calendar hold is secured.</p>
                <button className="btn btn-primary" onClick={() => setIsDemoOpen(false)}>Back to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
