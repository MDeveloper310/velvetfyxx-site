/* Privacy-friendly analytics (GoatCounter: no cookies, no personal data, free for personal sites).
   To turn on: create a free account at https://www.goatcounter.com/signup with the code below
   (e.g. "mariamarron" -> https://mariamarron.goatcounter.com) and put that code here. Empty = off. */
(function(){
  'use strict';
  var GOATCOUNTER_CODE='';
  var d=document,h=location.hostname;
  window.mmTrack=function(name){if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:name,title:name,event:true});};
  if(!GOATCOUNTER_CODE||!/(^|\.)mariamarron\.com$/.test(h))return;
  var s=d.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter','https://'+GOATCOUNTER_CODE+'.goatcounter.com/count');d.head.appendChild(s);
  // events: media kit downloads, email clicks, social clicks
  d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var u=a.getAttribute('href');
    if(/Media-Kit\.pdf$/i.test(u))window.mmTrack('media-kit-download');
    else if(/^mailto:/i.test(u))window.mmTrack('email-click');
    else if(/instagram\.com|tiktok\.com|linktr\.ee/i.test(u))window.mmTrack('social-'+(u.match(/instagram|tiktok|linktr/i)[0].toLowerCase()));
  },true);
})();
