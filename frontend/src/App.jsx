import { useCallback, useEffect, useMemo, useState } from 'react';

const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'orders', label: 'Orders', icon: '▤' },
  { id: 'quotes', label: 'Quotations', icon: '＄' },
  { id: 'studio', label: 'Embroidery studio', icon: '✳' },
  { id: 'assistant', label: 'AI assistant', icon: '✦' },
  { id: 'leads', label: 'Customers & leads', icon: '◉' },
  { id: 'classic', label: 'Classic workspace', icon: '↗' }
];
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const orderStageLabels = [
  'Inquiry & AI quotation',
  'Digital tech-pack',
  'Proof approval',
  'Garment sourcing',
  'Embroidery',
  'Quality inspection',
  'Packaging',
  'Dispatch'
];

const currency = (amount) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format(Number(amount) || 0);

async function request(path, token, options = {}) {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new Error('The API URL is not configured. Set VITE_API_URL to your deployed Spring Boot API URL in Netlify.');
  }
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  return payload;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const session = await request(`/auth/${mode}`, null, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      onAuthenticated(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <div className="brand-lockup"><span className="brand-mark">S</span><span>stitch<span className="brand-ai">ai</span></span></div>
        <div className="auth-pitch">
          <span className="eyebrow">THE OPERATING SYSTEM FOR APPAREL</span>
          <h1>From first stitch<br />to final shipment.</h1>
          <p>Bring your sales, embroidery, production, and customers together in one considered workspace.</p>
          <div className="auth-proof"><span className="avatar-stack"><i>AM</i><i>JK</i><i>SL</i></span><span>Built for the people behind every great garment.</span></div>
        </div>
        <span className="auth-footnote">DESIGNED FOR MAKERS, BUILT TO SCALE.</span>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="muted">{mode === 'login' ? 'Sign in to pick up where you left off.' : 'Get your apparel operations in order.'}</p>
          {mode === 'register' && <label>Your name<input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" /></label>}
          <label>Work email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></label>
          <label>Password<input required type="password" minLength={10} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 10 characters" /></label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
          <p className="auth-toggle">{mode === 'login' ? 'New to StitchAI?' : 'Already have a workspace?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <p className="security-note">Protected with encrypted passwords and signed session tokens.</p>
        </form>
      </section>
    </main>
  );
}

function MetricCard({ label, value, change, tone = 'green' }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>↗</span></div><strong>{value}</strong><span className="metric-change">{change}</span></article>;
}

function SectionHeading({ kicker, title, detail, action }) {
  return <div className="section-heading"><div><span className="eyebrow">{kicker}</span><h1>{title}</h1>{detail && <p>{detail}</p>}</div>{action}</div>;
}

function OrderTable({ orders, onStage }) {
  return <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>GARMENT</th><th>QUANTITY</th><th>STATUS</th><th>TOTAL</th><th>PROGRESS</th></tr></thead><tbody>
    {orders.map((order) => <tr key={order.id}><td><span className="order-id">{order.id}</span><small>{String(order.created_at || '').slice(0, 10)}</small></td><td><strong>{order.client}</strong><small>{order.title}</small></td><td>{order.garment}</td><td>{order.quantity}</td><td><span className={`status-pill ${String(order.payment_status).toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>{order.payment_status}</span></td><td>{currency(order.total_price)}</td><td><button className="text-button" onClick={() => onStage(order)}>{order.stage_title || `Stage ${order.current_stage}`} →</button></td></tr>)}
    {!orders.length && <tr><td colSpan="7" className="empty-state">No orders to show yet. Start with a quotation.</td></tr>}
  </tbody></table></div>;
}

function Overview({ data, onNavigate, onStage, kicker }) {
  const orders = data.orders || [];
  const leads = data.leads || [];
  const paid = orders.filter((order) => String(order.payment_status).toLowerCase() === 'paid').length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0);
  return <>
    <SectionHeading kicker={kicker} title="A good day to make something." detail="Here’s what’s happening across your shop." action={<button className="button button-primary" onClick={() => onNavigate('quotes')}>＋ Create a quote</button>} />
    <div className="metrics-grid"><MetricCard label="Active orders" value={orders.length} change="Across your production floor" /><MetricCard label="Order value" value={currency(revenue)} change="Current order book" tone="blue" /><MetricCard label="Payments received" value={paid} change={`${orders.length - paid} orders awaiting payment`} tone="orange" /><MetricCard label="Qualified leads" value={leads.length} change="Ready for a conversation" tone="purple" /></div>
    <section className="content-card"><div className="card-heading"><div><h2>Recent orders</h2><p>Keep a pulse on every garment in motion.</p></div><button className="text-button" onClick={() => onNavigate('orders')}>View all orders →</button></div><OrderTable orders={orders.slice(0, 5)} onStage={onStage} /></section>
    <div className="lower-grid"><section className="content-card"><div className="card-heading"><div><h2>Production at a glance</h2><p>Orders moving through your workflow.</p></div></div><div className="production-list">{orderStageLabels.slice(0, 5).map((stage, index) => { const count = orders.filter((order) => Number(order.current_stage) === index).length; return <div className="production-row" key={stage}><span className={`stage-dot stage-${index}`} /><span>{stage}</span><strong>{count}</strong></div>; })}</div></section><section className="content-card"><div className="card-heading"><div><h2>Promising conversations</h2><p>Your highest-intent leads.</p></div><button className="text-button" onClick={() => onNavigate('leads')}>View CRM →</button></div><div className="lead-list">{leads.slice(0, 3).map((lead) => <div className="lead-row" key={lead.id}><div className="lead-avatar">{String(lead.name).split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="lead-info"><strong>{lead.name}</strong><small>{lead.org}</small></div><span className="lead-score">{lead.intent_score}%</span></div>)}</div></section></div>
  </>;
}

function Quotes({ token, onCreated, onOrderCreated }) {
  const [form, setForm] = useState({ clientName: '', garmentType: 'hoodie', quantity: 150, stitches: 16840, placements: 1, speed: 'standard', polybagging: true, wovenTags: false });
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  function update(key, value) { setForm((previous) => ({ ...previous, [key]: value })); }
  async function create(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await request('/quotes', token, { method: 'POST', body: JSON.stringify({ ...form, quantity: Number(form.quantity), stitches: Number(form.stitches), placements: Number(form.placements) }) }); setQuote(result); onCreated(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function createOrder() {
    if (!quote) return;
    setBusy(true); setError('');
    try {
      await request('/orders', token, {
        method: 'POST',
        body: JSON.stringify({
          client: quote.clientName,
          title: `${quote.quantity}x ${quote.garmentType} custom apparel order`,
          garment: quote.garmentType,
          quantity: quote.quantity,
          stitchCount: quote.stitches,
          totalPrice: quote.totalAmount
        })
      });
      await onOrderCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return <><SectionHeading kicker="PRICING, WITHOUT THE GUESSWORK" title="Build a quotation" detail="A clear, considered quote makes the next conversation easier." /><div className="split-layout"><form className="content-card form-card" onSubmit={create}><div className="card-heading"><div><h2>Project details</h2><p>Shape a quote around the work you’re making.</p></div></div><label>Customer or organization<input required value={form.clientName} onChange={(e) => update('clientName', e.target.value)} placeholder="e.g. Northstar Running Club" /></label><div className="form-row"><label>Garment<select value={form.garmentType} onChange={(e) => update('garmentType', e.target.value)}><option value="hoodie">Heavyweight hoodie</option><option value="tshirt">T-shirt</option><option value="polo">Polo</option><option value="cap">Cap</option><option value="bomber">Bomber jacket</option><option value="apron">Canvas apron</option></select></label><label>Quantity<input type="number" min="1" max="10000" required value={form.quantity} onChange={(e) => update('quantity', e.target.value)} /></label></div><div className="form-row"><label>Stitches per placement<input type="number" min="0" value={form.stitches} onChange={(e) => update('stitches', e.target.value)} /></label><label>Embroidery placements<input type="number" min="1" max="8" value={form.placements} onChange={(e) => update('placements', e.target.value)} /></label></div><label>Turnaround<select value={form.speed} onChange={(e) => update('speed', e.target.value)}><option value="standard">Standard · 7–10 business days</option><option value="express">Express · 4–6 business days</option><option value="rush">Rush · 48–72 hours</option></select></label><div className="check-row"><label><input type="checkbox" checked={form.polybagging} onChange={(e) => update('polybagging', e.target.checked)} /> Individual polybagging</label><label><input type="checkbox" checked={form.wovenTags} onChange={(e) => update('wovenTags', e.target.checked)} /> Woven labels</label></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Calculating…' : 'Calculate & save quote'} <span>→</span></button></form><aside className="quote-aside">{quote ? <div className="quote-result"><span className="eyebrow">QUOTE SAVED · {quote.id}</span><h2>{currency(quote.totalAmount)}</h2><p>{currency(quote.unitPrice)} per piece · {quote.leadTime}</p><div className="quote-detail"><span>Customer</span><strong>{quote.clientName}</strong></div><div className="quote-detail"><span>Valid until</span><strong>{quote.validUntil}</strong></div><button className="button button-secondary button-wide" onClick={() => window.print()}>Print / save as PDF</button><button className="button button-primary button-wide create-order-button" disabled={busy} onClick={createOrder}>{busy ? 'Creating order…' : 'Create a production order'} <span>→</span></button>{error && <p className="error-message" role="alert">{error}</p>}</div> : <div className="quote-placeholder"><span className="quote-emblem">＄</span><h2>A quote that adds up.</h2><p>Every estimate considers garment tiers, stitch density, production speed, and finishing.</p><div className="quote-sample"><span>Digitizing fee</span><strong>Waived at 50+ pieces</strong></div><div className="quote-sample"><span>Volume pricing</span><strong>Applied automatically</strong></div></div>}</aside></div></>;
}

function Assistant({ token }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hi! I can help with garment selection, embroidery planning, production timelines, and pricing. What are you working on?' }]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); const message = text.trim(); if (!message || busy) return;
    setMessages((previous) => [...previous, { role: 'user', content: message }]); setText(''); setBusy(true); setError('');
    try { const result = await request('/ai/chat', token, { method: 'POST', body: JSON.stringify({ message }) }); setMessages((previous) => [...previous, { role: 'assistant', content: result.answer, sources: result.sources || [], mode: result.mode }]); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <><SectionHeading kicker="STITCHAI INTELLIGENCE" title="Your production copilot." detail="Ask practical questions. Answers are grounded in your StitchAI knowledge base." /><section className="chat-card"><div className="chat-header"><div className="assistant-icon">✦</div><div><strong>StitchAI assistant</strong><small>Garment, embroidery & production guidance</small></div><span className="online-pill">● READY</span></div><div className="chat-messages">{messages.map((message, i) => <div className={`message ${message.role}`} key={`${i}-${message.content.slice(0, 12)}`}><div>{message.content}</div>{message.sources?.length > 0 && <small className="source-list">Knowledge used: {message.sources.join(' · ')}</small>}{message.mode === 'local-rag' && <small className="source-list">Local retrieval mode · configure GEMINI_API_KEY for generated answers</small>}</div>)}{busy && <div className="message assistant typing">Searching the knowledge base…</div>}</div>{error && <p className="error-message chat-error" role="alert">{error}</p>}<form className="chat-composer" onSubmit={submit}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about stitches, fabrics, pricing, or timelines…" /><button className="button button-primary" disabled={busy || !text.trim()}>Send <span>↑</span></button></form></section><p className="chat-disclaimer">AI suggestions are informational. Confirm production specifications with your digitizer before manufacturing.</p></>;
}

function Studio({ token }) {
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function analyze(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const analysis = await request('/artworks/analyze', token, { method: 'POST', body: JSON.stringify({ filename: filename || 'custom-artwork.png' }) }); setResult(analysis); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <><SectionHeading kicker="DIGITIZING & THREAD PLANNING" title="Embroidery studio" detail="Estimate stitch complexity and find a sensible production starting point." /><div className="split-layout"><form className="content-card form-card" onSubmit={analyze}><div className="upload-zone"><span className="upload-icon">✳</span><strong>Analyze an artwork concept</strong><p>Start with a file name. Detailed upload analysis is on the roadmap.</p><input aria-label="Artwork filename" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="logo-file.svg" /></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary" disabled={busy}>{busy ? 'Analyzing…' : 'Run stitch estimate'} <span>→</span></button></form><section className="content-card analysis-card"><span className="eyebrow">ANALYSIS</span>{result ? <><h2>{result.filename}</h2><div className="analysis-stats"><div><strong>{Number(result.stitchCount).toLocaleString()}</strong><span>estimated stitches</span></div><div><strong>{result.complexityScore}/100</strong><span>complexity score</span></div><div><strong>{result.colorCount}</strong><span>thread colors</span></div></div><p className="muted">{result.recommendedBacking}</p><div className="thread-swatches">{(result.threadColors || []).map((thread) => <span title={`${thread.name} · ${thread.code}`} key={thread.code} style={{ background: thread.hex }} />)}</div></> : <div className="analysis-empty"><span>✧</span><h2>Your stitch plan starts here.</h2><p>Run an estimate to see stitch count, complexity, thread recommendations, and puff eligibility.</p></div>}</section></div></>;
}

function Leads({ leads }) {
  return <><SectionHeading kicker="CUSTOMER RELATIONSHIPS" title="Good work starts with good conversations." detail="A simple view of the opportunities in your pipeline." /><section className="content-card"><div className="card-heading"><div><h2>Lead pipeline</h2><p>Prioritized by intent score.</p></div></div><div className="table-wrap"><table><thead><tr><th>CONTACT</th><th>ORGANIZATION</th><th>OPPORTUNITY</th><th>INTENT</th><th>STAGE</th><th>CHANNEL</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><small>{lead.id}</small></td><td>{lead.org}</td><td>{lead.deal_size}</td><td><span className="lead-score">{lead.intent_score}%</span></td><td>{lead.stage}</td><td>{lead.channel}</td></tr>)}{!leads.length && <tr><td className="empty-state" colSpan="6">Your new leads will appear here.</td></tr>}</tbody></table></div></section></>;
}

function Orders({ orders, onStage }) {
  return <><SectionHeading kicker="PRODUCTION OPERATIONS" title="Every order, in good hands." detail="Track progress from the first inquiry through delivery." /><section className="content-card"><div className="card-heading"><div><h2>Order book</h2><p>{orders.length} orders in the system</p></div></div><OrderTable orders={orders} onStage={onStage} /></section></>;
}

function ClassicWorkspace({ token }) {
  useEffect(() => { document.body.classList.add('classic-page'); return () => document.body.classList.remove('classic-page'); }, []);
  return <div className="classic-frame"><iframe title="Classic StitchAI workspace" src="/legacy/index.html" allow="microphone; clipboard-read; clipboard-write" /><span className="classic-token-note">The classic workspace uses the same protected API session. Refresh this page after signing in if it asks you to authenticate.</span><span data-session-token={token} hidden /></div>;
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stitchai-session')) || null; } catch { return null; }
  });
  const [page, setPage] = useState('overview');
  const [data, setData] = useState({ orders: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.token) return;
    setError('');
    try { setData(await request('/dashboard', session.token)); }
    catch (err) { if (/token|unauthorized|expired/i.test(err.message)) signOut(); else setError(err.message); }
    finally { setLoading(false); }
  }, [session?.token]);

  function authenticate(value) { localStorage.setItem('stitchai-session', JSON.stringify(value)); setSession(value); setPage('overview'); setLoading(true); }
  function signOut() { localStorage.removeItem('stitchai-session'); setSession(null); setData({ orders: [], leads: [] }); setLoading(false); }

  useEffect(() => { if (session?.token) refresh(); else setLoading(false); }, [session?.token, refresh]);

  async function advanceOrder(order) {
    const next = Math.min(Number(order.current_stage || 0) + 1, 7);
    try { await request(`/orders/${encodeURIComponent(order.id)}/stage`, session.token, { method: 'PATCH', body: JSON.stringify({ stage: next }) }); await refresh(); }
    catch (err) { setError(err.message); }
  }

  const pageTitle = useMemo(() => navigation.find((item) => item.id === page)?.label || 'Overview', [page]);
  const today = useMemo(() => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(new Date()).toUpperCase(), []);
  const todayShort = useMemo(() => new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(new Date()).toUpperCase(), []);

  if (!session?.token) return <AuthScreen onAuthenticated={authenticate} />;
  if (page === 'classic') return <><div className="classic-toolbar"><button className="button button-secondary" onClick={() => setPage('overview')}>← Back to React dashboard</button><span>CLASSIC STITCHAI WORKSPACE</span></div><ClassicWorkspace token={session.token} /></>;

  let pageContent;
  if (loading) {
    pageContent = <div className="loading-state"><span className="loader" />Loading your workspace…</div>;
  } else if (page === 'overview') {
    pageContent = <Overview data={data} onNavigate={setPage} onStage={advanceOrder} kicker={today} />;
  } else if (page === 'orders') {
    pageContent = <Orders orders={data.orders || []} onStage={advanceOrder} />;
  } else if (page === 'quotes') {
    pageContent = <Quotes
      token={session.token}
      onCreated={refresh}
      onOrderCreated={async () => {
        await refresh();
        setPage('orders');
      }}
    />;
  } else if (page === 'assistant') {
    pageContent = <Assistant token={session.token} />;
  } else if (page === 'studio') {
    pageContent = <Studio token={session.token} />;
  } else {
    pageContent = <Leads leads={data.leads || []} />;
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup"><span className="brand-mark">S</span><span>stitch<span className="brand-ai">ai</span></span></div>
      <div className="workspace-switch"><span className="workspace-avatar">{String(session.name || 'S')[0].toUpperCase()}</span><span><strong>{session.name || 'My workspace'}</strong><small>Apparel workspace</small></span><span className="workspace-chevron">⌄</span></div>
      <span className="nav-label">WORKSPACE</span>
      <nav className="side-nav">{navigation.map((item) => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => { setPage(item.id); setMobileMenu(false); }}><span className="nav-icon">{item.icon}</span>{item.label}{item.id === 'assistant' && <i className="nav-new">AI</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><span>✦</span><strong>Need a hand?</strong><small>Your production copilot is one click away.</small><button onClick={() => setPage('assistant')}>Ask StitchAI →</button></div><button className="profile-button" onClick={signOut}><span className="profile-avatar">{String(session.name || 'S')[0].toUpperCase()}</span><span><strong>{session.name}</strong><small>{session.email}</small></span><span className="signout-icon">↗</span></button></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">☰</button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{pageTitle}</strong></div><div className="topbar-right"><span className="connection-status"><i /> All systems operational</span><span className="topbar-date">{todayShort}</span><button className="top-avatar" title={session.name}>{String(session.name || 'S')[0].toUpperCase()}</button></div></header>
      <main className="main-content">
        {error && <div className="page-error" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
        {pageContent}
        <footer className="page-footer"><span>STITCHAI · MADE FOR THE MAKERS</span><span>Thoughtful production, from first stitch to final shipment.</span></footer>
      </main>
    </div>
  </div>;
}
