/* SPDX-FileCopyrightText: 2026 MUST AI WEAVER contributors
 * SPDX-License-Identifier: Apache-2.0 */
(() => {
  'use strict';
  const recipient='ai.sw.platform@maymust.com';
  const contactUrl='https://www.maymust.com/contact';
  const publicBase='https://kangjinsoo-002.github.io/ai-weaver-landing/';
  const products=[['weaver','전체 구성'],['orbis','ORBIS'],['fractos','FRACTOS'],['fabrix','FABRIX'],['stratos','STRATOS'],['agentic','Agentic AI'],['security','AI 보안']];
  const scenarios={gpu:['GPU 대기',['fractos','fabrix']],incident:['장애 대응',['fabrix','agentic']],cost:['사용량·비용',['stratos','fractos']],approval:['요청·승인',['agentic','fabrix']]};
  const stages={understand:'환경 확인',scope:'범위 설계',validate:'검증',operate:'운영 전환'};
  let dialog,opener,context,lastContext='',step=1;

  function currentContext(){
    const file=location.pathname.split('/').pop()||'index.html';
    const product=document.body.dataset.product;
    let label='AI WEAVER · 전체 구성',selected=['weaver'],fragment='';
    if(product){
      selected=[product];label=products.find(p=>p[0]===product)?.[1]||'AI WEAVER';
    }else if(file==='scenarios.html'||file==='adoption.html'){
      const cases=[...document.querySelectorAll(file==='scenarios.html'?'.use-case':'.guide-stage')];
      const visible=cases.find(el=>el.getBoundingClientRect().top<innerHeight*.55&&el.getBoundingClientRect().bottom>100);
      const previous=cases.filter(el=>el.getBoundingClientRect().top<=100).at(-1);
      const section=visible||previous;
      label=file==='scenarios.html'?'활용 시나리오':'도입 안내';
      if(section){
        fragment=section.id;
        if(scenarios[fragment]){label+=' · '+scenarios[fragment][0];selected=scenarios[fragment][1];}
        else if(stages[fragment])label+=' · '+stages[fragment];
      }
    }else if(file==='brand.html')label='WEAVER 브랜드';
    else{
      const copy=document.querySelector('.business-copy');
      if(copy&&getComputedStyle(copy).opacity*1>.5&&copy.getBoundingClientRect().top<innerHeight&&copy.getBoundingClientRect().bottom>68){
        const title=copy.querySelector('h2')?.textContent.trim();
        const match=products.find(p=>p[1]===title);
        if(match){selected=[match[0]];label=match[1]+' · 제품 소개';}
      }
    }
    const source=new URL(file,publicBase);if(fragment)source.hash=fragment;
    return {label,selected,url:source.href,key:file+'#'+fragment+'|'+label};
  }

  function mount(){
    dialog=document.createElement('dialog');
    dialog.className='weaver-inquiry';
    dialog.setAttribute('aria-labelledby','weaver-inquiry-title');
    dialog.innerHTML=`
      <aside class="inquiry-aside">
        <span class="inquiry-brand">AI WEAVER <small>CONTACT</small></span>
        <h2>필요한 운영부터,<br>함께 시작합니다.</h2>
        <p>현재 환경과 궁금한 점을 정리해<br>담당 팀에 전달해 주세요.</p>
        <ol class="inquiry-progress" aria-label="문의 작성 단계">
          <li data-inquiry-progress="1" aria-current="step"><span>01</span>문의 내용</li>
          <li data-inquiry-progress="2"><span>02</span>확인 및 전달</li>
        </ol>
        <div class="inquiry-contact"><span>AI SW 플랫폼 사업부</span><a href="mailto:${recipient}">${recipient}</a><a class="inquiry-official" href="${contactUrl}" target="_blank" rel="noopener noreferrer">공식 연락처 보기 <span aria-hidden="true">↗</span></a></div>
      </aside>
      <div class="inquiry-main">
        <div class="inquiry-heading"><span data-inquiry-step-label>01 / 문의 내용</span><button type="button" class="inquiry-close" aria-label="문의 창 닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <h2 id="weaver-inquiry-title" tabindex="-1">어떤 운영부터 시작할까요?</h2>
        <p class="inquiry-intro" data-inquiry-intro>관심 있는 제품과 검토할 내용을 알려주세요.</p>
        <div class="inquiry-source"><span>살펴보던 내용</span><b data-inquiry-source></b></div>
        <form class="inquiry-form" novalidate>
          <div data-inquiry-step="1">
            <fieldset class="inquiry-fieldset"><legend>관심 제품 <small>여러 개 선택할 수 있어요</small></legend><div class="inquiry-products">${products.map(([id,name])=>`<button type="button" data-inquiry-product="${id}" aria-pressed="false">${name}</button>`).join('')}</div></fieldset>
            <div class="inquiry-purpose"><label for="inquiry-purpose">문의 목적</label><select id="inquiry-purpose" name="purpose"><option>도입 상담</option><option>제품 데모</option><option>기술·연동 검토</option><option>구축·운영 서비스</option></select></div>
            <div class="inquiry-fields"><div><label for="inquiry-company">회사·기관명 <small>선택</small></label><input id="inquiry-company" name="company" autocomplete="organization" maxlength="100" placeholder="소속 회사 또는 기관"></div><div><label for="inquiry-name">성함 <small>선택</small></label><input id="inquiry-name" name="name" autocomplete="name" maxlength="80" placeholder="담당자 성함"></div></div>
            <div class="inquiry-field"><label for="inquiry-email">회신 이메일 <small>선택</small></label><input id="inquiry-email" name="email" type="email" autocomplete="email" maxlength="160" placeholder="답변받을 이메일 주소" aria-describedby="inquiry-email-error"><p id="inquiry-email-error" class="inquiry-error" hidden>이메일 주소 형식을 확인해 주세요.</p></div>
            <div class="inquiry-field"><label for="inquiry-message">검토하고 싶은 내용 <small>선택</small></label><textarea id="inquiry-message" name="message" maxlength="1200" rows="3" placeholder="현재 GPU·클러스터 환경이나 먼저 개선하고 싶은 업무를 적어주세요."></textarea></div>
            <p class="inquiry-note">아직 정해지지 않은 내용은 비워 두셔도 괜찮습니다.</p>
            <div class="inquiry-actions"><button class="inquiry-primary" type="submit">문의 내용 확인 <span aria-hidden="true">→</span></button></div>
          </div>
          <div data-inquiry-step="2" hidden>
            <div class="inquiry-review-meta"><span>받는 곳</span><b>AI SW 플랫폼 사업부</b><span>${recipient}</span></div>
            <label class="inquiry-preview-label" for="inquiry-preview">전달할 내용</label><textarea id="inquiry-preview" class="inquiry-preview" readonly rows="11"></textarea>
            <p class="inquiry-delivery-note">메일 앱에서 내용을 확인한 뒤 직접 전송해 주세요. 메일 앱이 열리지 않으면 내용을 복사해 위 주소로 보내실 수 있습니다.</p>
            <div class="inquiry-actions inquiry-review-actions"><button class="inquiry-back" type="button">내용 수정</button><button class="inquiry-copy" type="button">문의 내용 복사</button><a class="inquiry-primary" data-inquiry-compose href="mailto:${recipient}">메일 작성하기 <span aria-hidden="true">↗</span></a></div>
          </div>
        </form>
        <p class="inquiry-status" role="status" aria-live="polite"></p>
      </div>`;
    document.body.append(dialog);
    const form=dialog.querySelector('form');
    const email=form.elements.email,error=dialog.querySelector('.inquiry-error');
    dialog.querySelector('.inquiry-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',()=>{document.documentElement.classList.remove('weaver-inquiry-open');if(opener?.isConnected)opener.focus({preventScroll:true});});
    email.addEventListener('input',()=>{email.removeAttribute('aria-invalid');error.hidden=true;});
    dialog.querySelectorAll('[data-inquiry-product]').forEach(button=>button.addEventListener('click',()=>{
      const all=dialog.querySelector('[data-inquiry-product="weaver"]');
      if(button===all){selectProducts(['weaver']);return;}
      all.setAttribute('aria-pressed','false');button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));
      if(!dialog.querySelector('[data-inquiry-product][aria-pressed="true"]'))all.setAttribute('aria-pressed','true');
    }));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!email.validity.valid){email.setAttribute('aria-invalid','true');error.hidden=false;email.focus();return;}
      const selection=[...dialog.querySelectorAll('[data-inquiry-product][aria-pressed="true"]')].map(e=>e.textContent).join(' · ');
      const value=name=>form.elements[name].value.trim();
      const subject='AI WEAVER '+value('purpose')+' | '+selection;
      const body=[subject,'', '관심 제품: '+selection,'문의 목적: '+value('purpose'),'회사·기관: '+(value('company')||'메일에서 작성 예정'),'성함: '+(value('name')||'메일에서 작성 예정'),'회신 이메일: '+(value('email')||'발신 메일 주소로 회신'),'', '검토하고 싶은 내용',value('message')||'현재 환경과 검토할 내용은 메일에서 작성하겠습니다.','', '살펴보던 내용: '+context.label,'참고 페이지: '+context.url].join('\n');
      dialog.querySelector('.inquiry-preview').value=body;
      dialog.querySelector('[data-inquiry-compose]').href='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      showStep(2);
    });
    dialog.querySelector('.inquiry-back').addEventListener('click',()=>showStep(1));
    dialog.querySelector('.inquiry-copy').addEventListener('click',async()=>{
      const button=dialog.querySelector('.inquiry-copy'),preview=dialog.querySelector('.inquiry-preview');button.disabled=true;
      try{
        if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(preview.value);status('문의 내용을 복사했습니다. 받는 주소는 '+recipient+'입니다.');
      }catch{
        preview.focus();preview.select();status('문의 내용을 선택했습니다. 키보드의 복사 기능으로 복사해 주세요.');
      }finally{button.disabled=false;}
    });
    dialog.querySelector('[data-inquiry-compose]').addEventListener('click',()=>status('메일 앱에서 내용을 확인한 뒤 전송해 주세요. 이 창에서도 문의 내용을 다시 복사할 수 있습니다.'));
  }
  function status(text){dialog.querySelector('.inquiry-status').textContent=text;}
  function selectProducts(ids){dialog.querySelectorAll('[data-inquiry-product]').forEach(e=>e.setAttribute('aria-pressed',String(ids.includes(e.dataset.inquiryProduct))));}
  function showStep(next){
    step=next;dialog.querySelectorAll('[data-inquiry-step]').forEach(e=>e.hidden=e.dataset.inquiryStep!==String(step));
    dialog.querySelectorAll('[data-inquiry-progress]').forEach(e=>{if(e.dataset.inquiryProgress===String(step))e.setAttribute('aria-current','step');else e.removeAttribute('aria-current');});
    dialog.querySelector('[data-inquiry-step-label]').textContent=step===1?'01 / 문의 내용':'02 / 확인 및 전달';
    dialog.querySelector('#weaver-inquiry-title').textContent=step===1?'어떤 운영부터 시작할까요?':'정리한 내용을 확인해 주세요.';
    dialog.querySelector('[data-inquiry-intro]').textContent=step===1?'관심 있는 제품과 검토할 내용을 알려주세요.':'메일 작성 전에 내용과 받는 곳을 확인할 수 있습니다.';
    status('');dialog.querySelector('.inquiry-main').scrollTop=0;dialog.scrollTop=0;
    if(dialog.open)dialog.querySelector('#weaver-inquiry-title').focus({preventScroll:true});
  }
  function initialize(){
    document.querySelectorAll('[data-inquiry]').forEach(button=>{
      button.setAttribute('aria-haspopup','dialog');
      button.addEventListener('click',()=>{
        opener=button;const nextContext=currentContext();
        document.dispatchEvent(new Event('weaver-close-navigation'));
        if(!dialog)mount();
        context=nextContext;
        if(context.key!==lastContext){selectProducts(context.selected);lastContext=context.key;}
        dialog.querySelector('[data-inquiry-source]').textContent=context.label;
        showStep(1);document.documentElement.classList.add('weaver-inquiry-open');dialog.showModal();
        dialog.querySelector('#weaver-inquiry-title').focus({preventScroll:true});
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
