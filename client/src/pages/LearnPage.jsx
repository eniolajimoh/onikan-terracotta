import { useEffect } from 'react';

export default function LearnPage() {
  useEffect(() => {
    document.title = 'Learn · Onikan Terracotta Documentation';
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Onikan Documentation home"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Documentation</span></a>
        <nav className="main-nav" aria-label="Main navigation"><a href="/#collection">Collection</a><a href="/learn" aria-current="page">Learn</a><a href="/references">References</a></nav>
        <a className="header-cta" href="/#collection">Explore the collection <span aria-hidden="true">↗</span></a>
      </header>
      <main className="editorial-page learn-page" id="top">
        <div className="editorial-intro">
          <p className="eyebrow">Learn</p>
          <h1>Exploring Nigeria’s <em>archaeological heritage.</em></h1>
          <p>Nigeria has a rich archaeological and cultural heritage that reflects the creativity, technological achievements, beliefs and ways of life of its early societies. Through archaeological discoveries, researchers have been able to understand how people lived, worked, traded, created objects and organised their communities in different historical periods.</p>
          <p>Archaeology is the study of past human societies through the examination of material remains such as pottery, sculptures, tools, buildings, metal objects and other cultural materials. These discoveries help us reconstruct aspects of human history that may not have been fully documented in written records.</p>
          <p>Among Nigeria’s most recognised archaeological and artistic traditions are the Nok culture, the ancient city of Ile-Ife and the Kingdom of Benin. Each represents an important chapter in Nigerian history and demonstrates the artistic and technological abilities of African societies.</p>
        </div>

        <article className="editorial-content">
          <section id="nok"><p className="eyebrow">01 · Central Nigeria</p><h2>The Nok culture</h2>
            <p>The Nok culture is one of the earliest well-known archaeological cultures in Nigeria. It developed in central Nigeria, particularly around the Jos Plateau and surrounding areas. Archaeological evidence suggests that the Nok tradition existed from approximately 1500 BCE to the beginning of the Common Era.</p>
            <p>The Nok culture is particularly famous for its terracotta sculptures, which include human heads, complete human figures and animal representations. These sculptures are recognised for distinctive facial features, including triangular or oval-shaped eyes, detailed hairstyles and carefully modelled expressions.</p>
            <p>Apart from their artistic achievements, the Nok people are associated with early iron production in West Africa. Archaeological excavations have revealed evidence of iron smelting, pottery production, farming and the use of stone tools.</p>
            <p>Nok terracotta sculptures provide evidence of artistic skill, material knowledge and possible ritual practices. The exact meanings and functions of many sculptures remain subjects of archaeological research. The Nok culture demonstrates the early development of artistic expression and technological knowledge in Nigeria.</p>
          </section>

          <section id="ife"><p className="eyebrow">02 · Southwestern Nigeria</p><h2>The ancient city of Ile-Ife</h2>
            <p>Ile-Ife, located in present-day Osun State, southwestern Nigeria, is an important historical and cultural centre of the Yoruba people. It is widely recognised for achievements in terracotta, brass, copper-alloy and stone sculpture.</p>
            <p>Ife art flourished particularly between approximately the 11th and 15th centuries CE. Its sculptures are known for naturalistic representations of human faces and bodies. Many heads display carefully modelled features, elaborate hairstyles, crowns and facial markings that may represent traditional scarification.</p>
            <p>The artistic achievements of Ife demonstrate a high level of craftsmanship and knowledge of different materials and production techniques. Terracotta modelling and sophisticated metal-casting techniques were both used to produce objects.</p>
            <p>Ife artworks provide insight into Yoruba artistic traditions, social organisation, religious practices and ideas about royalty and authority. Ile-Ife remains an important centre of Yoruba cultural identity and continues to contribute to the understanding of African art and civilisation.</p>
          </section>

          <section id="benin"><p className="eyebrow">03 · Southern Nigeria</p><h2>The Kingdom of Benin</h2>
            <p>The Kingdom of Benin was a powerful historical kingdom in present-day Edo State, southern Nigeria. It developed a highly organised political system under the authority of the Oba, the traditional ruler of the kingdom.</p>
            <p>Benin became renowned for its artistic achievements, especially bronze and brass casting, ivory carving and wood sculpture. Royal artists produced commemorative heads, plaques, figures, ceremonial objects and other works associated with the royal palace.</p>
            <p>Benin artists used the lost-wax casting technique. This process involved creating a wax model, covering it with a mould, melting out the wax and pouring molten metal into the space left behind.</p>
            <p>Benin plaques often depict the Oba, palace officials, warriors, Portuguese visitors, court ceremonies and other aspects of kingdom life. They preserve visual information about political structure, royal traditions and international relationships.</p>
            <p>In 1897, British forces invaded Benin City, destroyed and looted the royal palace, and removed thousands of cultural objects. Many were dispersed to museums and private collections around the world. Their ownership and repatriation remain important issues in discussions about cultural heritage and restitution.</p>
            <p>The artistic and historical achievements of the Benin Kingdom demonstrate the sophistication of precolonial Nigerian societies.</p>
          </section>

          <section id="materials"><p className="eyebrow">Material culture</p><h2>Understanding archaeological artefacts</h2>
            <p>Archaeological artefacts are objects made, modified or used by people in the past. They provide evidence for understanding ancient societies and their cultural practices. Different materials reveal different aspects of human activity:</p>
            <ul className="material-list"><li><strong>Terracotta</strong><span>Fired clay used to produce sculptures, figurines and other objects.</span></li><li><strong>Pottery</strong><span>Evidence of food preparation, storage, trade and everyday activities.</span></li><li><strong>Metal objects</strong><span>Evidence of technological knowledge, craftsmanship and the production of tools and ceremonial objects.</span></li><li><strong>Stone objects</strong><span>Evidence of tool production and technological development.</span></li><li><strong>Ivory and wood</strong><span>Materials used in artistic production, decoration and cultural practices.</span></li></ul>
            <p>Studying these materials helps archaeologists understand relationships between people, their environment, technology and cultural traditions.</p>
          </section>

          <section id="preservation"><p className="eyebrow">Care and access</p><h2>The importance of preserving cultural heritage</h2>
            <p>Cultural heritage represents the history, identity and achievements of communities. Archaeological objects are important sources of historical knowledge and cultural memory.</p>
            <p>Preserving archaeological collections ensures that future generations can study and appreciate earlier societies. Proper documentation, photography, cataloguing, conservation and digital archiving help care for museum collections.</p>
            <p>Digital documentation also makes cultural materials more accessible to students, researchers and the public. Through online catalogues and educational platforms, people can explore historical objects without necessarily having physical access to museum collections.</p>
            <p>The preservation of Nigerian archaeological heritage is a shared responsibility of museums, researchers, educational institutions and communities.</p>
          </section>

          <section className="learn-conclusion"><p className="eyebrow">Conclusion</p><p>The archaeological traditions of Nok, Ile-Ife and the Kingdom of Benin demonstrate the depth and diversity of Nigeria’s cultural heritage. Their achievements in terracotta sculpture, metalworking, pottery and artistic production provide important evidence about early Nigerian societies.</p><p>Through archaeological research, museum collections and digital documentation, these cultural materials can continue to educate, inspire and connect future generations with their history. Understanding the past is essential to appreciating the present and protecting cultural heritage for the future.</p></section>
        </article>
      </main>
      <footer className="site-footer"><a className="wordmark footer-wordmark" href="/"><span className="wordmark-symbol" aria-hidden="true">O</span><span>Onikan<br />Documentation</span></a><p>A growing record of Onikan’s objects and histories.</p><a href="#top" className="back-top">Back to top ↑</a><small>© {new Date().getFullYear()} Onikan Terracotta Documentation</small></footer>
    </>
  );
}
