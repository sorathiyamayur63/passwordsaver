import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      
      {/* Simple Header */}
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Privacy Policy</h1>
        <p className="text-lg text-[var(--text-secondary)] mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="flex flex-col gap-10 text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Zero-Knowledge Architecture</h2>
            <p>At passwordsaver, privacy isn't a setting—it's cryptographic math. We employ a strict zero-knowledge architecture. This means your data is encrypted and decrypted locally on your device using your Password. We do not know, cannot access, and cannot recover your Password or the unencrypted contents of your vault.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. Data We Collect</h2>
            <ul className="list-disc pl-5 flex flex-col gap-3">
              <li><strong>Account Information:</strong> We store your username (or email) and a cryptographic hash of your Password (using Argon2id) strictly for authentication purposes.</li>
              <li><strong>Vault Data:</strong> We store AES-256-GCM encrypted blobs of your passwords, notes, and items. We cannot read this data.</li>
              <li><strong>Device & Session Logs:</strong> To provide you with security alerts and session management, we log device fingerprints, browser types, and hashed IP addresses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Third-Party Tracking</h2>
            <p>We do not use third-party analytics, marketing trackers, or telemetry scripts inside the vault. Your passwordsaver instance is isolated, and your activity is not sold, rented, or shared with advertisers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Data Deletion</h2>
            <p>You have the absolute right to be forgotten. You can delete your account at any time from your account settings. Initiating account deletion permanently destroys your encrypted vault blobs, session data, and authentication hashes from our servers immediately.</p>
          </section>
        </div>
      </main>
    </div>
  );
}