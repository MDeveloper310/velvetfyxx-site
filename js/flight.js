/* Maison flight — scroll-scrubbed camera through Maria's images (home only).
   Loads heavy libs only when WebGL + motion are allowed; otherwise the static hero remains. */
const html=document.documentElement;
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const glOK=(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}})();
const root=document.getElementById('flight');
if(root&&!rm&&glOK){init().catch(e=>{console.warn('flight fallback',e);html.classList.remove('fx')})}

function load(src){return new Promise((r,j)=>{const s=document.createElement('script');s.src=src;s.onload=r;s.onerror=j;document.head.appendChild(s)})}

async function init(){
  html.classList.add('fx');
  const [THREE]=await Promise.all([import('../assets/js/vendor/three.module.min.js'),load('assets/js/vendor/gsap.min.js').then(()=>load('assets/js/vendor/ScrollTrigger.min.js')),load('assets/js/vendor/lenis.min.js')]);
  const {gsap,ScrollTrigger,Lenis}=window; gsap.registerPlugin(ScrollTrigger);
  const mobile=matchMedia('(max-width:899px)').matches;
  const scenes=[...root.querySelectorAll('.fl-scene')];
  const N=scenes.length, D=14, HOLD=6.5;

  /* split headline letters (aria-label keeps it readable) */
  root.querySelectorAll('[data-split]').forEach(el=>{
    const t=el.textContent; el.setAttribute('aria-label',t); let i=0;
    el.innerHTML=t.split(' ').map(w=>'<span class="w" aria-hidden="true">'+[...w].map(ch=>`<span class="lt" style="--i:${i++}">${ch}</span>`).join('')+'</span>').join(' ');
  });

  /* renderer */
  const canvas=root.querySelector('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:!mobile,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.5));
  renderer.setClearColor(0x0B0708,1);
  const scene=new THREE.Scene(); scene.fog=new THREE.Fog(0x0B0708,10,30);
  const cam=new THREE.PerspectiveCamera(50,1,.1,200);
  const loader=new THREE.TextureLoader();

  const vs=`varying vec2 vUv;uniform float uWave;uniform float uTime;
  void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.y*5.+uTime*.7)*uWave*.35+cos(uv.x*4.+uTime*.5)*uWave*.2;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
  const fs=`precision highp float;varying vec2 vUv;uniform sampler2D uTex;uniform float uOp,uWave,uBlur,uTime,uImgA,uPlA;
  void main(){
    vec2 uv=vUv; vec2 s=vec2(min(uPlA/uImgA,1.),min(uImgA/uPlA,1.)); uv=(uv-.5)*s+.5;          /* cover fit */
    uv+=vec2(sin(uv.y*9.+uTime*.8),cos(uv.x*7.+uTime*.6))*.014*uWave;                         /* silk */
    vec2 dir=(uv-.5)*uBlur*.06; vec3 c=vec3(0.);
    for(int i=0;i<8;i++){c+=texture2D(uTex,uv-dir*float(i)/7.).rgb;} c/=8.;                     /* zoom blur */
    float l=dot(c,vec3(.299,.587,.114));
    vec3 shadow=vec3(.10,.035,.045), gold=vec3(.95,.80,.55);
    c=mix(c,mix(shadow,gold,l),.22); c*=.82;                                                      /* grade */
    float v=smoothstep(.85,.25,length(vUv-.5)); c*=mix(.55,1.,v);
    float e=smoothstep(0.,.03,vUv.x)*smoothstep(1.,.97,vUv.x)*smoothstep(0.,.03,vUv.y)*smoothstep(1.,.97,vUv.y);
    gl_FragColor=vec4(c,uOp*e);}`;

  const planes=scenes.map((el,i)=>{
    const u={uTex:{value:null},uOp:{value:0},uWave:{value:0},uBlur:{value:0},uTime:{value:0},uImgA:{value:.75},uPlA:{value:.75}};
    const H=6.2, W=mobile?H*.62:H*.78;
    u.uPlA.value=W/H;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(W,H,mobile?16:32,mobile?16:32),new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false}));
    const side=mobile?0:(i===0?1.6:(i%2?1.9:-1.9));
    m.position.set(side,0,-i*D); scene.add(m);
    const src=el.dataset.img.replace('{w}',mobile?'600':'1200');
    loader.load(src,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;u.uTex.value=t;u.uImgA.value=t.image.width/t.image.height});
    /* gold hairline frame floating slightly behind = parallax layer */
    const f=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(W*1.08,H*1.06)),new THREE.LineBasicMaterial({color:0xC9A45C,transparent:true,opacity:0}));
    f.position.set(side+(i%2?-.35:.35),.25,-i*D-1.2); scene.add(f);
    return {m,u,f};
  });
  /* drifting gold dust motes — deep parallax layer (sparse, not a dissolve) */
  const motes=new THREE.Group();
  for(let k=0;k<(mobile?14:28);k++){const s=new THREE.Mesh(new THREE.PlaneGeometry(.03,.03),new THREE.MeshBasicMaterial({color:0xE3C789,transparent:true,opacity:.5}));s.position.set((Math.random()-.5)*14,(Math.random()-.5)*9,-Math.random()*N*D);motes.add(s)}
  scene.add(motes);

  function size(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  size(); addEventListener('resize',size);

  /* smooth scroll */
  const lenis=new Lenis({lerp:.075,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t)}}));

  let target=0, pos=0, last=-1, vel=0, running=true;
  ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',onUpdate:s=>{target=s.progress}});
  new IntersectionObserver(([e])=>{running=e.isIntersecting},{rootMargin:'100px'}).observe(root);
  const leak=root.querySelector('.fl-leak'), bar=root.querySelector('.fl-bar i'), count=root.querySelector('.fl-count');

  const ss=(a,b,x)=>{const t=Math.min(Math.max((x-a)/(b-a),0),1);return t*t*(3-2*t)};
  function frame(t){
    if(!running)return;
    const p=target*(N-1); const i0=Math.floor(p), fr=p-i0;
    const eased=i0+ss(.22,.78,fr);                 /* hold on each scene, glide between */
    const prev=pos; pos+=(eased-pos)*.085; vel=Math.abs(pos-prev);
    const cz=HOLD-pos*D; cam.position.z=cz;
    cam.position.x=Math.sin(pos*1.3)*.25; cam.position.y=Math.cos(pos*.9)*.15; cam.lookAt(cam.position.x*.4,0,cz-10);
    planes.forEach(({u,f,m},i)=>{
      const dist=cz-m.position.z;
      const op=ss(D*1.35,D*.55,dist)*ss(.8,3.8,dist);
      u.uOp.value=op; u.uTime.value=t;
      const near=1-ss(2.8,6,dist);
      u.uWave.value=Math.min(1,near*1.4+vel*8); u.uBlur.value=Math.min(1,near*1.6);
      f.material.opacity=op*.55;
    });
    motes.rotation.z=pos*.08;
    renderer.render(scene,cam);
    /* light leak peaks mid-transition */
    const tr=Math.sin(Math.PI*(pos-Math.floor(pos)));
    leak.style.opacity=(tr*.85).toFixed(3); leak.style.transform=`translate3d(${(-60+120*(pos-Math.floor(pos)))}vw,0,0) rotate(12deg)`;
    bar.style.transform=`scaleX(${(pos/(N-1)).toFixed(4)})`;
    const act=Math.round(pos);
    if(act!==last&&Math.abs(pos-act)<.18){scenes.forEach((s,k)=>s.classList.toggle('on',k===act));scenes.forEach((s,k)=>s.toggleAttribute('inert',k!==act));count.textContent=String(act+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');last=act}
    else if(Math.abs(pos-act)>=.3&&last!==-1){scenes.forEach(s=>s.classList.remove('on'));last=-1}
  }
  gsap.ticker.add(()=>frame(performance.now()/1000));
  document.addEventListener('visibilitychange',()=>{running=!document.hidden});
  frame(0); scenes[0].classList.add('on');
}
