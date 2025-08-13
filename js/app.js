
// sticky header, cursor glow
const hdr=document.getElementById('hdr'); window.addEventListener('scroll',()=>hdr.classList.toggle('fixed',scrollY>8));
window.addEventListener('pointermove',(e)=>{document.documentElement.style.setProperty('--mx',e.clientX+'px');document.documentElement.style.setProperty('--my',e.clientY+'px')},{passive:true});

// simple stars helper
function stars(n=5){return '★★★★★'.slice(0,5)}

// Radar chart for head-to-head
function renderRadar(svgId, axes, A, B){
  const svg=document.getElementById(svgId); if(!svg) return;
  const cx=340, cy=240, r=180;
  function NS(x){return document.createElementNS('http://www.w3.org/2000/svg',x)}
  function pt(i,t){const ang=(Math.PI*2*i/axes.length)-Math.PI/2; return [cx+Math.cos(ang)*r*t, cy+Math.sin(ang)*r*t]}
  svg.innerHTML='';
  for(let k=1;k<=4;k++){const rr=r*k/4; const c=NS('circle'); c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',rr); c.setAttribute('fill','none'); c.setAttribute('stroke','#1b1d20'); svg.appendChild(c);}
  axes.forEach((lab,i)=>{const [x,y]=pt(i,1); const line=NS('line'); line.setAttribute('x1',cx); line.setAttribute('y1',cy); line.setAttribute('x2',x); line.setAttribute('y2',y); line.setAttribute('stroke','#1b1d20'); svg.appendChild(line); const tx=NS('text'); tx.setAttribute('x',x); tx.setAttribute('y',y); tx.setAttribute('fill','#a6b1c7'); tx.setAttribute('font-size','12'); tx.setAttribute('text-anchor','middle'); tx.textContent=lab; svg.appendChild(tx); });
  function poly(vals,color){const pts=vals.map((v,i)=>pt(i,v)).map(([x,y])=>`${x},${y}`).join(' '); const p=NS('polygon'); p.setAttribute('points',pts); p.setAttribute('fill',color); p.setAttribute('stroke',color.replace('0.25','1')); p.setAttribute('stroke-width','1'); svg.appendChild(p);}
  poly(A,'rgba(255,53,85,0.25)'); poly(B,'rgba(138,43,226,0.25)');
}


// scroll-based parallax for hero art
(function(){
  const els = Array.from(document.querySelectorAll('.hero-art,[data-parallax]'));
  if(!els.length) return;
  const sp = (el)=> Number(el.dataset.parallax||0.2);
  const raf = window.requestAnimationFrame || ((cb)=>setTimeout(cb,16));
  function onscroll(){
    const wh = window.innerHeight;
    els.forEach(el=>{
      const r = el.getBoundingClientRect();
      const t = (r.top - wh*0.5) / wh; // -1..1
      const y = t * (50*sp(el)); // px
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  }
  window.addEventListener('scroll',()=>raf(onscroll), {passive:true});
  window.addEventListener('resize',()=>raf(onscroll));
  raf(onscroll);
})();

// mobile burger
(function(){
  const btn = document.querySelector('.nav-toggle');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const open = document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true':'false');
  });
  // close on link click
  document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click', ()=>{
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded','false');
  }));
})();

// v8: close burger on Escape or outside tap
(function(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if(!btn || !nav) return;
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){ document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('click',(e)=>{
    if(!document.body.classList.contains('nav-open')) return;
    if(!nav.contains(e.target) && e.target!==btn){ document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded','false'); }
  }, true);
})();