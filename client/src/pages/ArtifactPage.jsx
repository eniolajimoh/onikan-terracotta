import { useEffect, useState } from 'react';
import QRPanel from '../components/QRPanel.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ArtifactPage({ identifier }) {
  const [artifact, setArtifact] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/artifacts/${encodeURIComponent(identifier)}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) throw new Error('not-found');
        if (!response.ok) throw new Error('unavailable');
        return response.json();
      })
      .then((data) => {
        setArtifact(data);
        setState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState(error.message === 'not-found' ? 'not-found' : 'unavailable');
      });
    return () => controller.abort();
  }, [identifier]);

  if (state !== 'ready') {
    const message = state === 'loading' ? 'Loading object documentation…' : state === 'not-found' ? 'This object is not available in the public archive.' : 'The record could not be loaded right now.';
    return (
      <main className="detail-state">
        <a className="wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Chronicles</span></a>
        <p role="status">{message}</p>
        <a className="text-link" href="/#collection">Return to the archive ↗</a>
      </main>
    );
  }

  const categories = artifact.categories?.map(({ category }) => category.name) || [];
  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Chronicles</span></a>
        <nav className="main-nav" aria-label="Main navigation"><a href="/#collection">Collection</a><a href="/#story">Our story</a><a href="/#learn">Learn</a><a href="/#references">References</a></nav>
        <a className="header-cta" href="/#collection">Back to collection <span aria-hidden="true">↗</span></a>
      </header>
      <main className="artifact-detail">
        <a className="back-link" href="/#collection">← All objects</a>
        <div className="detail-layout">
          <div className="detail-gallery">
            {artifact.images?.length ? artifact.images.map((image) => <figure key={image.id}><img src={image.url} alt={image.altText || artifact.title} /><figcaption>{image.altText || artifact.title}</figcaption></figure>) : <div className="detail-placeholder">Photograph pending</div>}
          </div>
          <article className="detail-copy">
            <p className="eyebrow">{categories.join(' · ') || 'Collection object'}</p>
            <p className="detail-catalogue">Catalogue no. {artifact.catalogueNumber}</p>
            <h1>{artifact.title}</h1>
            <p className="detail-description">{artifact.description}</p>
            <dl className="object-facts">
              {[
                ['Material', artifact.material],
                ['Culture', artifact.culture],
                ['Geographical origin', artifact.geographicalOrigin],
                ['Estimated period', artifact.estimatedPeriod],
                ['Height', artifact.height && `${artifact.height} cm`],
                ['Width', artifact.width && `${artifact.width} cm`],
                ['Length', artifact.length && `${artifact.length} cm`],
                ['Conservation status', artifact.conservationStatus],
              ].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
            {artifact.provenance && <section className="detail-section"><h2>Provenance</h2><p>{artifact.provenance}</p></section>}
            {artifact.interpretiveNotes && <section className="detail-section"><h2>Interpretive notes</h2><p>{artifact.interpretiveNotes}</p></section>}
            {!!artifact.references?.length && <section className="detail-section"><h2>References</h2><ol className="reference-list">{artifact.references.map(({ reference }) => <li key={reference.id}>{reference.authors && <span>{reference.authors}. </span>}<cite>{reference.title}</cite>{reference.publication && <span>. {reference.publication}</span>}{reference.year && <span>, {reference.year}</span>}{reference.url && <span>. <a href={reference.url} target="_blank" rel="noreferrer">Read source ↗</a></span>}</li>)}</ol></section>}
            <QRPanel url={`${window.location.origin}/artifacts/${encodeURIComponent(artifact.id)}`} label={`QR code for ${artifact.catalogueNumber}`} title="Scan this object" />
          </article>
        </div>
      </main>
      <footer className="site-footer"><a className="wordmark footer-wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Chronicles</span></a><p>A living archive for the objects, histories and knowledge of Onikan.</p><a href="#top" className="back-top">Back to top ↑</a><small>© {new Date().getFullYear()} Onikan Terracotta Chronicles</small></footer>
    </>
  );
}
