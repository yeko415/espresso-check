const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

// Reveal layer
const revealObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('[data-reveal]').forEach(el=>revealObs.observe(el));

// Hero parallax: each floating image responds at a different speed.
const heroPhotos=[...document.querySelectorAll('.hero-photo')];
let sy=scrollY, smoothY=scrollY;
function raf(){
  sy=scrollY; smoothY=lerp(smoothY,sy,reduceMotion?1:.08);
  if(!reduceMotion) heroPhotos.forEach((el,i)=>{const speed=Number(el.dataset.speed||0); const r=el.parentElement.getBoundingClientRect(); const local=-r.top; el.style.transform=`translate3d(0,${local*speed}px,0)`});
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Product rail / filters
const rail=document.getElementById('productRail');
const cards=[...document.querySelectorAll('.product-card')];
const tabs=[...document.querySelectorAll('.prod-tab')];
const dotsWrap=document.getElementById('productDots');
let filter='beef'; let index=0;
function visible(){return cards.filter(c=>c.dataset.type===filter)}
function renderDots(){dotsWrap.innerHTML='';visible().forEach((_,i)=>{const d=document.createElement('i');d.className='dot'+(i===index?' active':'');dotsWrap.appendChild(d)})}
function layoutRail(animate=true){
  const v=visible(); index=clamp(index,0,Math.max(0,v.length-1));
  cards.forEach(c=>c.style.display=c.dataset.type===filter?'':'none');
  if(!v.length)return;
  const cardW=v[0].getBoundingClientRect().width+26;
  const viewport=rail.parentElement.clientWidth;
  const target=(viewport-cardW)/2 - index*cardW;
  rail.style.transition=animate?'transform .72s cubic-bezier(.2,.8,.15,1)':'none';
  rail.style.transform=`translate3d(${target}px,0,0)`;
  renderDots();
}
tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');filter=t.dataset.filter;index=0;layoutRail()}));
document.getElementById('nextProduct').addEventListener('click',()=>{index++;layoutRail()});
document.getElementById('prevProduct').addEventListener('click',()=>{index--;layoutRail()});
window.addEventListener('resize',()=>layoutRail(false));
layoutRail(false);

// Wheel/touch on product scene: vertical wheel advances the horizontal product scene.
const productScene=document.querySelector('.products-scene');
let wheelLock=false;
productScene.addEventListener('wheel',e=>{
  if(Math.abs(e.deltaY)<8)return;
  const nearTop=productScene.getBoundingClientRect().top;
  const nearBottom=productScene.getBoundingClientRect().bottom;
  const goingDown=e.deltaY>0;
  if((goingDown && nearTop < 120 && nearBottom > innerHeight-120) || (!goingDown && nearTop < 120 && nearBottom > innerHeight-120)){
    e.preventDefault();
    if(wheelLock)return;
    wheelLock=true;
    index += goingDown?1:-1;
    const v=visible();
    if(index>v.length-1){index=v.length-1;window.scrollBy({top:70,behavior:'smooth'})}
    if(index<0){index=0;window.scrollBy({top:-70,behavior:'smooth'})}
    layoutRail();
    setTimeout(()=>wheelLock=false,500);
  }
},{passive:false});

// Drag / swipe the product rail
let down=false,startX=0,startIndex=0;
rail.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;startIndex=index;rail.setPointerCapture?.(e.pointerId)});
rail.addEventListener('pointerup',e=>{if(!down)return;down=false;const dx=e.clientX-startX;if(Math.abs(dx)>45){index=startIndex+(dx<0?1:-1);layoutRail()} });
rail.addEventListener('pointercancel',()=>down=false);

// FAQ accordion
const faqButtons=[...document.querySelectorAll('.faq-list button')];
faqButtons.forEach(btn=>btn.addEventListener('click',()=>{const ans=btn.nextElementSibling;const isOpen=ans.classList.contains('open');document.querySelectorAll('.faq-list>div.open').forEach(a=>a.classList.remove('open'));faqButtons.forEach(b=>b.querySelector('b').textContent='+');if(!isOpen){ans.classList.add('open');btn.querySelector('b').textContent='−'}}));
