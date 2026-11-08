(() => {
  'use strict';
  const A=window.anime,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduced;
  const reviewQuery=new URLSearchParams(location.search).get('demo-phase');
  const reviewPhase=/^[0-3]$/.test(reviewQuery||'')?Number(reviewQuery):null;
  const controls=[...document.querySelectorAll('[data-motion-control]')];
  const visuals=[...document.querySelectorAll('[data-motion-visual],[data-flow-visual]')].map(el=>({el,visible:false,step:reviewPhase??0,timer:null,job:null,allocationJob:null,captionJob:null,count:4,phases:Math.max(3,...[...el.querySelectorAll('[data-step]')].map(x=>Number(x.dataset.step)+1))}));
  const refinedPage=['security','orbis','agentic'].includes(document.body.dataset.product);
  const readingViewport=matchMedia('(max-width:700px)'),revealJobs=new Map();
  visuals.forEach(m=>{
    m.followReading=refinedPage&&m.el.matches('[data-concept-exhibit],[data-flow-visual]');
    m.readingTargets=m.followReading?[...m.el.querySelectorAll('[data-step],[data-flow-step]')]:[];
  });
  function readingInfo(model){
    const top=78,bottom=innerHeight-32,line=top+(bottom-top)*.44;
    let best=null,distance=Infinity;const eligible=[];
    for(const node of model.readingTargets){
      const r=node.getBoundingClientRect(),shown=Math.min(r.bottom,bottom)-Math.max(r.top,top);
      if(r.height<=0||shown<Math.min(28,r.height*.3))continue;
      const step=Number(node.dataset.step??node.dataset.flowStep);eligible.push(step);
      const nextDistance=Math.abs((Math.max(r.top,top)+Math.min(r.bottom,bottom))/2-line);
      if(nextDistance<distance){distance=nextDistance;best=step;}
    }
    return {selected:best,eligible};
  }
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
  function paint(model,animateCaption=true){
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
      if(A&&!paused&&!reduced&&reviewPhase===null&&model.visible&&animateCaption){model.captionJob?.cancel();model.captionJob=A.animate([title,copy],{opacity:[refinedPage ? .8 : .5,1],y:[refinedPage?2:3,0],duration:refinedPage?240:260,ease:'out(2)'});}
    }
  }
  visuals.forEach(model=>{
    paint(model);
    if(A&&!reduced&&reviewPhase===null){
      model.timer=A.createTimer({autoplay:false,duration:Number(model.el.dataset.motionDuration)||3000,loop:true,onLoop:()=>{
        if(model.followReading){
          if(readingViewport.matches)return;
          const {eligible}=readingInfo(model),current=model.step%model.phases;if(!eligible.length)return;
          let next=current;for(let offset=1;offset<=model.phases;offset++){const candidate=(current+offset)%model.phases;if(eligible.includes(candidate)){next=candidate;break;}}
          if(next===current)return;model.step=next;
        }else model.step++;
        paint(model);
      }});
      const glyph=model.el.querySelector('.hero-symbol');
      if(glyph)model.job=A.animate(glyph,{y:[-3,3,-3],rotate:['-1deg','1deg','-1deg'],duration:7500,loop:true,ease:'inOut(2)',autoplay:false});
    }
  });
  const meterRoot=document.querySelector('[data-stratos-meter]');
  const meterState=meterRoot?{phase:(reviewPhase??0)%3,visible:false,started:false,progress:null,counter:null,caption:null}:null;
  const meterStories=[
    ['할당과 실사용 확인','할당한 GPU 시간에서 실사용 환산과 미사용분을 나눠 봅니다.'],
    ['미사용 구간을 구분','1,000 GPU·h 중 350 GPU·h가 미사용분으로 환산됩니다.'],
    ['사용량을 비용으로','H100 예시 단가를 적용해 실사용과 미사용의 비용을 구분합니다.']
  ];
  function meterNumbers(allocated){
    const a=Math.round(allocated),used=Math.round(a*.65),idle=a-used;
    const values={allocated:a,allocatedFormula:a,used,idle,totalCost:a*3900,usedCost:used*3900,idleCost:idle*3900};
    meterRoot.querySelectorAll('[data-meter-value]').forEach(node=>node.textContent=values[node.dataset.meterValue].toLocaleString('ko-KR'));
    meterRoot.querySelector('[data-meter-focus-number]').textContent=values[['allocated','idle','totalCost'][meterState.phase%3]].toLocaleString('ko-KR');
  }
  function meterPaint(){
    if(!meterState)return;
    const phase=meterState.phase%3;meterRoot.dataset.phase=String(phase);
    meterRoot.querySelectorAll('[data-meter-step]').forEach(node=>{if(Number(node.dataset.meterStep)===phase)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
    const heading=meterRoot.querySelector('[data-meter-title]'),copy=meterRoot.querySelector('[data-meter-copy]');
    heading.textContent=meterStories[phase][0];copy.textContent=meterStories[phase][1];
    meterRoot.querySelector('[data-meter-focus-label]').textContent=['할당한 GPU 시간','미사용으로 환산된 시간','할당 기준 비용'][phase];
    meterRoot.querySelector('[data-meter-focus-unit]').textContent=phase===2?'원':'GPU·h';meterNumbers(1000);
    if(A&&!reduced&&reviewPhase===null&&meterState.visible){meterState.caption?.cancel();meterState.caption=A.animate([heading,copy],{opacity:[.55,1],duration:350,ease:'out(2)'});}
  }
  function meterSync(){
    if(!meterState)return;
    const enabled=!paused&&!reduced&&!document.hidden&&reviewPhase===null&&meterState.visible;
    meterRoot.dataset.mode=reduced||!A||reviewPhase!==null?'static':paused?'paused':'auto';
    meterRoot.querySelector('[data-meter-mode]').textContent=reduced||!A||reviewPhase!==null?'동작 예시':paused?'일시 정지':'자동 시연';
    if(enabled&&A){
      if(!meterState.started){
        meterState.started=true;const counter={value:0};
        meterState.counter=A.animate(counter,{value:1000,duration:1100,ease:'out(3)',onUpdate:()=>meterNumbers(counter.value),onComplete:()=>meterNumbers(1000)});
      }
      meterState.progress?.resume();if(meterState.counter&&!meterState.counter.completed)meterState.counter.resume();
    }else{
      meterState.progress?.pause();if(meterState.counter){meterState.counter.cancel();meterState.counter=null;meterNumbers(1000);}meterState.caption?.cancel();
      meterRoot.querySelectorAll('[data-meter-title],[data-meter-copy]').forEach(node=>node.style.removeProperty('opacity'));
    }
  }
  if(meterState){
    meterNumbers(1000);meterPaint();
    if(A&&!reduced&&reviewPhase===null)meterState.progress=A.animate(meterRoot.querySelector('[data-meter-progress]'),{scaleX:[0,1],duration:4500,ease:'linear',loop:true,autoplay:false,onLoop:()=>{meterState.phase=(meterState.phase+1)%3;meterPaint();}});
    new IntersectionObserver(entries=>{meterState.visible=entries[0].isIntersecting;meterSync();},{threshold:.15}).observe(meterRoot);
  }

  function sync(){
    meterSync();
    const enabled=!paused&&!reduced&&!document.hidden&&reviewPhase===null;
    if(paused&&refinedPage)for(const [node,job] of revealJobs){job.cancel();node.style.removeProperty('opacity');node.style.removeProperty('transform');revealJobs.delete(node);}
    for(const m of visuals){
      const reading=m.followReading&&readingViewport.matches,info=enabled&&m.followReading?readingInfo(m):{selected:null,eligible:[]},selected=info.selected;
      if(enabled&&m.visible&&selected!==null&&(reading||!info.eligible.includes(m.step%m.phases))&&m.step%m.phases!==selected){
        m.captionJob?.cancel();m.el.querySelectorAll('[data-caption-title],[data-caption-copy]').forEach(x=>{x.style.removeProperty('opacity');x.style.removeProperty('transform');});m.step=selected;paint(m,false);
      }
      const active=enabled&&m.visible&&(!m.followReading||selected!==null);
      const mode=reduced||reviewPhase!==null?'static':paused?'paused':active?(reading?'reading':'auto'):'offscreen';
      if(m.el.dataset.motionMode!==mode)m.el.dataset.motionMode=mode;
      if(active){if(reading)m.timer?.pause();else m.timer?.resume();m.job?.resume();if(m.allocationJob&&!m.allocationJob.completed)m.allocationJob.resume();}
      else{m.timer?.pause();m.job?.pause();m.allocationJob?.pause();m.captionJob?.cancel();m.el.querySelectorAll('[data-caption-title],[data-caption-copy]').forEach(x=>{x.style.removeProperty('opacity');x.style.removeProperty('transform');});}
      const label=reduced||reviewPhase!==null?'동작 예시':paused?'일시 정지':reading?'스크롤 따라보기':'자동 시연';
      m.el.querySelectorAll('[data-caption-mode]').forEach(x=>{if(x.textContent!==label)x.textContent=label;});
    }
    controls.forEach(b=>{b.setAttribute('aria-pressed',String(paused));b.disabled=reduced;const markup=(reduced?'움직임 최소화':paused?'모션 재생':'모션 정지')+' <span aria-hidden="true">'+(paused?'▷':'Ⅱ')+'</span>';if(b.innerHTML!==markup)b.innerHTML=markup;});
  }
  const activity=new IntersectionObserver(entries=>{for(const entry of entries){const m=visuals.find(m=>m.el===entry.target);if(m)m.visible=entry.isIntersecting;}sync();},{threshold:.15});
  visuals.forEach(m=>activity.observe(m.el));controls.forEach(b=>b.addEventListener('click',()=>{paused=!paused;sync();}));document.addEventListener('visibilitychange',sync);
  if(refinedPage){
    let readingQueued=false;
    function queueReading(){if(!readingQueued){readingQueued=true;requestAnimationFrame(()=>{readingQueued=false;sync();});}}
    addEventListener('scroll',queueReading,{passive:true});
    addEventListener('resize',queueReading);readingViewport.addEventListener('change',queueReading);
  }
  if(A&&!reduced){
    const reveal=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){reveal.unobserve(e.target);if(refinedPage&&paused)continue;const job=A.animate(e.target,{opacity:[refinedPage ? .84 : .55,1],y:[refinedPage?8:12,0],duration:refinedPage?420:650,ease:'out(3)',onComplete:()=>revealJobs.delete(e.target)});if(refinedPage)revealJobs.set(e.target,job);}},{threshold:.12});
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

(() => {
 'use strict';
 const header=document.querySelector('[data-weaver-gnb]');if(!header)return;
 const toggle=header.querySelector('.weaver-gnb-toggle'),panel=header.querySelector('.weaver-gnb-panel'),backdrop=header.querySelector('.weaver-gnb-backdrop');
 let open=false;
 function setOpen(next,restore=false){
  open=next;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'제품 메뉴 닫기':'제품 메뉴 열기');
  panel.hidden=!open;backdrop.hidden=!open;document.documentElement.classList.toggle('weaver-navigation-open',open);
  toggle.querySelector('path').setAttribute('d',open?'M6 6l12 12M6 18L18 6':'M5 7h14M5 12h14M5 17h14');
  if(open)panel.scrollTop=0;if(restore)toggle.focus({preventScroll:true});
 }
 toggle.addEventListener('click',()=>setOpen(!open));
 backdrop.addEventListener('click',()=>setOpen(false,true));
 header.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setOpen(false)));
 document.addEventListener('weaver-close-navigation',()=>setOpen(false));
 document.addEventListener('keydown',e=>{
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();setOpen(false,true);}
  if(e.key==='Tab'){
   const nodes=[...header.querySelectorAll('a,button')].filter(el=>!el.hidden&&el.getClientRects().length&&el.tabIndex>=0),first=nodes[0],last=nodes[nodes.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 const breakpoint=matchMedia('(max-width:834px)');breakpoint.addEventListener('change',()=>setOpen(false));
 addEventListener('pagehide',()=>setOpen(false));
})();
