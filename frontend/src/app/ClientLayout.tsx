'use client';
import { ModalProvider, useModal } from './context/ModalContext';
import { usePathname } from 'next/navigation';
import React from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isQuoteOpen, openQuote, closeQuote } = useModal();
    const [submissionStatus, setSubmissionStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    // Reset status when modal opens/closes
    React.useEffect(() => {
        if (!isQuoteOpen) setSubmissionStatus('idle');
    }, [isQuoteOpen]);

    return (
        <>
            <nav className="nav">
                <div className="container nav-content">
                    <div className="logo" style={{ fontSize: '2rem' }}>
                        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>CallNest</a>
                    </div>
                    {/* Navigation links removed for cleaner look */}
                    <button className="btn btn-primary" onClick={openQuote}>Get Started</button>
                </div>
            </nav>

            {children}

            <footer className="section" style={{ padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4rem' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="logo" style={{ fontSize: '1.5rem', marginBottom: '1rem', opacity: 0.9 }}>CallNest</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        © 2025 CallNest AI. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Global Quote Modal */}
            {isQuoteOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card" style={{ maxWidth: '800px', minHeight: '500px', display: 'flex', alignItems: 'center' }}>
                        <button
                            className="close-btn"
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                            onClick={closeQuote}
                        >
                            &times;
                        </button>

                        {submissionStatus === 'success' ? (
                            <div style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)',
                                    borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#10b981', fontSize: '2.5rem'
                                }}>✓</div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Request Received</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                    Our enterprise team has been notified. We will get in touch with you soon
                                </p>
                                <button className="btn btn-primary" onClick={closeQuote}>Close</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', width: '100%' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: '1.2' }}>Ready to deploy <br />Enterprise Voice AI?</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                        Skip the waitlist. Get a custom demo environment configured for your specific industry vertical within 24 hours.
                                    </p>
                                    <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Volume-based discounts</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Dedicated support engineer</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Custom LLM fine-tuning</li>
                                    </ul>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const data = {
                                        name: formData.get('name'),
                                        email: formData.get('email'),
                                        mobile: formData.get('mobile'),
                                        message: formData.get('message')
                                    };

                                    try {
                                        const res = await fetch('http://localhost:3001/api/leads', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(data)
                                        });
                                        if (res.ok) {
                                            setSubmissionStatus('success');
                                            // closeQuote() is now called via the "Close" button in success view
                                        } else {
                                            const errData = await res.json();
                                            alert('Submission failed: ' + (errData.error || 'Unknown error'));
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Connection error. Please try again later.');
                                    }
                                }}>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                        <input type="text" name="name" className="form-input" placeholder="Jane Doe" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Work Email</label>
                                        <input type="email" name="email" className="form-input" placeholder="jane@company.com" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                                        <input type="tel" name="mobile" className="form-input" placeholder="+1 (555) 000-0000" required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Use Case Details</label>
                                        <textarea name="message" className="form-input" rows={3} placeholder="Tell us about your expected call volume..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', fontFamily: 'inherit', outline: 'none' }}></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Contact Sales</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ModalProvider>
            <LayoutContent>{children}</LayoutContent>
        </ModalProvider>
    );
}
