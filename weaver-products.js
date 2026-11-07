(() => {
  'use strict';
  const A=window.anime,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced;
  const reviewQuery=new URLSearchParams(location.search).get('demo-phase');
  const reviewPhase=/^[0-3]$/.test(reviewQuery||'')?Number(reviewQuery):null;
  const controls=[...document.querySelectorAll('[data-motion-control]')],menu=document.querySelector('.product-menu');
  document.addEventListener('click',e=>{if(!menu.contains(e.target))menu.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
  const visuals=[...document.querySelectorAll('[data-motion-visual],[data-flow-visual]')].map(el=>({el,visible:false,step:reviewPhase??0,timer:null,job:null,allocationJob:null,captionJob:null,count:4,phases:Math.max(3,...[...el.querySelectorAll('[data-step]')].map(x=>Number(x.dataset.step)+1))}));
  const text=el=>el?.textContent.trim()||'';
  function description(model){
    const {el}=model,phase=model.step%model.phases;
    if(el.querySelector('[data-gpu]'))return [
      ['기본 자원 구성','학습 작업에 GPU 4개를 배치한 예시입니다.'],
      ['작업 증가에 맞춰 확장','같은 자원 풀에서 GPU를 추가 할당합니다.'],
      ['남는 자원은 다시 풀로','사용 후 남는 GPU를 회수하는 흐름입니다.']
    ][phase%3];
    if(el.querySelector('[data-agent-title]'))return [
      ['운영 요청','검토할 대상과 작업 의도를 정리합니다.'],
      ['사람의 검토','실행 전에 내용과 범위를 확인합니다.'],
      ['승인 후 실행','승인된 범위에서 결과와 기록을 확인합니다.']
    ][phase%3];
    const current=el.querySelector('[data-step].is-current');
    if(!current)return ['운영 예시','강조된 항목을 기준으로 살펴봅니다.'];
    if(current.dataset.focusLabel)return [current.dataset.focusLabel,current.dataset.focusCopy];
    if(current.matches('.meter-chart>div'))return [text(current.querySelector('span')),text(current.querySelector('b'))+' · 팀별 사용량 예시'];
    if(current.matches('.workload-row'))return [text(current.querySelector('span')).replace(text(current.querySelector('small')),'').trim(),text(current.querySelector('small'))+' · '+text(current.querySelector('b'))+' · '+text(current.querySelector('.ui-pill'))];
    if(current.matches('.ui-rows>div'))return [text(current.querySelector('span')),text(current.querySelector('b'))];
    if(current.matches('.ledger-row'))return [text(current.querySelector('b')),[...current.querySelectorAll('span')].map(text).join(' · ')];
    if(current.matches('.context-orbit>span'))return [text(current),{'인프라 구조':'랙과 노드의 연결 관계를 기준으로 봅니다.','워크로드':'자원과 연결된 작업의 맥락을 살펴봅니다.','상태 · 이벤트':'같은 대상의 상태와 변화를 함께 봅니다.'}[text(current)]];
    if(current.matches('.topology-node'))return [text(current).replace(text(current.querySelector('small')),'').trim(),text(current.querySelector('small'))+' · 연결 관계 확인'];
    return [text(current.querySelector('h4,h3,b'))||text(current),text(current.querySelector('p,small'))||'강조된 항목을 기준으로 살펴봅니다.'];
  }
  function paintAllocation(model,count){
    model.count=count;const displayed=Math.round(count);
    model.el.querySelectorAll('[data-gpu]').forEach(g=>g.classList.toggle('is-assigned',Number(g.dataset.gpu)<displayed));
    model.el.querySelectorAll('[data-allocation-count]').forEach(x=>x.textContent=displayed);
  }
  function paint(model){
    const {el,step}=model;el.dataset.phase=String(step);
    el.querySelectorAll('[data-step],[data-flow-step]').forEach(item=>item.classList.toggle('is-current',Number(item.dataset.step??item.dataset.flowStep)===step%model.phases));
    const expanded=step%3===1,count=expanded?8:4;
    if(el.querySelector('[data-gpu]')){
      model.allocationJob?.cancel();
      if(A&&!reduced&&reviewPhase===null&&model.visible){
        const counter={value:model.count};
        model.allocationJob=A.animate(counter,{value:count,duration:650,ease:'inOut(3)',onUpdate:()=>paintAllocation(model,counter.value)});
      }else paintAllocation(model,count);
    }
    el.querySelectorAll('.demo-state').forEach(x=>x.textContent=['기본 구성','추가 할당','자원 회수'][step%3]);
    el.querySelectorAll('[data-agent-status]').forEach(x=>x.textContent=['운영 요청','사람의 검토','승인 후 실행'][step%3]);
    el.querySelectorAll('[data-agent-title]').forEach(x=>x.textContent=['검토할 작업 제안','내용과 범위 검토','승인된 범위에서 실행'][step%3]);
    const title=el.querySelector('[data-caption-title]'),copy=el.querySelector('[data-caption-copy]'),counter=el.querySelector('[data-caption-step]');
    if(title&&copy){
      const words=description(model);title.textContent=words[0];copy.textContent=words[1];
      counter.textContent=String(step%model.phases+1).padStart(2,'0')+' / '+String(model.phases).padStart(2,'0');
      if(A&&!reduced&&reviewPhase===null&&model.visible){model.captionJob?.cancel();model.captionJob=A.animate([title,copy],{opacity:[.5,1],y:[3,0],duration:260,ease:'out(2)'});}
    }
  }
  visuals.forEach(model=>{
    paint(model);
    if(A&&!reduced&&reviewPhase===null){
      model.timer=A.createTimer({autoplay:false,duration:3000,loop:true,onLoop:()=>{model.step++;paint(model);}});
      const glyph=model.el.querySelector('.hero-symbol');
      if(glyph)model.job=A.animate(glyph,{y:[-3,3,-3],rotate:['-1deg','1deg','-1deg'],duration:7500,loop:true,ease:'inOut(2)',autoplay:false});
    }
  });
  function sync(){
    const enabled=!paused&&!reduced&&!document.hidden&&reviewPhase===null;
    for(const m of visuals){
      if(enabled&&m.visible){m.timer?.resume();m.job?.resume();if(m.allocationJob&&!m.allocationJob.completed)m.allocationJob.resume();}
      else{m.timer?.pause();m.job?.pause();m.allocationJob?.pause();m.captionJob?.cancel();m.el.querySelectorAll('[data-caption-title],[data-caption-copy]').forEach(x=>{x.style.removeProperty('opacity');x.style.removeProperty('transform');});}
      m.el.querySelectorAll('[data-caption-mode]').forEach(x=>x.textContent=reduced||reviewPhase!==null?'동작 예시':paused?'일시 정지':'자동 시연');
    }
    controls.forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.disabled=reduced;b.innerHTML=(reduced?'움직임 최소화':paused?'모션 재생':'모션 정지')+' <span aria-hidden="true">'+(paused?'▷':'Ⅱ')+'</span>';});
  }
  const activity=new IntersectionObserver(entries=>{for(const entry of entries){const m=visuals.find(m=>m.el===entry.target);if(m)m.visible=entry.isIntersecting;}sync();},{threshold:.15});
  visuals.forEach(m=>activity.observe(m.el));controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;sync();}));document.addEventListener('visibilitychange',sync);
  if(A&&!reduced){
    const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){reveal.unobserve(e.target);A.animate(e.target,{opacity:[.55,1],y:[12,0],duration:650,ease:'out(3)'});}},{threshold:.12});
    document.querySelectorAll('.feature-copy,.section-heading,.role-list>div,.related-products>a').forEach(el=>reveal.observe(el));
  }
  const screenDialog=document.querySelector('.screen-dialog');
  if(screenDialog){
    let opener=null;
    document.querySelectorAll('[data-screen-src]').forEach(button=>button.addEventListener('click',()=>{
      opener=button;const img=screenDialog.querySelector('img');img.src=button.dataset.screenSrc;img.alt=button.dataset.screenTitle+' 전체 화면';
      screenDialog.querySelector('h2').textContent=button.dataset.screenTitle;screenDialog.showModal();document.documentElement.style.overflow='hidden';
      const positionImage=()=>{screenDialog.querySelector('.screen-dialog-body').scrollLeft=innerWidth<=700?190:0;};
      if(img.complete)positionImage();else img.addEventListener('load',positionImage,{once:true});
    }));
    screenDialog.querySelector('[data-screen-close]').addEventListener('click',()=>screenDialog.close());
    screenDialog.addEventListener('click',e=>{if(e.target===screenDialog){const r=screenDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)screenDialog.close();}});
    screenDialog.addEventListener('close',()=>{document.documentElement.style.removeProperty('overflow');opener?.focus({preventScroll:true});});
  }
  sync();
})();
