import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Copy, Check, Shield } from 'lucide-react';
import { Button, Card, Toggle, Input } from '../components/ui';
import { StrengthMeter } from '../components/generator/StrengthMeter';
import { generatePassword, generatePassphrase } from '../utils/passwordUtils';

export const GeneratorPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('password'); // 'password' | 'passphrase'
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Password Options
  const [opts, setOpts] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,

    // existing
    excludeSimilar: false,
    excludeAmbiguous: false,
    customExclude: '',

    // NEW
    requireEach: true,
    avoidPatterns: true,
    noRepeat: false
  });

  // Passphrase Options
  const [phraseOpts, setPhraseOpts] = useState({
    wordCount: 4,
    separator: 'hyphen',
    capitalize: false
  });

  const handleGenerate = useCallback(() => {
    let newPass = '';

    if (mode === 'password') {
      // Safety constraint: Prevent crashing if all toggles are disabled
      if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
        setOpts(prev => ({ ...prev, lowercase: true }));
        return;
      }
      newPass = generatePassword(opts);
    } else {
      newPass = generatePassphrase(phraseOpts.wordCount, phraseOpts.separator, phraseOpts.capitalize);
    }

    setPassword(newPass);
    setHistory(prev => [newPass, ...prev].slice(0, 10)); // Keep last 10
  }, [mode, opts, phraseOpts]);

  // Auto-generate on load and option changes
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = async (text, index = 'main') => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);

    // Security: Clear clipboard after 30 seconds
    setTimeout(async () => {
      try {
        const currentClip = await navigator.clipboard.readText();
        if (currentClip === text) {
          await navigator.clipboard.writeText('');
        }
      } catch (err) {
        // Silently ignore browser permission errors on read
      }
    }, 30000);
  };

  const handleSaveToVault = () => {
    // Navigates to the vault and passes the generated password in router state
    // so the Vault page can automatically open the Create Modal with it prefilled.
    navigate('/vault', { state: { prefilledPassword: password, openCreateModal: true } });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Password Generator</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Generate cryptographically secure passwords and passphrases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls */}
        <Card padding="md" className="lg:col-span-4 h-fit border-[var(--border)]">
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-md mb-6 border border-[var(--border)]">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${mode === 'password' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('passphrase')}
              className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${mode === 'passphrase' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Passphrase
            </button>
          </div>

          {mode === 'password' ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Length</label>
                  <span className="text-sm font-mono text-[var(--accent)]">{opts.length}</span>
                </div>
                <input
                  type="range" min="4" max="128"
                  value={opts.length}
                  onChange={(e) => setOpts({ ...opts, length: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>

              <div className="space-y-4">
                <Toggle checked={opts.uppercase} onChange={(c) => setOpts({ ...opts, uppercase: c })} label="Uppercase (A-Z)" />
                <Toggle checked={opts.lowercase} onChange={(c) => setOpts({ ...opts, lowercase: c })} label="Lowercase (a-z)" />
                <Toggle checked={opts.numbers} onChange={(c) => setOpts({ ...opts, numbers: c })} label="Numbers (0-9)" />
                <Toggle checked={opts.symbols} onChange={(c) => setOpts({ ...opts, symbols: c })} label="Symbols (!@#$)" />
              </div>

              <div className="pt-4 border-t border-[var(--border)] space-y-4">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Advanced</h4>
                <Toggle
                  checked={opts.excludeSimilar}
                  onChange={(c) => setOpts({ ...opts, excludeSimilar: c })}
                  label="Exclude Similar (il1Lo0O)"
                  size="sm"
                />
                <Toggle
                  checked={opts.requireEach}
                  onChange={(c) => setOpts({ ...opts, requireEach: c })}
                  label="Require all selected types"
                  size="sm"
                />

                <Toggle
                  checked={opts.avoidPatterns}
                  onChange={(c) => setOpts({ ...opts, avoidPatterns: c })}
                  label="Block weak patterns"
                  size="sm"
                />

                <Toggle
                  checked={opts.noRepeat}
                  onChange={(c) => setOpts({ ...opts, noRepeat: c })}
                  label="Prevent repeated characters"
                  size="sm"
                />

                {/* FIXED: Simplified label text to prevent JSX compiler errors */}
                <Toggle
                  checked={opts.excludeAmbiguous}
                  onChange={(c) => setOpts({ ...opts, excludeAmbiguous: c })}
                  label="Exclude Ambiguous (brackets, quotes, punctuation)"
                  size="sm"
                />

                <Input
                  placeholder="Custom Exclude (e.g. abc)"
                  value={opts.customExclude}
                  onChange={(e) => setOpts({ ...opts, customExclude: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Word Count</label>
                  <span className="text-sm font-mono text-[var(--accent)]">{phraseOpts.wordCount}</span>
                </div>
                <input
                  type="range" min="3" max="8"
                  value={phraseOpts.wordCount}
                  onChange={(e) => setPhraseOpts({ ...phraseOpts, wordCount: parseInt(e.target.value) })}
                  className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">Separator</label>
                <select
                  className="w-full h-10 rounded-md border border-[var(--border)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] focus:ring-[var(--border-focus)] focus:outline-none"
                  value={phraseOpts.separator}
                  onChange={(e) => setPhraseOpts({ ...phraseOpts, separator: e.target.value })}
                >
                  <option value="hyphen">Hyphen (-)</option>
                  <option value="space">Space ( )</option>
                  <option value="dot">Dot (.)</option>
                  <option value="number">Random Number</option>
                  <option value="none">None</option>
                </select>
              </div>

              <Toggle checked={phraseOpts.capitalize} onChange={(c) => setPhraseOpts({ ...phraseOpts, capitalize: c })} label="Capitalize Words" />
            </div>
          )}
        </Card>

        {/* Right: Output */}
        <div className="lg:col-span-8 space-y-6">
          <Card padding="lg" className="border-[var(--border)] flex flex-col justify-center min-h-[280px]">
            <div className="relative mb-8 group">
              <div className="w-full break-all bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-6 pr-16 text-center text-xl sm:text-3xl font-mono text-[var(--text-primary)] tracking-wide shadow-inner min-h-[100px] flex items-center justify-center">
                {password}
              </div>
              <button
                onClick={() => handleCopy(password, 'main')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-sm focus:outline-none"
                title="Copy Password"
              >
                {copiedIndex === 'main' ? <Check className="h-5 w-5 text-[var(--success)]" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>

            <StrengthMeter password={password} />

            <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--border)]">
              <Button leftIcon={RefreshCw} variant="secondary" onClick={handleGenerate} className="flex-1">
                Regenerate
              </Button>
              <Button leftIcon={Shield} variant="primary" onClick={handleSaveToVault} className="flex-1">
                Save to Vault
              </Button>
            </div>
          </Card>

          {/* History */}
          <Card padding="md" className="border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Recent History (Session Only)</h3>
            <div className="divide-y divide-[var(--border)] overflow-hidden rounded-md border border-[var(--border)]">
              {history.slice(1).map((pass, i) => (
                <div key={pass + i} className="flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)] transition-colors">
                  <span className="font-mono text-sm text-[var(--text-secondary)] truncate mr-4">{pass}</span>
                  <button onClick={() => handleCopy(pass, i)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] rounded focus:outline-none transition-colors">
                    {copiedIndex === i ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
              {history.length <= 1 && (
                <div className="p-4 text-center text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)]">History will appear here.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
