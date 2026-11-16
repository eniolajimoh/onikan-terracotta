import { useEffect, useMemo, useState } from 'react';
import AdminPage from './AdminPage.jsx';
import ArtifactPage from './ArtifactPage.jsx';
import LearnPage from './LearnPage.jsx';
import ReferencesPage from './ReferencesPage.jsx';
import QRPanel from '../components/QRPanel.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';
const heroImage = '/bronze-bowl.png';

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow">↗</span>;
}

function ArtifactCard({ artifact }) {
  const image = artifact.images?.[0];
  const categories = artifact.categories?.map(({ category }) => category.name) || [];

  return (
    <article className="artifact-card">
      <a className="artifact-image-link" href={`/artifacts/${encodeURIComponent(artifact.id)}`} aria-label={`View ${artifact.title}`}>
        {image?.url ? (
          <img className="artifact-image" src={image.url} alt={image.altText || artifact.title} loading="lazy" />
        ) : (
          <div className="artifact-image image-placeholder" aria-label="No photograph uploaded yet">
            <span>Image pending</span>
          </div>
        )}
        <span className="card-index">{artifact.catalogueNumber}</span>
      </a>
      <div className="artifact-card-copy">
        <div className="card-meta">{categories[0] || artifact.material || 'Collection object'}</div>
        <h3><a href={`/artifacts/${encodeURIComponent(artifact.id)}`}>{artifact.title}</a></h3>
        <p>{artifact.description}</p>
        <a className="text-link" href={`/artifacts/${encodeURIComponent(artifact.id)}`}>Explore object <ArrowIcon /></a>
      </div>
    </article>
  );
}

function HomePage() {
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [collectionState, setCollectionState] = useState('loading');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchText.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: '6', page: String(page) });
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);

    setCollectionState('loading');
    fetch(`${API_URL}/api/artifacts?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Collection could not be loaded');
        return response.json();
      })
      .then((payload) => {
        setArtifacts(payload.items || []);
        setCategories(payload.categories || []);
        setPages(payload.pages || 1);
        setTotal(payload.total || 0);
        setCollectionState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCollectionState('unavailable');
      });

    return () => controller.abort();
  }, [search, activeCategory, page]);

  useEffect(() => {
    setPage(1);
  }, [search, activeCategory]);

  const collectionMessage = useMemo(() => {
    if (collectionState === 'loading') return 'Gathering records from the collection…';
    if (collectionState === 'unavailable') return 'The collection is temporarily unavailable. Please try again shortly.';
    if (artifacts.length === 0 && search) return `No published objects match “${search}”.`;
    if (artifacts.length === 0) return 'Newly published objects will appear here as the collection grows.';
    return '';
  }, [artifacts.length, collectionState, search]);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Onikan Terracotta Documentation home">
          <span className="wordmark-symbol" aria-hidden="true">O</span>
          <span>Onikan<br />Documentation</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#collection">Collection</a>
          <a href="#story">Our story</a>
          <a href="/learn">Learn</a>
          <a href="/references">References</a>
        </nav>
        <a className="header-cta" href="#collection">Explore the archive <ArrowIcon /></a>
        <a className="mobile-menu" href="#collection" aria-label="Skip to collection">Explore <span aria-hidden="true">↓</span></a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> Digital artifact documentation</p>
            <h1 id="hero-title">Every object<br />holds a <em>story.</em></h1>
            <p className="hero-intro">A living archive of Onikan’s terracotta and sculptural heritage—documented with care, shared for everyone.<span className="hero-project-credit">Documented by Fatiah Jimoh as part of her final-year project, supervised by <a href="https://sci.ui.edu.ng/node/1510" target="_blank" rel="noreferrer">Dr. E. A. Orijemie, Faculty of Science, University of Ibadan</a>.</span></p>
            <div className="hero-actions">
              <a className="button button-dark" href="#collection">Explore the collection <ArrowIcon /></a>
              <a className="quiet-link" href="#story">Discover the project <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-note"><span className="note-rule" /> A growing record, shaped by research and community.</div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap">
              <img src={heroImage} alt="Decorated bronze bowl documented for the Onikan collection" />
              <span className="image-number">FIG. 01</span>
              <div className="image-caption"><span>Bronze bowl</span><span>Project image</span></div>
            </div>
            <div className="hero-vertical-label">MEMORY · MATERIAL · MEANING</div>
            <div className="hero-seal" aria-hidden="true"><span>O</span><small>ONIKAN<br />ARCHIVE</small></div>
          </div>
          <div className="hero-bottomline"><span>Lagos, Nigeria</span><span>Preserving knowledge · Sharing context</span><span>Scroll to explore ↓</span></div>
        </section>

        <section className="collection section-pad" id="collection" aria-labelledby="collection-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The archive</p>
              <h2 id="collection-title">Objects, <em>documented.</em></h2>
            </div>
            <p className="section-intro">Explore the collection through photographs, material histories and research-backed records.</p>
          </div>
          <div className="collection-tools">
            <label className="search-box">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <span className="sr-only">Search published objects</span>
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search the collection" />
              <kbd>↵</kbd>
            </label>
            <span className="collection-note">{total} published {total === 1 ? 'object' : 'objects'}</span>
          </div>
          {!!categories.length && <div className="category-filters" aria-label="Filter by category">
            <button type="button" className={!activeCategory ? 'filter-chip active' : 'filter-chip'} onClick={() => setActiveCategory('')}>All objects</button>
            {categories.map((category) => <button type="button" key={category.slug} className={activeCategory === category.slug ? 'filter-chip active' : 'filter-chip'} onClick={() => setActiveCategory(category.slug)}>{category.name}</button>)}
          </div>}
          {collectionMessage ? (
            <div className={`collection-state ${collectionState}`} role="status">{collectionMessage}</div>
          ) : (
            <div className="artifact-grid">{artifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)}</div>
          )}
          <div className="collection-foot"><span>Records are added as research develops.</span><div className="collection-page-controls">{pages > 1 && <><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>← Previous</button><span>{page} / {pages}</span><button type="button" onClick={() => setPage((current) => Math.min(pages, current + 1))} disabled={page === pages}>Next →</button></>}<a className="text-link" href="/references">Read our sources <ArrowIcon /></a></div></div>
        </section>

        <section className="story section-pad" id="story" aria-labelledby="story-title">
          <div className="story-mark" aria-hidden="true">O</div>
          <div className="story-copy">
            <p className="eyebrow">Why this archive</p>
            <h2 id="story-title">Documentation is an act of <em>care.</em></h2>
            <p>Objects carry more than form. They hold relationships, making traditions, places and histories. This archive brings available research together so each record can be read with context—and can keep growing as knowledge deepens.</p>
            <a className="text-link" href="/learn">Learn about the project <ArrowIcon /></a>
          </div>
          <div className="story-aside"><span className="aside-number">01 / 03</span><p>Built for an open-ended collection and for the people who care for it.</p></div>
        </section>

        <section className="learn section-pad" id="learn" aria-labelledby="learn-title">
          <div className="learn-topline"><p className="eyebrow">Go beyond the object</p><span>Knowledge in context</span></div>
          <h2 id="learn-title">A place to look<br />closer, and <em>learn.</em></h2>
          <div className="learn-grid">
            <a className="learn-card" href="/learn#materials"><span className="learn-index">01</span><span className="learn-title">Materials &amp; making</span><span className="learn-desc">Explore the knowledge, skill and techniques held in each object.</span><ArrowIcon /></a>
            <a className="learn-card" href="/learn#preservation"><span className="learn-index">02</span><span className="learn-title">Histories &amp; preservation</span><span className="learn-desc">Discover how archaeological objects connect people, place and cultural memory.</span><ArrowIcon /></a>
            <a className="learn-card" href="/references"><span className="learn-index">03</span><span className="learn-title">Sources &amp; further reading</span><span className="learn-desc">Follow the references and image credits used in this project.</span><ArrowIcon /></a>
          </div>
        </section>

        <QRPanel url={`${window.location.origin}/#collection`} />

        <section className="references section-pad" id="references" aria-labelledby="references-title">
          <div><p className="eyebrow">Research with references</p><h2 id="references-title">Grounded in sources.<br /><em>Open to discovery.</em></h2></div>
          <p>Explore the books, museum resources, media articles and project photographs that inform this documentation.</p>
          <a className="button button-outline" href="/references">View references <ArrowIcon /></a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#top"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Documentation</span></a>
        <p>A growing documentation of Onikan’s objects, histories and knowledge.</p>
        <a href="#top" className="back-top">Back to top ↑</a>
        <small>© {new Date().getFullYear()} Onikan Terracotta Documentation</small>
      </footer>
    </>
  );
}

export default function App() {
  if (window.location.hostname.startsWith('admin.')) return <AdminPage />;
  if (/^\/admin\/?$/.test(window.location.pathname)) return <AdminPage />;
  if (/^\/learn\/?$/.test(window.location.pathname)) return <LearnPage />;
  if (/^\/references\/?$/.test(window.location.pathname)) return <ReferencesPage />;
  const match = window.location.pathname.match(/^\/artifacts\/([^/]+)\/?$/);
  if (match) return <ArtifactPage identifier={decodeURIComponent(match[1])} />;
  return <HomePage />;
}
