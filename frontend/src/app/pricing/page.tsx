'use client';
import { useModal } from '../context/ModalContext';

export default function Pricing() {
    const { openQuote } = useModal();
    const tiers = [
        { name: 'Starter', price: '$99', features: ['50 Calls/mo', 'Email Support', 'Basic Analytics', '1 Agent'] },
        { name: 'Pro', price: '$299', features: ['Unlimited Calls', 'Priority Support', 'Advanced Groq Inference', 'Custom Agent Tuning', 'CRM Integration'], popular: true },
        { name: 'Enterprise', price: 'Custom', features: ['On-prem deployment', 'Dedicated Account Manager', 'SLA Guarantees', 'White-labeling'] },
    ];

    return (
        <main>
            <section className="section" style={{ paddingTop: '160px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Transparent Pricing.</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Choose the plan that fits your advisory volume.</p>
                    </div>

                    <div className="grid">
                        {tiers.map((tier, idx) => (
                            <div key={idx} className="glass-card" style={{
                                border: tier.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
                                position: 'relative'
                            }}>
                                {tier.popular && <span style={{
                                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--primary)', padding: '0.25rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>MOST POPULAR</span>}
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tier.name}</h3>
                                <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem' }}>{tier.price}<span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>{tier.price !== 'Custom' && '/mo'}</span></div>
                                <ul style={{ listStyle: 'none', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {tier.features.map((f, i) => (
                                        <li key={i} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    className={`btn ${tier.popular ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ width: '100%' }}
                                    onClick={openQuote}
                                >
                                    {tier.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
