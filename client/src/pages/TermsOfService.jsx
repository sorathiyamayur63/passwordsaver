import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <header className="border-b border-[var(--border)] p-6 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline text-[var(--text-primary)] hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Passwordsaver Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="text-lg font-bold">passwordsaver</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
        
        <div className="flex flex-col gap-10 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using passwordsaver, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--danger)] mb-4">2. Password & Account Recovery</h2>
            <p className="border-l-4 border-[var(--danger)] pl-5 text-[var(--danger-text)] bg-[var(--danger-subtle)] py-4 pr-4 rounded-r-lg">
              <strong className="block mb-2 font-bold text-[var(--danger)]">CRITICAL WARNING:</strong> 
              Passwordsaver uses a zero-knowledge architecture. We do not know your Password. We cannot reset it. If you lose or forget your Password, your data is permanently unrecoverable. We are not liable for any data loss resulting from a forgotten Password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Appropriate Use</h2>
            <p>You agree not to use the service to store illegal material, attempt to bypass the cryptographic protections, reverse engineer the platform, or use the service in any way that could damage, disable, or impair our servers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Limitation of Liability</h2>
            <p>In no event shall passwordsaver, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>
        </div>
      </main>
    </div>
  );
}