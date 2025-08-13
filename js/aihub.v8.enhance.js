// aihub.v8.enhance.js — v2.1
// - Place radar NEXT to Verdict in a two-column row (left text, right radar)
// - Add color legend for brands next to mini-links
// - Keep previous features: FAQ-last, JSON-LD on best-of, colored CTAs, glow boost
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const path = location.pathname.replace(/\/+$/,'/');

  function faqLast() {
    const main = $('main'); if (!main) return;
    const faqs = $$('.faq', main);
    if (!faqs.length) return;
    faqs.forEach(f => f.remove());
    faqs.forEach(f => main.appendChild(f));
  }

  function injectListJSONLD() {
    const already = $$("script[type='application/ld+json']").some(s => /ItemList|AggregateRating/.test(s.textContent||""));
    const hint = /(best|top|apps|chatbots|platforms|list)/i;
    if (already || !(hint.test(path) || hint.test(document.title||""))) return;
    const items = [
      { "@type":"ListItem","position":1,"name":"Lovescape","url":"/reviews/lovescape-review/" },
      { "@type":"ListItem","position":2,"name":"Replika","url":"/reviews/replika-ai-review/" },
      { "@type":"ListItem","position":3,"name":"CrushOn.AI","url":"/reviews/crushon-ai-review/" }
    ];
    const itemList = { "@context":"https://schema.org","@type":"ItemList","itemListElement": items };
    const aggregate = { "@context":"https://schema.org","@type":"AggregateRating","ratingValue":"4.6","ratingCount":"120" };
    const s1 = document.createElement('script'); s1.type='application/ld+json'; s1.textContent = JSON.stringify(itemList);
    const s2 = document.createElement('script'); s2.type='application/ld+json'; s2.textContent = JSON.stringify(aggregate);
    document.head.appendChild(s1); document.head.appendChild(s2);
  }

  // ----- Radar helpers
  const categoryLabels = ["Value","Realism","Personalization","Safety","Latency","Voice","NSFW","Privacy"]; // match screenshot order clockwise if needed
  const brandData = {
    lovescape:         [86,90,88,80,82,70,92,78],
    replika:           [80,78,70,85,88,82,55,84],
    "candy-ai":        [78,82,76,74,84,72,90,72],
    "crushon-ai":      [81,84,82,70,86,76,94,70],
    janitorai:         [77,79,85,66,84,68,92,68],
    anima:             [78,75,72,84,88,80,60,82],
    romanticai:        [77,76,74,78,86,72,74,80],
    chatfai:           [76,72,70,82,88,70,60,84],
    "myai-love":       [76,74,72,78,86,74,72,78],
    "ai-dungeon":      [72,80,76,68,84,64,92,66]
  };
  const BLUE = '#6A7DFF', PINK = '#FF375F';

  function slugToName(slug){
    return slug.replace(/-/g,' ')
      .replace(/\bai\b/gi,'AI')
      .replace(/\b\w/g,c=>c.toUpperCase());
  }

  function ensureCompareRow(verdictSection){
    // If verdict is already in a compare-row wrapper, return it
    let row = verdictSection.closest('.compare-row');
    if (row) return row;
    // Create wrapper grid and wrap verdict inside
    row = document.createElement('div');
    row.className = 'compare-row';
    verdictSection.parentNode.insertBefore(row, verdictSection);
    row.appendChild(verdictSection);
    return row;
  }

  function addLegend(verdictSection, n1, n2){
    if (verdictSection.querySelector('.legend-chips')) return;
    const wrap = document.createElement('div');
    wrap.className='legend-chips';
    const make = (label,color) => {
      const s = document.createElement('span');
      s.className='legend-item';
      const dot = document.createElement('span'); dot.className='legend-dot'; dot.style.background=color;
      s.appendChild(dot); s.appendChild(document.createTextNode(label));
      return s;
    };
    wrap.appendChild(make(n1, BLUE));
    wrap.appendChild(make(n2, PINK));
    // place legend under mini links if present, else at end of section
    const anchor = verdictSection.querySelector('.mini-links') || verdictSection;
    anchor.appendChild(wrap);
  }

  function drawRadar(canvas, cats, series){
    const ctx = canvas.getContext('2d');
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    const W = canvas.clientWidth || 520, H = canvas.clientHeight || 520;
    canvas.width = W*DPR; canvas.height = H*DPR;
    const cx = canvas.width/2, cy = canvas.height/2, radius = Math.min(canvas.width,canvas.height)*0.38;
    ctx.scale(DPR, DPR);
    ctx.clearRect(0,0,W,H);
    ctx.translate(W/2,H/2);
    const levels = 4;
    ctx.strokeStyle='rgba(255,255,255,.08)';
    for(let l=1;l<=levels;l++){
      ctx.beginPath();
      const r = radius*(l/levels)/DPR;
      for(let i=0;i<cats.length;i++){
        const ang = (Math.PI*2*i/cats.length)-Math.PI/2;
        const x = Math.cos(ang)*r, y = Math.sin(ang)*r;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.fillStyle='rgba(255,255,255,.64)';
    ctx.font='14px system-ui, -apple-system, Segoe UI, Inter, Arial';
    cats.forEach((cat,i)=>{
      const ang=(Math.PI*2*i/cats.length)-Math.PI/2;
      const x=Math.cos(ang)*(radius/DPR+18), y=Math.sin(ang)*(radius/DPR+18);
      ctx.fillText(cat, x-ctx.measureText(cat).width/2, y+4);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(ang)*(radius/DPR), Math.sin(ang)*(radius/DPR));
      ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.stroke();
    });
    series.forEach(s=>{
      ctx.beginPath();
      s.data.forEach((val,i)=>{
        const v=Math.max(0,Math.min(100,val))/100;
        const ang=(Math.PI*2*i/cats.length)-Math.PI/2;
        const x=Math.cos(ang)*(radius/DPR*v), y=Math.sin(ang)*(radius/DPR*v);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.fillStyle=s.fill; ctx.strokeStyle=s.color; ctx.lineWidth=2;
      ctx.fill(); ctx.stroke();
    });
  }

  function enhanceVerdict(){
    if (!/^\/comparisons\/[^\/]+\/$/.test(path)) return;

    // Find verdict
    const verdictH2 = Array.from(document.querySelectorAll('h2')).find(h=>/^\s*Verdict\s*$/i.test(h.textContent||""));
    const verdictSection = verdictH2 ? (verdictH2.closest('section') || verdictH2.parentElement) : null;
    if (!verdictSection) return;

    // Who vs who
    const pair = path.match(/\/comparisons\/([^\/]+)-vs-([^\/]+)\//i);
    if (!pair) return;
    const s1=pair[1], s2=pair[2];
    const n1=slugToName(s1), n2=slugToName(s2);

    // Mini review links (idempotent)
    if (!verdictSection.querySelector('.mini-links')){
      const wrap=document.createElement('div'); wrap.className='mini-links';
      const mk=(href,img,label)=>{const a=document.createElement('a');a.className='badge-chip mini';a.href=href;const i=document.createElement('img');i.src=img;i.alt='';a.appendChild(i);a.appendChild(document.createTextNode(' '+label));return a;};
      wrap.appendChild(mk(`/reviews/${s1}-review/`,`/assets/${s1}.webp`,`${n1} review`));
      wrap.appendChild(mk(`/reviews/${s2}-review/`,`/assets/${s2}.webp`,`${n2} review`));
      verdictSection.appendChild(wrap);
    }

    // Add legend chips with colors
    addLegend(verdictSection, n1, n2);

    // Prepare two-column row
    const row = ensureCompareRow(verdictSection);

    // Existing radar? move it into row; else create
    let radarCard = $('.radar-card');
    if (!radarCard){
      radarCard = document.createElement('section');
      radarCard.className='card radar-card';
      const cv=document.createElement('canvas');
      cv.className='ai-radar'; cv.style.width='100%'; cv.style.maxWidth='580px'; cv.style.height='520px';
      radarCard.appendChild(cv);
      drawRadar(cv, categoryLabels, [
        {label:n1,color:BLUE, fill:'rgba(106,125,255,.22)', data: (brandData[s1]||brandData.lovescape)},
        {label:n2,color:PINK, fill:'rgba(255,55,95,.22)', data: (brandData[s2]||brandData.replika)}
      ]);
    } else {
      // If we reused an existing one, ensure canvas sizes fit row
      const cv = radarCard.querySelector('canvas.ai-radar');
      if (cv){ cv.style.width='100%'; cv.style.maxWidth='580px'; cv.style.height='520px'; }
    }

    // Ensure radar is placed as second column in the row
    if (radarCard.parentNode !== row){
      row.appendChild(radarCard);
    } else if (row.children[0] !== verdictSection){
      // Ensure order: verdict left, radar right
      row.insertBefore(verdictSection, row.firstChild);
    }
  }

  // --- 4) Color CTAs in Bento / Clusters
  function colorBentoAndClusters(){
    const gradients = [
      'linear-gradient(135deg,#ff3b6b,#8b5cf6)',
      'linear-gradient(135deg,#22d3ee,#6366f1)',
      'linear-gradient(135deg,#f59e0b,#ef4444)',
      'linear-gradient(135deg,#34d399,#06b6d4)',
      'linear-gradient(135deg,#a855f7,#ec4899)'
    ];
    const sections = Array.from(document.querySelectorAll('section')).filter(s=>{
      const h=s.querySelector('h2'); if(!h) return false;
      const t=(h.textContent||'').toLowerCase();
      return /bento categories|explore by cluster/.test(t);
    });
    let g=0;
    sections.forEach(sec=>{
      const btns = Array.from(sec.querySelectorAll('a,button')).filter(a=>/open|view|go/i.test(a.textContent||''));
      btns.forEach(b=>{ b.classList.add('btn-cta'); b.style.backgroundImage = gradients[g%gradients.length]; g++; });
    });
  }

  // --- 5) Slightly stronger cursor glow
  function boostGlow(){
    const glow=$('.cursor-glow'); if (glow) glow.style.opacity='0.46';
    $$('.orb').forEach(o=>o.style.opacity='0.25');
  }

  function run(){ faqLast(); injectListJSONLD(); enhanceVerdict(); colorBentoAndClusters(); boostGlow(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true}); else run();
})();