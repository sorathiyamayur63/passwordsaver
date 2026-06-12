import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
      <header className="border-b border-[var(--border)] p-6 bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline text-[var(--text-primary)] hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Passwordsaver Logo" className="w-8 h-8 object-contain drop-shadow-md" />
            <span className="text-lg font-bold">passwordsaver</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] no-underline transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left Side: Info */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Get in touch</h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">
            Have a question about our cryptography? Need help managing your devices? We're here to help.
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex gap-4 items-center group">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                <Mail className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">Support Email</div>
                <div className="text-sm text-[var(--text-secondary)]">support.passwordsaver@gmail.com</div>
              </div>
            </div>
            <div className="flex gap-4 items-center group">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">Security Reports</div>
                <div className="text-sm text-[var(--text-secondary)]">security.passwordsaver@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 shadow-sm">
          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Subject</label>
              <input 
                type="text" 
                placeholder="How can we help?"
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Message</label>
              <textarea 
                rows="5"
                placeholder="Write your message here..."
                className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-y"
              ></textarea>
            </div>

            <button className="mt-2 w-full bg-[var(--accent)] text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}