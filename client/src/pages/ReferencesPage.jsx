import { useEffect } from 'react';

const categories = [
  {
    title: 'Catalogue entries and object image credits',
    entries: [
      { text: 'Cat. 40, Head of a queen, from Ita Yemoo, 12th–15th century CE, terracotta, H. 22.8 cm, National Museum, Lagos, Inv. 79.R.7. © 1974 André Held.' },
      { text: 'Cat. 39, Head of woman, 12th–14th century CE, terracotta, H. 25 cm, Musée Barbier-Mueller, Geneva, Inv. 1015-176. © AMB, Archives Barbier-Mueller, Studio Ferrazzini-Bouchet.' },
    ],
  },
  {
    title: 'Books',
    entries: [
      { text: 'Blier, Suzanne Preston (2015). Art and Risk in Ancient Yoruba: Ife History, Power, and Identity, c. 1300. Cambridge: Cambridge University Press. ISBN 9781107021662.', url: 'https://www.cambridge.org/core/books/art-and-risk-in-ancient-yoruba/1D8136F1682FC0244F690903B437653D', link: 'View publisher record ↗', note: 'Plate 1 shows a terracotta Head of a Queen from Ita Yemoo in the National Museum, Lagos.' },
    ],
  },
  {
    title: 'Online sources and museum resources',
    entries: [
      { text: 'Barbier-Mueller Museum (2019). Nigerian Arts Revisited. Accessed 15 November 2026.', url: 'https://www.barbier-mueller.ch/en/2019/08/02/nigerian-arts-revisited/', link: 'Read source ↗' },
      { text: 'Virginia Museum of Fine Arts (n.d.). Dynasty and Divinity: Ife Arts in Ancient Nigeria, Gallery Guide. Accessed 15 November 2026.', url: 'https://vmfa.museum/wp-content/uploads/sites/24/2015/01/VMFA_Dynasty-and-Divinity_Gallery_Guide.pdf', link: 'Open gallery guide ↗' },
      { text: 'Wikipedia (n.d.). Nigerian National Museum. Accessed 15 November 2026.', url: 'https://en.wikipedia.org/wiki/Nigerian_National_Museum', link: 'Open page ↗' },
      { text: 'National Commission for Museums and Monuments (n.d.). NCMM Online Collection. Accessed 15 November 2026.', url: 'https://collection.museum.ng', link: 'Browse collection ↗' },
    ],
  },
  {
    title: 'Newspaper and media articles',
    entries: [
      { text: 'Bailey, Martin (2002). “How The Queen came to own a Lagos museum piece.” The Art Newspaper, 31 March. Accessed 15 November 2026.', url: 'https://www.theartnewspaper.com/2002/04/01/how-the-queen-came-to-own-a-lagos-museum-piece', link: 'Read article ↗' },
      { text: 'The Guardian Nigeria (2019). “With 300 items on display, 47,000 in store, National Museum Lagos begs for attention.” 28 May. Accessed 15 November 2026.', url: 'https://guardian.ng/news/with-300-items-on-display-47000-in-store-national-museum-lagos-begs-for-attention/', link: 'Read article ↗' },
    ],
  },
  {
    title: 'Personal photographs',
    entries: [
      { text: 'Jimoh, Fatiah (2026). Photograph of terracotta sculpture 66/7321, National Museum, Onikan, Lagos, 21 July. Personal collection.' },
    ],
  },
];

export default function ReferencesPage() {
  useEffect(() => {
    document.title = 'References · Onikan Terracotta Documentation';
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Onikan Documentation home"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Documentation</span></a>
        <nav className="main-nav" aria-label="Main navigation"><a href="/#collection">Collection</a><a href="/learn">Learn</a><a href="/references" aria-current="page">References</a></nav>
        <a className="header-cta" href="/#collection">Explore the collection <span aria-hidden="true">↗</span></a>
      </header>
      <main className="editorial-page references-page" id="top">
        <div className="editorial-intro"><p className="eyebrow">Research sources</p><h1>References and <em>image credits.</em></h1><p>Sources and image credits used in the Onikan Terracotta Documentation project.</p></div>
        <div className="references-content">
          {categories.map((category) => <section className="reference-category" key={category.title}><h2>{category.title}</h2><ol>{category.entries.map((entry) => <li key={entry.text}><p>{entry.text}</p>{entry.note && <p className="reference-note">{entry.note}</p>}{entry.url && <a href={entry.url} target="_blank" rel="noreferrer">{entry.link}</a>}</li>)}</ol></section>)}
        </div>
      </main>
      <footer className="site-footer"><a className="wordmark footer-wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Documentation</span></a><p>A growing record of Onikan’s objects and histories.</p><a href="#top" className="back-top">Back to top ↑</a><small>© {new Date().getFullYear()} Onikan Terracotta Documentation</small></footer>
    </>
  );
}
