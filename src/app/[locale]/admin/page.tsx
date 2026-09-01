'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X, Upload, Trash2, Lock } from 'lucide-react';

type Sub = {
  id: string; billingCycle: string;
  user: { name: string; email: string };
  plan: { name: string };
  transactions: { amount: string; txHash: string; network: string }[];
};
type Bot = { id: string; version: string; title: string; fileName: string; fileSizeKb: number; isActive: boolean };

export default function AdminPage() {
  const t = useTranslations('Admin');
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [uploadMsg, setUploadMsg] = useState('');

  const load = useCallback(async (adminKey: string) => {
    const [subsRes, botsRes] = await Promise.all([
      fetch(`/api/admin/subscriptions?key=${adminKey}`),
      fetch(`/api/admin/bots?key=${adminKey}`),
    ]);
    if (subsRes.ok) setSubs(((await subsRes.json()) as { subscriptions?: Sub[] }).subscriptions || []);
    if (botsRes.ok) setBots(((await botsRes.json()) as { bots?: Bot[] }).bots || []);
  }, []);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('adminKey') : null;
    if (saved) {
      setKey(saved);
      setAuthed(true);
      load(saved);
    }
  }, [load]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem('adminKey', key);
    setAuthed(true);
    load(key);
  }

  async function handleAction(subscriptionId: string, action: 'approve' | 'reject') {
    await fetch(`/api/admin/subscriptions?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, action }),
    });
    load(key);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadMsg('');
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/bots?key=${key}`, { method: 'POST', body: form });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setUploadMsg(data.error || 'Error');
      return;
    }
    setUploadMsg('✓');
    e.currentTarget.reset();
    load(key);
  }

  async function handleDeleteBot(botId: string) {
    await fetch(`/api/admin/bots?key=${key}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId }),
    });
    load(key);
  }

  if (!authed) {
    return (
      <main className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
          <Lock className="w-6 h-6 text-gold mx-auto mb-2" />
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key"
            className="w-full px-4 py-2.5 rounded-lg bg-panel border border-border text-text text-center" />
          <button type="submit" className="w-full py-2.5 rounded-lg bg-gold text-bg font-semibold">{t('title')}</button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
      <h1 className="font-display text-2xl font-bold text-text mb-8">{t('title')}</h1>

      <section className="mb-10">
        <h2 className="font-display font-semibold text-text mb-4">{t('pendingSubscriptions')}</h2>
        {subs.length === 0 ? (
          <p className="text-text-muted text-sm">{t('noItems')}</p>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-panel border border-border flex items-center justify-between gap-4">
                <div className="text-sm">
                  <div className="text-text font-medium">{s.user.name} — {s.plan.name}</div>
                  <div className="text-text-muted text-xs mt-1">{s.user.email}</div>
                  {s.transactions[0] && (
                    <a href={`https://tronscan.org/#/transaction/${s.transactions[0].txHash}`} target="_blank" className="tabular text-xs text-gold hover:underline">
                      ${s.transactions[0].amount} · {s.transactions[0].txHash.slice(0, 10)}...
                    </a>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleAction(s.id, 'approve')} className="p-2 rounded-lg bg-up/15 text-up hover:bg-up/25"><Check className="w-4 h-4" /></button>
                  <button onClick={() => handleAction(s.id, 'reject')} className="p-2 rounded-lg bg-down/15 text-down hover:bg-down/25"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display font-semibold text-text mb-4">{t('botReleases')}</h2>
        <form onSubmit={handleUpload} className="p-4 rounded-xl bg-panel border border-border mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="version" placeholder="v1.0.0" required className="px-3 py-2 rounded-lg bg-panel-raised border border-border text-text text-sm" />
            <input name="title" placeholder="Title" required className="px-3 py-2 rounded-lg bg-panel-raised border border-border text-text text-sm" />
          </div>
          <textarea name="description" placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg bg-panel-raised border border-border text-text text-sm" />
          <input type="file" name="file" required className="text-sm text-text-muted" />
          <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-bg text-sm font-semibold">
            <Upload className="w-4 h-4" />{t('uploadBot')}
          </button>
          {uploadMsg && <span className="text-xs text-text-muted ms-2">{uploadMsg}</span>}
        </form>
        <div className="space-y-2">
          {bots.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-panel border border-border text-sm">
              <div>
                <span className="text-text font-medium">{b.title}</span>{' '}
                <span className="tabular text-text-muted text-xs">{b.version} · {b.fileSizeKb}KB</span>
              </div>
              <button onClick={() => handleDeleteBot(b.id)} className="p-1.5 rounded-lg text-down hover:bg-down/10"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
