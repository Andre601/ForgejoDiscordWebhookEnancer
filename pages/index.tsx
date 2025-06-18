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
      <p>This is a simple site that allows you to generate a URL to have Gitea/Forgejo Webhooks filtered.</p>
      <h2>Why does this exist?</h2>
      <p>Gitea and Forgejo currently do not offer a way to fine-tune what sub-types of webhook events you want to have sent to your discord.<br>
      As such can it happen that you receive a webhook for an edit of an issue, pull request or release, even tho you didn't want that.<br>
      This is where this site comes into play! It allows you to set a collection of issue types that should be forwarded, with everything else being silently ignored.</p>
      <h2>How to Use</h2>
      <ol>
        <li>Create a Webhook URL in Discord if you haven't already.</li>
        <li>Paste the URL in the text field below.</li>
        <li>Select the Event types you want to have forwarded.</li>
        <li>Press the button to generate the URL</li>
        <li>Copy the URL and use it in Gitea/Forgejo as URL for a webhook (<b>Make sure to use a Gitea/Forgejo Webhook, NOT Discord!</b>)</li>
      </ol>
      <h2>Generator</h2>
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
