(function(){
  'use strict';
  var d=document,root=d.documentElement;root.classList.add('js');
  try{if(sessionStorage.getItem('mm-intro')){root.classList.add('no-intro');}else{sessionStorage.setItem('mm-intro','1');setTimeout(function(){root.classList.add('intro-done');},1300);}}catch(e){root.classList.add('no-intro');}
  var nav=d.querySelector('.nav'),burger=d.querySelector('.burger');
  function onScroll(){if(nav)nav.classList.toggle('is-solid',window.scrollY>40);}
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  if(burger){
    burger.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      burger.setAttribute('aria-expanded',open);
      d.body.style.overflow=open?'hidden':'';
    });
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){burger.click();burger.focus();}});
    d.querySelectorAll('.drawer a').forEach(function(a){a.addEventListener('click',function(){if(nav.classList.contains('open'))burger.click();});});
  }
  // reveal on scroll
  var els=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(function(el){el.classList.add('in');});}
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // clip reveals
  var clips=d.querySelectorAll('.clip');
  if('IntersectionObserver' in window&&!RM){var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io2.unobserve(x.target);}});},{threshold:.15});clips.forEach(function(c){io2.observe(c);});}else clips.forEach(function(c){c.classList.add('in');});
  // slow parallax
  var px=d.querySelectorAll('.parallax');
  if(px.length&&!RM){var tick=false;function par(){px.forEach(function(el){var r=el.parentNode.getBoundingClientRect(),vh=innerHeight;if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/vh;el.style.transform='translate3d(0,'+(p*-8-8)+'%,0)';});tick=false;}
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(par);}},{passive:true});par();}
  // desktop cursor
  var cur=d.querySelector('.cursor');
  if(cur&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!RM){
    var x=0,y=0,cx=0,cy=0;addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY;cur.classList.add('on');},{passive:true});
    (function loop(){cx+=(x-cx)*.18;cy+=(y-cy)*.18;cur.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(loop);})();
    d.querySelectorAll('a,button,.card,video').forEach(function(el){el.addEventListener('mouseenter',function(){cur.classList.add('big');});el.addEventListener('mouseleave',function(){cur.classList.remove('big');});});
    d.addEventListener('mouseleave',function(){cur.classList.remove('on');});
  }
  // year
  d.querySelectorAll('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear();});
  // reduced motion: pause autoplay video
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){d.querySelectorAll('video[autoplay]').forEach(function(v){v.removeAttribute('autoplay');v.pause();v.setAttribute('controls','');});}
  // work filters
  var fb=d.querySelectorAll('.filters button');
  fb.forEach(function(b){b.addEventListener('click',function(){
    var f=b.dataset.filter;fb.forEach(function(x){x.setAttribute('aria-pressed',x===b);});
    d.querySelectorAll('.case').forEach(function(c){c.hidden=!(f==='all'||c.dataset.cat.indexOf(f)>-1);});
  });});
  // inquiry form: preselect from ?type=, AJAX to Formspree, mailto fallback
  var form=d.querySelector('#inquiry');
  if(form){
    var q=new URLSearchParams(location.search).get('type'),sel=form.querySelector('select');
    if(q&&sel){[].forEach.call(sel.options,function(o){if(o.value===q)sel.value=q;});}
    var status=form.querySelector('.form-status');
    form.addEventListener('submit',function(e){
      if(!form.checkValidity())return;
      e.preventDefault();
      var data=new FormData(form);
      function mailto(){
        var body='Name: '+data.get('name')+'\nBrand: '+data.get('brand')+'\nEmail: '+data.get('email')+'\nProject: '+data.get('project_type')+'\n\n'+data.get('message');
        location.href='mailto:mariamarronbusiness@gmail.com?subject='+encodeURIComponent('Collab inquiry — '+data.get('brand'))+'&body='+encodeURIComponent(body);
        status.textContent='Opening your email app… or write directly to mariamarronbusiness@gmail.com';
      }
      if(form.action.indexOf('YOUR_FORM_ID')>-1){mailto();return;}
      status.textContent='Sending…';
      fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}}).then(function(r){
        if(r.ok){form.reset();status.textContent='Thank you — your inquiry is in. Maria will be in touch personally.';}
        else mailto();
      }).catch(mailto);
    });
  }
})();
