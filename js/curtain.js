/* gold curtain page transition */
(()=>{const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;const c=document.querySelector('.curtain');if(!c||rm)return;
requestAnimationFrame(()=>c.classList.add('out'));
addEventListener('pageshow',e=>{if(e.persisted){c.classList.remove('in');c.classList.add('out')}});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a||a.target||e.metaKey||e.ctrlKey||e.shiftKey)return;
const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname||!/\.html$|\/$/.test(u.pathname))return;
e.preventDefault();c.classList.remove('out');c.classList.add('in');setTimeout(()=>location.href=u.href,720)});})();
