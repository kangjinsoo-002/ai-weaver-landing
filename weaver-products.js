(() => {
  'use strict';
  const A=window.anime,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced;
  const controls=[...document.querySelectorAll('[data-motion-control]')],menu=document.querySelector('.product-menu');
  document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
  const visuals=[...document.querySelectorAll('[data-motion-visual],[data-flow-visual]')].map(el=>({el,visible:false,step:0,timer:null,job:null}));
  function paint(model){
    const {el,step}=model;el.dataset.phase=String(step);
    el.querySelectorAll('[data-step],[data-flow-step]').forEach(item=>item.classList.toggle('is-current',Number(item.dataset.step??item.dataset.flowStep)===step%3));
    const expanded=step%3===1,count=expanded?8:4;
    el.querySelectorAll('[data-gpu]').forEach(g=>g.classList.toggle('is-assigned',+g.dataset.gpu<count));
    el.querySelectorAll('[data-allocation-count]').forEach(x=>x.textContent=count);
    el.querySelectorAll('.demo-state').forEach(x=>x.textContent=['기본 구성','추가 할당','자원 회수'][step%3]);
    el.querySelectorAll('.lifecycle-grid>[data-step]').forEach(x=>x.classList.toggle('is-current',+x.dataset.step===step%4));
  }
  visuals.forEach(model=>{
    paint(model);
    if(A&&!reduced){
      model.timer=A.createTimer({autoplay:false,duration:2400,loop:true,onLoop:()=>{model.step++;paint(model);}});
      const glyph=model.el.querySelector('.hero-symbol');
      if(glyph)model.job=A.animate(glyph,{y:[-3,3,-3],rotate:['-1deg','1deg','-1deg'],duration:7500,loop:true,ease:'inOut(2)',autoplay:false});
    }
  });
  function sync(){
    const enabled=!paused&&!reduced&&!document.hidden;
    for(const m of visuals){if(enabled&&m.visible){m.timer?.resume();m.job?.resume();}else{m.timer?.pause();m.job?.pause();}}
    controls.forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.disabled=reduced;b.innerHTML=(reduced?'움직임 최소화':paused?'모션 재생':'모션 정지')+' <span aria-hidden="true">'+(paused?'▷':'Ⅱ')+'</span>';});
  }
  const activity=new IntersectionObserver(entries=>{for(const entry of entries){const m=visuals.find(m=>m.el===entry.target);if(m)m.visible=entry.isIntersecting;}sync();},{threshold:.15});
  visuals.forEach(m=>activity.observe(m.el));controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;sync();}));document.addEventListener('visibilitychange',sync);
  if(A&&!reduced){
    const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){reveal.unobserve(e.target);A.animate(e.target,{opacity:[.55,1],y:[12,0],duration:650,ease:'out(3)'});}},{threshold:.12});
    document.querySelectorAll('.feature-copy,.section-heading,.role-list>div,.related-products>a').forEach(el=>reveal.observe(el));
  }
  const subnav=document.querySelector('.product-subnav'),links=[...subnav.querySelectorAll('div a')],sections=links.map(a=>document.querySelector(a.getAttribute('href')));
  let waiting=false;
  function reading(){waiting=false;let index=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.36)index=i;});links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});const max=document.documentElement.scrollHeight-innerHeight;subnav.style.setProperty('--reading',(max>0?scrollY/max*100:0)+'%');}
  addEventListener('scroll',()=>{if(!waiting){waiting=true;requestAnimationFrame(reading);}},{passive:true});addEventListener('resize',reading);
  sync();reading();
})();
