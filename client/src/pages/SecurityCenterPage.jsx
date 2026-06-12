import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { useVaultStore } from '../store/vaultStore';
import { calculateVaultHealthScore } from '../utils/securityAnalysis'; 
import { cn } from '../utils/cn';

export const SecurityCenterPage = () => {
  const navigate = useNavigate();

  const { items } = useVaultStore();
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('weak');

  const runScan = () => {
    setIsScanning(true);
    setReport(null);
    // Simulate scan delay for UX perception of heavy work
    setTimeout(() => {
      const results = calculateVaultHealthScore(items);
      setReport(results);
      setIsScanning(false);
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[var(--success)] border-[var(--success)]';
    if (score >= 60) return 'text-[var(--warning)] border-[var(--warning)]';
    return 'text-[var(--danger)] border-[var(--danger)]';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
  <div className="flex-1 min-w-0">
    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
      Security Center
    </h1>

    <p className="text-sm text-[var(--text-secondary)] mt-1">
      End-to-end encrypted analysis. Your passwords never leave your device.
    </p>
  </div>

  <Button
    onClick={runScan}
    loading={isScanning}
    leftIcon={RefreshCw}
    className="w-full sm:w-auto shrink-0 whitespace-nowrap"
  >
    {report ? 'Run Scan Again' : 'Run Security Scan'}
  </Button>
</div>
      {!report && !isScanning && (
        <Card padding="lg" className="flex flex-col items-center justify-center py-20 text-center border-[var(--border)]">
          <ShieldAlert className="h-16 w-16 text-[var(--text-muted)] mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">No recent scans</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mt-2 mb-6">
            Run a security scan to find weak, reused, and old passwords, as well as expiring cards and documents. All analysis happens securely within your browser.
          </p>
          <Button onClick={runScan} variant="primary">Start Security Scan</Button>
        </Card>
      )}

      {isScanning && (
        <Card padding="lg" className="flex flex-col items-center justify-center py-20 text-center border-[var(--border)]">
          <div className="relative h-16 w-16 mb-4">
            <div className="absolute inset-0 border-4 border-[var(--bg-secondary)] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[var(--accent)] rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Analyzing Vault securely...</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2">Checking entropy and reusing patterns locally.</p>
        </Card>
      )}

      {report && !isScanning && (
        <div className="space-y-6 animate-fadeIn">
          {/* Health Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding="lg" className="flex flex-col items-center justify-center text-center">
              <div className={cn("flex items-center justify-center h-32 w-32 rounded-full border-8 mb-4", getScoreColor(report.score))}>
                <span className="text-4xl font-bold">{report.score}</span>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Vault Health Grade: {report.grade}</h3>
            </Card>

            <Card padding="lg" className="md:col-span-2">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Recommendations</h3>
              <ul className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--text-secondary)]">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Details Tabs */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex border-b border-[var(--border)] bg-[var(--bg-secondary)] overflow-x-auto">
              {[
{
 id:'weak',
 label:'Weak Passwords',
 count: report?.raw?.passStrength?.summary?.weakCount || 0,
 icon: ShieldAlert
},
{
 id:'reused',
 label:'Reused Passwords',
 count: report?.raw?.reused?.length || 0,
 icon: AlertTriangle
},
{
 id:'old',
 label:'Old Passwords',
 count: report?.raw?.old?.length || 0,
 icon: Clock
},
{
 id:'expiring',
 label:'Expiring Items',
 count:
 (report?.raw?.expiring?.expired?.length || 0) +
 (report?.raw?.expiring?.expiringSoon?.length || 0),
 icon: AlertCircle
}
].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--bg-primary)]" 
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant={activeTab === tab.id ? 'info' : 'default'} size="sm" className="ml-2">{tab.count}</Badge>
                  )}
                </button>
              ))}
            </div>

            <div className="p-0">
              {/* WEAK PASSWORDS TAB */}
              {activeTab === 'weak' && (
                <div className="divide-y divide-[var(--border)]">
                  {report.raw.passStrength.weak.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">No weak passwords found. Great job!</div>
                  ) : (
                    report.raw.passStrength.weak.map((item, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)]">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[var(--danger)]">Very Weak</span>
                            <div className="h-1 w-16 bg-[var(--danger)] rounded-full"></div>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/vault?item=${item.uuid}`)}>Update</Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* REUSED PASSWORDS TAB */}
              {activeTab === 'reused' && (
                <div className="divide-y divide-[var(--border)]">
                  {report.raw.reused.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">No reused passwords detected.</div>
                  ) : (
                    report.raw.reused.map((group, i) => (
                      <div key={i} className="p-4 hover:bg-[var(--bg-tertiary)]">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">
                            Password reused across <span className="text-[var(--danger)]">{group.count} accounts</span>
                          </h4>
                          <Button variant="secondary" size="sm" onClick={() => navigate('/generator')}>Generate New</Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map(item => (
                            <Badge key={item.uuid} variant="default" className="cursor-pointer hover:bg-[var(--border)]" onClick={() => navigate(`/vault?item=${item.uuid}`)}>
                              {item.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* OLD PASSWORDS TAB */}
              {activeTab === 'old' && (
                <div className="divide-y divide-[var(--border)]">
                  {report.raw.old.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">All passwords are fresh.</div>
                  ) : (
                    report.raw.old.map((item, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)]">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                          <p className="text-xs text-[var(--warning)] mt-1">{item.daysOld} days old</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/vault?item=${item.uuid}`)}>Update</Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* EXPIRING ITEMS TAB */}
              {activeTab === 'expiring' && (
                <div className="divide-y divide-[var(--border)]">
                  {report.raw.expiring.expired.length === 0 && report.raw.expiring.expiringSoon.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">No expired or expiring items.</div>
                  ) : (
                    <>
                      {report.raw.expiring.expired.map((item, i) => (
                        <div key={`exp-${i}`} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)] bg-[var(--danger-subtle)]">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                            <p className="text-xs text-[var(--danger)] mt-1 font-semibold">Expired ({item.dateStr})</p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/vault?item=${item.uuid}`)}>Review</Button>
                        </div>
                      ))}
                      {report.raw.expiring.expiringSoon.map((item, i) => (
                        <div key={`soon-${i}`} className="p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)]">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h4>
                            <p className="text-xs text-[var(--warning)] mt-1">Expiring in {item.daysLeft} days ({item.dateStr})</p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/vault?item=${item.uuid}`)}>Review</Button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};