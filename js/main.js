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
    c.addEventListener('pointermove',function(e){ex=e.clientX;ey=e.clientY;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var r=c.getBoundingClientRect(),px=(ex-r.left)/r.width-.5,py=(ey-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateX('+(-py*3).toFixed(2)+'deg) rotateY('+(px*3.5).toFixed(2)+'deg)';});});
    c.addEventListener('pointerleave',function(){c.style.transform='';});});}
  // hero video: muted autoplay loop; poster only for reduced motion / save-data
  var hm=d.getElementById('heroMedia');
  if(hm&&!RM&&!(navigator.connection&&navigator.connection.saveData)){var go=function(){var base=innerWidth<800||Math.min(screen.width,screen.height)<700?hm.dataset.v720:hm.dataset.v1080,v=d.createElement('video');
    v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.autoplay=true;v.preload='auto';v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('aria-hidden','true');v.tabIndex=-1;v.className='hero__video';v.poster=hm.querySelector('img').currentSrc||'';
    v.innerHTML='<source src="'+base+'.mp4" type="video/mp4"><source src="'+base+'.webm" type="video/webm">';
    v.addEventListener('playing',function(){hm.classList.add('playing');},{once:true});hm.appendChild(v);var p=v.play();if(p&&p.catch)p.catch(function(){});
    d.addEventListener('visibilitychange',function(){d.hidden?v.pause():v.play().catch(function(){});});};
    if(d.readyState==='complete')setTimeout(go,150);else addEventListener('load',function(){setTimeout(go,150);});}
  // exhibition: details dialog with focus return
  var dlg=d.getElementById('exd');
  if(dlg){var body=dlg.querySelector('.exd__body'),from=null;
    d.querySelectorAll('.exh__frame').forEach(function(b){b.addEventListener('click',function(){from=b;body.innerHTML=b.closest('.exh').querySelector('template').innerHTML;if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');dlg.querySelector('.exd__x').focus();});});
    dlg.querySelector('.exd__x').addEventListener('click',function(){dlg.close();});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});
    dlg.addEventListener('close',function(){if(from)from.focus();});}
  // refined dot cursor (desktop only)
  if(!RM&&matchMedia('(hover:hover) and (pointer:fine)').matches&&d.body.classList.contains('home')){var dot=d.createElement('div');dot.className='dot';dot.setAttribute('aria-hidden','true');d.body.appendChild(dot);root.classList.add('has-dot');
    var tx=-50,ty=-50,cx=-50,cy=-50,on=0;function mv(){cx+=(tx-cx)*.35;cy+=(ty-cy)*.35;dot.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)';if(Math.abs(tx-cx)+Math.abs(ty-cy)>.3)requestAnimationFrame(mv);else on=0;}
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;if(!on){on=1;requestAnimationFrame(mv);}},{passive:true});
    d.addEventListener('pointerover',function(e){dot.classList.toggle('big',!!e.target.closest('a,button,select,input,textarea'));});}
})();
document.querySelectorAll('.exh .placard').forEach(p=>p.addEventListener('click',()=>p.parentElement.querySelector('.exh__frame').click()));
/* v6: hero parallax + storefront glide */
(function(){var d=document,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var hm=d.getElementById('heroMedia'),fg=d.getElementById('heroFg');
 if(hm&&fg&&!RM){var tx=0,ty=0,x=0,y=0,run=false,vis=true;
  function tick(){x+=(tx-x)*.06;y+=(ty-y)*.06;hm.style.transform='translate3d('+(-x*14).toFixed(2)+'px,'+(-y*10).toFixed(2)+'px,0)';fg.style.transform='translate3d('+(x*8).toFixed(2)+'px,'+(y*6).toFixed(2)+'px,0)';if(Math.abs(tx-x)>.001||Math.abs(ty-y)>.001)requestAnimationFrame(tick);else run=false;}
  function set(a,b){tx=Math.max(-1,Math.min(1,a));ty=Math.max(-1,Math.min(1,b));if(!run&&vis){run=true;requestAnimationFrame(tick);}}
  addEventListener('pointermove',function(e){if(e.pointerType==='mouse')set(e.clientX/innerWidth*2-1,e.clientY/innerHeight*2-1);},{passive:true});
  addEventListener('deviceorientation',function(e){if(e.gamma==null)return;set(e.gamma/25,(e.beta-45)/25);},{passive:true});
  new IntersectionObserver(function(en){vis=en[0].isIntersecting;}).observe(hm.parentElement);}
 var t=d.getElementById('sfTrack');if(!t)return;var btns=d.querySelectorAll('.sf__btn'),items=[].slice.call(t.querySelectorAll('.exh'));
 function step(){return items[0].getBoundingClientRect().width+parseFloat(getComputedStyle(t).columnGap||40);}
 btns.forEach(function(b){b.addEventListener('click',function(){t.scrollBy({left:step()*+b.dataset.dir,behavior:RM?'auto':'smooth'});});});
 t.addEventListener('keydown',function(e){if(e.target!==t)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();t.scrollBy({left:step()*(e.key==='ArrowRight'?1:-1),behavior:RM?'auto':'smooth'});}});
 function upd(){var c=innerWidth/2;btns[0].disabled=t.scrollLeft<4;btns[1].disabled=t.scrollLeft>t.scrollWidth-t.clientWidth-4;
  if(RM)return;items.forEach(function(it){var r=it.getBoundingClientRect(),o=(r.left+r.width/2-c)/innerWidth;if(Math.abs(o)>1.2)return;var im=it.querySelector('.exh__mat img'),pl=it.querySelector('.placard');if(im)im.style.transform='translate3d('+(-o*8).toFixed(1)+'px,0,0)';if(pl)pl.style.transform='translate3d('+(o*-10).toFixed(1)+'px,0,0)';});}
 var q=false;t.addEventListener('scroll',function(){if(!q){q=true;requestAnimationFrame(function(){q=false;upd();});}},{passive:true});addEventListener('resize',upd);upd();
 var down=false,moved=0,sx=0,sl=0,lx=0,lt=0,v=0;
 t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=0;sx=lx=e.clientX;sl=t.scrollLeft;lt=performance.now();v=0;});
 addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4&&!t.classList.contains('is-drag'))t.classList.add('is-drag');moved=Math.max(moved,Math.abs(dx));t.scrollLeft=sl-dx;var n=performance.now();v=(e.clientX-lx)/Math.max(1,n-lt);lx=e.clientX;lt=n;});
 addEventListener('pointerup',function(){if(!down)return;down=false;if(!t.classList.contains('is-drag'))return;var vel=-v*16;(function glide(){if(Math.abs(vel)>.5&&!RM){t.scrollLeft+=vel;vel*=.92;requestAnimationFrame(glide);}else{t.classList.remove('is-drag');}})();});
 t.addEventListener('click',function(e){if(moved>6){e.preventDefault();e.stopPropagation();moved=0;}},true);
})();
