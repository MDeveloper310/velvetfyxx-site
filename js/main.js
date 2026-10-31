(function(){
  'use strict';
  var d=document,root=d.documentElement;root.classList.add('js');
  root.classList.add('no-intro');
  var nav=d.querySelector('.nav'),burger=d.querySelector('.burger');
  // solid nav via IntersectionObserver sentinel (no scroll handler)
  if(nav&&'IntersectionObserver' in window){var s=d.createElement('div');s.setAttribute('aria-hidden','true');s.style.cssText='position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none';d.body.prepend(s);
    new IntersectionObserver(function(e){nav.classList.toggle('is-solid',!e[0].isIntersecting);}).observe(s);}
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
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}});},{rootMargin:'0px 0px -10% 0px',threshold:.08});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(function(el){el.classList.add('in');});}
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal-once for sweeps and cinematic images (IntersectionObserver, transform/opacity only)
  var once=d.querySelectorAll('.sweep:not(.hero),.cine__img');
  if('IntersectionObserver' in window&&!RM){var io2=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io2.unobserve(x.target);}});},{threshold:.2});once.forEach(function(c){io2.observe(c);});}else once.forEach(function(c){c.classList.add('in');});
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
  // count-up for real figures already on the page ([data-count])
  var cs=d.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window&&!RM){var io3=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;io3.unobserve(x.target);var el=x.target,to=+el.dataset.count,pad=(el.dataset.pad|0),t0=0;
    function f(t){t0=t0||t;var p=Math.min(1,(t-t0)/1400),v=Math.round(to*(1-Math.pow(1-p,3)));el.textContent=String(v).padStart(pad,'0');if(p<1)requestAnimationFrame(f);}
    el.textContent=String(0).padStart(pad,'0');requestAnimationFrame(f);});},{threshold:.6});cs.forEach(function(c){io3.observe(c);});}
  // hover tilt on brand cards (fine pointers only, rAF-throttled, transform only)
  if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches){d.querySelectorAll('.card,.pillar').forEach(function(c){var raf=0,ex,ey;
    c.addEventListener('pointerenter',function(){c.classList.add('tilt');});
    c.addEventListener('pointermove',function(e){ex=e.clientX;ey=e.clientY;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var r=c.getBoundingClientRect(),px=(ex-r.left)/r.width-.5,py=(ey-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateX('+(-py*6).toFixed(2)+'deg) rotateY('+(px*7).toFixed(2)+'deg)';});});
    c.addEventListener('pointerleave',function(){c.style.transform='';});});}
  // 3D objects: lazy ES module after first paint + idle, never blocks load
  var weak=innerWidth<700&&((navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2));
  if(!weak&&!/[?&]no3d/.test(location.search)&&'IntersectionObserver' in window){var go=function(){var s=d.createElement('script');s.type='module';s.src=(d.querySelector('script[src*="main.js"]').src.replace(/main\.js.*$/,'scene3d.js?v=8'));d.body.appendChild(s);};
    var done=0;go=(function(g){return function(){if(!done){done=1;g();}};})(go);
    // touch devices: fetch three.js only once the visitor starts interacting, keeping first load light
    var later=matchMedia('(pointer:coarse)').matches?function(){['scroll','touchstart','pointerdown'].forEach(function(t){addEventListener(t,go,{once:true,passive:true});});}:function(){('requestIdleCallback' in window)?requestIdleCallback(go,{timeout:2500}):setTimeout(go,600);};
    if(matchMedia('(pointer:coarse)').matches)later();else if(d.readyState==='complete')setTimeout(later,300);else addEventListener('load',function(){setTimeout(later,300);});}
})();
