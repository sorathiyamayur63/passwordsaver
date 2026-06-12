import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, Globe, ShieldAlert, CheckCircle, XCircle, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, Button, Badge, Spinner, Tooltip } from '../components/ui';
import { deviceApi } from '../services/deviceApi';
import { authApi } from '../services/authApi';
import toast from 'react-hot-toast';

const getDeviceIcon = (os, type) => {
  if (type === 'mobile') return Smartphone;
  if (/iPad|Tablet/i.test(os)) return Tablet;
  return Monitor;
};
const getBrowserName = (ua = '') => {
  if (!ua) return 'Unknown Browser';

  if (/Edg\//i.test(ua)) return 'Edge Browser';
  if (/OPR\//i.test(ua)) return 'Opera Browser';
  if (/Firefox\//i.test(ua)) return 'Firefox Browser';
  if (/Chrome\//i.test(ua)) return 'Chrome Browser';
  if (/Safari\//i.test(ua)) return 'Safari Browser';

  return 'Unknown Browser';
};

export const DevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devRes, histRes] = await Promise.all([
        deviceApi.getDevices(),
        deviceApi.getLoginHistory()
      ]);
      console.log(Object.keys(devRes.data.devices[0]));
      setDevices(devRes.data.devices);
      setHistory(histRes.data.history);
    } catch (err) {
      toast.error('Failed to load device information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRevoke = async (uuid) => {
    try {
      await deviceApi.revokeDevice(uuid);
      toast.success('Device access revoked');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to revoke device');
    }
  };

  const handleRemoveDevice = async (uuid) => {
    try {
await deviceApi.deleteDeviceHistory(uuid);
      setDevices(prev =>
        prev.filter(device => device.uuid !== uuid)
      );

      toast.success('Device removed from history');
    } catch (err) {
      toast.error(err.message || 'Failed to remove device');
    }
  };

  const handleSignOutAll = async () => {
    if (!window.confirm('Are you sure you want to sign out all other devices?')) return;
    try {
      await authApi.logoutAllDevices();

setDevices(prev =>
  prev.filter(device => device.isCurrent)
);

toast.success('All other devices signed out');
    } catch (err) {
      toast.error('Failed to sign out other devices');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Device Management</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Review and manage devices connected to your vault.</p>
      </div>

      {/* Active Devices */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Active Devices</h2>
          <Button variant="outline" size="sm" onClick={handleSignOutAll}>Sign out all other devices</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map(device => {
            const Icon = getDeviceIcon(device.os, device.deviceType);
            return (
              //<Card key={device.uuid} padding="md" className={`flex flex-col h-full ${device.isRevoked ? 'opacity-60' : ''}`}>
              <Card
                key={device.uuid}
                padding="md"
                className={`relative flex flex-col h-full ${device.isRevoked ? 'opacity-60' : ''}`}
              >

               {!device.isCurrent && (
<button
  onClick={() => handleRemoveDevice(device.uuid)}
  className="
    absolute top-3 right-3
    h-7 w-7
    rounded-full
    flex items-center justify-center
    text-[var(--text-muted)]
    hover:bg-[var(--danger)]
    hover:text-white
    transition
  "
  title="Remove device history"
>
  <X className="h-4 w-4" />
</button>
)}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        {device.deviceName}
                        {device.isCurrent && <Badge variant="success" size="sm">Current</Badge>}
                        {device.isRevoked && <Badge variant="danger" size="sm">Revoked</Badge>}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Globe className="h-3 w-3" />  {device.browser}
                      </p>

                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border)]">
                  <div className="text-right">

                    <div className="text-xs text-[var(--text-secondary)]">
                      Active {formatDistanceToNow(new Date(device.lastActiveAt))} ago
                    </div>

                    {device.ip && (
                      <div className="text-xs text-[var(--text-muted)]">
                        IP: {device.ip}
                      </div>
                    )}

                    <div className="text-xs text-[var(--text-muted)]">
                      Added {format(new Date(device.createdAt), 'MMM d, yyyy')}
                    </div>

                  </div>

                  {!device.isRevoked && (
                    <Button variant="danger" size="sm" onClick={() => handleRevoke(device.uuid)}>Revoke access</Button>
                  )}
                </div>
              </Card>

            );

          })}
        </div>
      </div>

      {/* Login History */}
      <div className="space-y-4 pt-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-[var(--text-muted)]" />
          Recent Login Activity
        </h2>

        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-[var(--border)] max-h-96 overflow-y-auto">
            {history.map((event, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-[var(--bg-tertiary)] transition-colors gap-2">
                <div className="flex items-center gap-3">
                  {event.success ? <CheckCircle className="h-5 w-5 text-[var(--success)]" /> : <XCircle className="h-5 w-5 text-[var(--danger)]" />}
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {event.action === 'LOGIN_SUCCESS' ? 'Successful Login' : 'Failed Login Attempt'}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {getBrowserName(event.userAgent)}

                      {event.ipAddress && (
                        <>
                          {' '} • IP: {event.ipAddress}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-primary)]">{format(new Date(event.timestamp), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-[var(--text-muted)]">{format(new Date(event.timestamp), 'h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};