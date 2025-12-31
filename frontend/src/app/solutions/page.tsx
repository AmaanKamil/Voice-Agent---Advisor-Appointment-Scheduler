'use client';
import { useModal } from '../context/ModalContext';

export default function Solutions() {
    const { openQuote } = useModal();
    const solutions = [
        { title: 'Independent Wealth Advisors', desc: 'Automate your client intake and slot booking without lifting a finger.', icon: '💰' },
        { title: 'Medical Consultations', desc: 'Secure patient appointments and provide preparation checklists automatically.', icon: '🏥' },
        { title: 'Legal & Professional Services', desc: 'Manage discovery calls and reschedule meetings with full audit trails.', icon: '⚖️' },
    ];

    return (
        <main>
            <section className="section" style={{ paddingTop: '160px' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Industry Solutions.</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Tailored voice automation for high-trust professional services.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {solutions.map((s, idx) => (
                            <div key={idx} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ fontSize: '3rem', textAlign: 'center' }}>{s.icon}</div>
                                <div>
                                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '6rem' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Ready to transform your practice?</h2>
                        <button className="btn btn-primary" onClick={openQuote}>Book a Consultation</button>
                    </div>
                </div>
            </section>
        </main>
    );
}
