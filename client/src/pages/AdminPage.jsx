import { useCallback, useEffect, useState } from 'react';

const PUBLIC_SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin.replace(/^(https?:\/\/)admin\./, '$1')).replace(/\/$/, '');
const emptyForm = {
  title: '',
  catalogueNumber: '',
  description: '',
  material: '',
  culture: '',
  geographicalOrigin: '',
  estimatedPeriod: '',
  height: '',
  width: '',
  length: '',
  provenance: '',
  conservationStatus: '',
  interpretiveNotes: '',
  status: 'DRAFT',
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The request could not be completed.');
  return payload;
}

function Field({ label, name, value, onChange, required = false, multiline = false, type = 'text' }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <label className={multiline ? 'admin-field admin-field-wide' : 'admin-field'}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <Tag name={name} value={value} onChange={onChange} required={required} type={multiline ? undefined : type} rows={multiline ? 4 : undefined} />
    </label>
  );
}

export default function AdminPage() {
  const [authState, setAuthState] = useState('loading');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Administrator sign in · Onikan Chronicles';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.append(meta);
    return () => {
      document.title = previousTitle;
      meta.remove();
    };
  }, []);

  const loadArtifacts = useCallback(async () => {
    const result = await request('/api/admin/artifacts');
    setArtifacts(result.items || []);
  }, []);

  useEffect(() => {
    request('/api/auth/me')
      .then(async ({ user: currentUser }) => {
        setUser(currentUser);
        setAuthState('ready');
        await loadArtifacts();
      })
      .catch(() => setAuthState('signed-out'));
  }, [loadArtifacts]);

  async function signIn(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(result.user);
      setPassword('');
      setAuthState('ready');
      await loadArtifacts();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setArtifacts([]);
    setAuthState('signed-out');
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function imageDataUrl(file) {
    if (!file) return null;
    if (file.size > 8 * 1024 * 1024) throw new Error('Images must be 8 MB or smaller.');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The selected image could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadPhoto(artifactId, file) {
    const altText = file.name.replace(/\.[^.]+$/, '');
    if (import.meta.env.PROD) {
      const signed = await request(`/api/admin/artifacts/${encodeURIComponent(artifactId)}/images/signature`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signed.apiKey);
      formData.append('timestamp', String(signed.timestamp));
      formData.append('folder', signed.folder);
      formData.append('public_id', signed.publicId);
      formData.append('signature', signed.signature);
      const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`, { method: 'POST', body: formData });
      const cloudResult = await cloudResponse.json().catch(() => ({}));
      if (!cloudResponse.ok) throw new Error(cloudResult.error?.message || 'Image upload failed.');
      await request(`/api/admin/artifacts/${encodeURIComponent(artifactId)}/images`, {
        method: 'POST',
        body: JSON.stringify({ url: cloudResult.secure_url, publicId: cloudResult.public_id, altText }),
      });
      return;
    }

    const dataUrl = await imageDataUrl(file);
    await request(`/api/admin/artifacts/${encodeURIComponent(artifactId)}/images`, {
      method: 'POST',
      body: JSON.stringify({ dataUrl, altText }),
    });
  }

  async function saveArtifact(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const { artifact } = await request(editingId ? `/api/admin/artifacts/${encodeURIComponent(editingId)}` : '/api/admin/artifacts', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });
      setEditingId(artifact.id);
      if (photo) {
        await uploadPhoto(artifact.id, photo);
      }
      setForm(emptyForm);
      setEditingId(null);
      setPhoto(null);
      event.target.reset();
      await loadArtifacts();
      setMessage(`${artifact.title} ${artifact.status === 'PUBLISHED' ? 'is now public' : 'saved as a draft'}.`);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  }

  function editArtifact(artifact) {
    setEditingId(artifact.id);
    setForm(Object.fromEntries(Object.keys(emptyForm).map((key) => [key, artifact[key] ?? (key === 'status' ? 'DRAFT' : '')])));
    setPhoto(null);
    setError('');
    setMessage('');
    document.getElementById('artifact-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearEditor() {
    setEditingId(null);
    setForm(emptyForm);
    setPhoto(null);
    setMessage('');
    setError('');
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Chronicles</span></a>
        <a className="admin-public-link" href={PUBLIC_SITE_URL}>View public site ↗</a>
        {user && <button type="button" className="admin-signout" onClick={signOut}>Sign out</button>}
      </header>

      {authState === 'loading' && <div className="admin-loading" role="status">Checking your sign-in…</div>}
      {authState === 'signed-out' && (
        <section className="login-card">
          <p className="eyebrow">Staff access</p>
          <h1>Welcome <em>back.</em></h1>
          <p>Sign in to document, manage, and publish collection records.</p>
          <form onSubmit={signIn} className="login-form">
            <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      )}

      {authState === 'ready' && (
        <section className="admin-content">
          <div className="admin-heading">
            <div><p className="eyebrow">Collection management</p><h1>Good to see you{user?.name ? `, ${user.name}` : ''}.</h1></div>
            <p>Signed in as {user?.email} · {user?.role?.toLowerCase()}</p>
          </div>
          <div className="admin-columns">
            <form className="artifact-form" id="artifact-editor" onSubmit={saveArtifact}>
              <div className="admin-form-heading"><div><p className="eyebrow">{editingId ? 'Edit record' : 'New record'}</p><h2>{editingId ? 'Update this object' : 'Add an object'}</h2></div><span>Fields marked * are required.</span></div>
              <div className="admin-form-grid">
                <Field label="Object title" name="title" value={form.title} onChange={updateField} required />
                <Field label="Catalogue number" name="catalogueNumber" value={form.catalogueNumber} onChange={updateField} required />
                <Field label="Description" name="description" value={form.description} onChange={updateField} required multiline />
                <Field label="Material" name="material" value={form.material} onChange={updateField} />
                <Field label="Culture" name="culture" value={form.culture} onChange={updateField} />
                <Field label="Geographical origin" name="geographicalOrigin" value={form.geographicalOrigin} onChange={updateField} />
                <Field label="Estimated period" name="estimatedPeriod" value={form.estimatedPeriod} onChange={updateField} />
                <Field label="Height (cm)" name="height" value={form.height} onChange={updateField} type="number" />
                <Field label="Width (cm)" name="width" value={form.width} onChange={updateField} type="number" />
                <Field label="Length (cm)" name="length" value={form.length} onChange={updateField} type="number" />
                <Field label="Conservation status" name="conservationStatus" value={form.conservationStatus} onChange={updateField} />
                <div className="admin-field admin-publication"><span>Publication</span><div className="publication-options" role="group" aria-label="Publication status"><button type="button" aria-pressed={form.status === 'DRAFT'} className={form.status === 'DRAFT' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'DRAFT' }))}>Save as draft</button><button type="button" aria-pressed={form.status === 'PUBLISHED'} className={form.status === 'PUBLISHED' ? 'selected' : ''} onClick={() => setForm((current) => ({ ...current, status: 'PUBLISHED' }))}>Publish now</button></div><small>Published records appear in the public collection.</small></div>
                <Field label="Provenance" name="provenance" value={form.provenance} onChange={updateField} multiline />
                <Field label="Interpretive notes" name="interpretiveNotes" value={form.interpretiveNotes} onChange={updateField} multiline />
                <label className="admin-field admin-field-wide"><span>Photograph <small>PNG, JPG, or WebP · up to 8 MB</small></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] || null)} /></label>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="form-success" role="status">{message}</p>}
              <div className="admin-form-actions"><button className="button button-dark admin-save" type="submit" disabled={saving}>{saving ? 'Saving record…' : editingId ? 'Update object' : 'Save object'} <span aria-hidden="true">↗</span></button>{editingId && <button type="button" className="admin-cancel-edit" onClick={clearEditor}>Cancel edit</button>}</div>
            </form>
            <aside className="admin-records">
              <p className="eyebrow">The archive</p><h2>Records <span>{artifacts.length}</span></h2>
              {artifacts.length ? <ul>{artifacts.map((artifact) => <li key={artifact.id}>
                <div><strong>{artifact.title}</strong><span>{artifact.catalogueNumber} · {artifact.status.toLowerCase()}</span></div>
                <div className="admin-record-actions"><button type="button" onClick={() => editArtifact(artifact)}>Edit</button>{artifact.status === 'PUBLISHED' && <a href={`${PUBLIC_SITE_URL}/artifacts/${encodeURIComponent(artifact.id)}`} target="_blank" rel="noreferrer">View ↗</a>}</div>
              </li>)}</ul> : <p className="admin-empty">No records yet. Add the first object using the form.</p>}
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
