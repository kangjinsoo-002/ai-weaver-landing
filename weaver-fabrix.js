/* SPDX-FileCopyrightText: 2026 MUST AI WEAVER contributors
 * SPDX-License-Identifier: Apache-2.0 */
(() => {
  'use strict';
  const root=document.querySelector('[data-fabrix-observation]');
  if(!root)return;
  const tabs=[...root.querySelectorAll('[role=tab]')];
  const panels=tabs.map(tab=>document.getElementById(tab.getAttribute('aria-controls')));
  if(panels.some(panel=>!panel))return;
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{
      const active=i===index;
      tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
      panels[i].classList.toggle('is-selected',active);
      panels[i].setAttribute('aria-hidden',String(!active));panels[i].inert=!active;
      panels[i].tabIndex=active?0:-1;
    });
    if(focus)tabs[index].focus({preventScroll:true});
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:null;
      if(next===null)return;
      event.preventDefault();select(next,true);
    });
  });
  root.classList.add('is-interactive');select(0);
  // Deferred enhancement changes a deep link's position during the first layout.
  function alignEvidence(){
    if(!location.hash.startsWith('#fabrix-incident-'))return;
    const target=document.getElementById(location.hash.slice(1));if(!target)return;
    const header=document.querySelector('[data-weaver-gnb]');
    window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-header.offsetHeight-20),behavior:'instant'});
  }
  let readingStarted=false;
  for(const event of ['pointerdown','keydown','wheel','touchstart'])addEventListener(event,()=>{readingStarted=true;},{once:true,passive:true});
  const alignInitial=()=>{if(!readingStarted)alignEvidence();};
  addEventListener('pageshow',()=>requestAnimationFrame(alignInitial),{once:true});
  document.fonts.ready.then(()=>requestAnimationFrame(alignInitial));
  addEventListener('hashchange',alignEvidence);
})();
