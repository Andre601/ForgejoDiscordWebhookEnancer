import { useState } from 'react';
import { EventFlags, EventLabels, EventKey } from '../lib/events';

export default function Home() {
  const [webhook, setWebhook] = useState('');
  const [selected, setSelected] = useState<EventKey[]>([]);
  const [generated, setGenerated] = useState('');

  const toggle = (key: EventKey) => {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const generate = () => {
    try {
      const url = new URL(webhook);
      const parts = url.pathname.split('/');
      const id = parts[3];
      const token = parts[4];

      const sum = selected.reduce((acc, key) => acc + EventFlags[key], 0);
      const encoded = sum.toString(36); // base36 encoding

      const result = `${window.location.origin}/api/webhooks/${id}/${token}/${encoded}`;
      setGenerated(result);
    } catch {
      alert('Invalid Discord webhook URL');
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Forgejo → Discord Webhook Generator</h1>
      <input
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        placeholder="Discord Webhook URL"
        value={webhook}
        onChange={e => setWebhook(e.target.value)}
      />
      {Object.entries(EventLabels).map(([key, label]) => (
        <label key={key} style={{ display: 'block', margin: '4px 0' }}>
          <input
            type="checkbox"
            checked={selected.includes(key as EventKey)}
            onChange={() => toggle(key as EventKey)}
          />{' '}
          {label}
        </label>
      ))}
      <button onClick={generate} style={{ marginTop: '1rem' }}>Generate</button>
      {generated && (
        <p style={{ marginTop: '1rem' }}>
          <strong>Webhook URL:</strong><br />
          <code>{generated}</code>
        </p>
      )}
    </main>
  );
}
