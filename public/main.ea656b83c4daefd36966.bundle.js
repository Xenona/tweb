!function(e){function t(t){for(var n,i,a=t[0],r=t[1],c=0,s=[];c<a.length;c++)i=a[c],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&s.push(o[i][0]),o[i]=0;for(n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n]);for(u&&u(t);s.length;)s.shift()()}var n={},o={10:0};function i(e){return a.p+""+({11:"npm.qr-code-styling"}[e]||e)+"."+{0:"544c4f590d21ae221da2",1:"6e9f13a96787941e216d",2:"a6143ee3f1915f086ab7",3:"1389f218a0b3e1249ce3",4:"8af661a70df014e4027c",5:"dec3e71cb29516462add",6:"e37359041fadf7b22f1f",7:"cfc57f6065d52835349c",8:"6271b8ff5cfa4a4d662a",9:"163a2655451e94610bc5",11:"8aa3bd06d0ac6a3e4378",12:"855e3201fcfba9fd84ba",13:"f8b387764df1b0037d48",14:"760059ead41b26a81981",15:"7fb0c4fd2241db6580a8",16:"b29d77784412c3786b82",17:"77e9dd8a74fe3ccbb64e",18:"f37584d3a81342b5aba8",19:"b0537a5fbf086819d040",20:"f6e2249252e4a1f0656b",21:"f98d7fa595429d78aec6",22:"9f9addd482a35b31e20c",23:"4316bc675d651d0acde9",24:"5ec6dd0d5c0fa3169795",25:"e68e0b5dc0c28de26862",26:"57d63d724978cfc5aa8e",27:"bd18c0ff11eba72d7902",28:"869af925016b2b4650e5",29:"cc2287209c3d3f5b0116",30:"1af216fd8249809ac520"}[e]+".chunk.js"}function a(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,a),o.l=!0,o.exports}a.e=function(e){var t=[],n=o[e];if(0!==n)if(n)t.push(n[2]);else{var r=new Promise((function(t,i){n=o[e]=[t,i]}));t.push(n[2]=r);var c=new Error;var s=function t(n,r){var s,u=document.createElement("script");u.charset="utf-8",u.timeout=120,a.nc&&u.setAttribute("nonce",a.nc),u.src=n,s=function(n){u.onerror=u.onload=null,clearTimeout(d);var a=o[e];if(0!==a)if(a)if(0===r){var s=n&&("load"===n.type?"missing":n.type),l=n&&n.target&&n.target.src;c.message="Loading chunk "+e+" failed after 999999 retries.\n("+s+": "+l+")",c.name="ChunkLoadError",c.type=s,c.request=l,a[1](c),o[e]=void 0}else setTimeout((function(){var n=Date.now(),o=t(i(e)+"?"+n,r-1);document.head.appendChild(o)}),0);else o[e]=void 0};var d=setTimeout((function(){s({type:"timeout",target:u})}),12e4);return u.onerror=u.onload=s,u}(i(e),999999);document.head.appendChild(s)}return Promise.all(t)},a.m=e,a.c=n,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)a.d(n,o,function(t){return e[t]}.bind(null,o));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a.oe=function(e){throw console.error(e),e};var r=this.webpackJsonp=this.webpackJsonp||[],c=r.push.bind(r);r.push=t,r=r.slice();for(var s=0;s<r.length;s++)t(r[s]);var u=c;a(a.s=8)}([function(e,t,n){"use strict";n.r(t),n.d(t,"userAgent",(function(){return o})),n.d(t,"isApple",(function(){return i})),n.d(t,"isAndroid",(function(){return a})),n.d(t,"isChromium",(function(){return r})),n.d(t,"ctx",(function(){return c})),n.d(t,"isAppleMobile",(function(){return s})),n.d(t,"isSafari",(function(){return u})),n.d(t,"isFirefox",(function(){return d})),n.d(t,"isMobileSafari",(function(){return l})),n.d(t,"isMobile",(function(){return f}));const o=navigator?navigator.userAgent:null,i=-1!==navigator.userAgent.search(/OS X|iPhone|iPad|iOS/i),a=-1!==navigator.userAgent.toLowerCase().indexOf("android"),r=/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor),c="undefined"!=typeof window?window:self,s=(/iPad|iPhone|iPod/.test(navigator.platform)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)&&!c.MSStream,u=!!("safari"in c)||!(!o||!(/\b(iPad|iPhone|iPod)\b/.test(o)||o.match("Safari")&&!o.match("Chrome"))),d=navigator.userAgent.toLowerCase().indexOf("firefox")>-1,l=u&&s,f=navigator.maxTouchPoints>0&&-1!=navigator.userAgent.search(/iOS|iPhone OS|Android|BlackBerry|BB10|Series ?[64]0|J2ME|MIDP|opera mini|opera mobi|mobi.+Gecko|Windows Phone/i)},function(e,t,n){"use strict";function o(e){e.style.transform="translateY(-99999px)",e.focus(),setTimeout(()=>{e.style.transform=""},0)}n.d(t,"a",(function(){return o}))},function(e,t,n){"use strict";function o(e){if(e=e||window.event){e=e.originalEvent||e;try{e.stopPropagation&&e.stopPropagation(),e.preventDefault&&e.preventDefault(),e.returnValue=!1,e.cancelBubble=!0}catch(e){}}return!1}n.d(t,"a",(function(){return o}))},function(e,t,n){"use strict";function o(e,t){return e.closest("."+t)}n.d(t,"a",(function(){return o}))},function(e,t,n){"use strict";const o={id:1025907,hash:"452b0359b988148995f22ff0f4229750",version:"0.7.2",langPackVersion:"0.3.2",langPack:"macos",langPackCode:"en",domains:["web.telegram.org"],baseDcId:2,isMainDomain:"web.telegram.org"===location.hostname,suffix:"K"};o.isMainDomain&&(o.id=2496,o.hash="8da85b0d5bfe62527e5b244c209159c3"),t.a=o},function(e,t,n){"use strict";function o(){return!(!document.activeElement||!document.activeElement.blur)&&(document.activeElement.blur(),!0)}n.d(t,"a",(function(){return o}))},function(e,t,n){"use strict";let o;function i(){return o||(o="fonts"in document?Promise.race([Promise.all(["400 1rem Roboto","500 1rem Roboto","500 1rem tgico"].map(e=>document.fonts.load(e))),new Promise(e=>setTimeout(e,1e3))]):Promise.resolve())}n.d(t,"a",(function(){return i}))},function(e,t,n){"use strict";const o=-1!==navigator.userAgent.search(/OS X|iPhone|iPad|iOS/i);t.a=o},function(e,t,n){"use strict";n.r(t);var o=n(4),i=n(5),a=n(2),r=n(3),c=n(1),s=n(6),u=n(7),d=n(0),l=(n(9),n(10),n(11),function(e,t,n,o){return new(n||(n=Promise))((function(i,a){function r(e){try{s(o.next(e))}catch(e){a(e)}}function c(e){try{s(o.throw(e))}catch(e){a(e)}}function s(e){var t;e.done?i(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(r,c)}s((o=o.apply(e,t||[])).next())}))});document.addEventListener("DOMContentLoaded",()=>l(void 0,void 0,void 0,(function*(){Element.prototype.toggleAttribute||(Element.prototype.toggleAttribute=function(e,t){return void 0!==t&&(t=!!t),this.hasAttribute(e)?!!t||(this.removeAttribute(e),!1):!1!==t&&(this.setAttribute(e,""),!0)});const e=window.visualViewport||window;let t,l=!1,f=!1;const m=()=>{const n=.01*(l&&!g.default.isOverlayActive?e.height||e.innerHeight:window.innerHeight);t!==n&&(t<n&&!f&&Object(i.a)(),t=n,document.documentElement.style.setProperty("--vh",n+"px"))};window.addEventListener("resize",m),m();const h=new Proxy(Worker,{construct:(e,t)=>new e(t[0]+location.search)});Worker=h;const[b,p,v,g,y,P]=yield Promise.all([n.e(24).then(n.bind(null,25)),n.e(25).then(n.bind(null,15)),Promise.resolve().then(n.bind(null,0)),n.e(22).then(n.bind(null,13)),Promise.all([n.e(0),n.e(26)]).then(n.bind(null,14)),Promise.all([n.e(0),n.e(1)]).then(n.bind(null,12))]),w=()=>{l=1===E&&v.isSafari&&p.isTouchSupported&&!g.default.isOverlayActive,m(),e!==window&&(l?(window.removeEventListener("resize",m),e.addEventListener("resize",m)):(e.removeEventListener("resize",m),window.addEventListener("resize",m)))};let E;if(g.default.addEventListener("im_tab_change",e=>{const t=void 0!==E;E=e,(t||1===E)&&w()}),g.default.addEventListener("overlay_toggle",()=>{w()}),v.isFirefox&&!u.a&&document.addEventListener("dragstart",e=>{const t=e.target;if("IMG"===t.tagName&&t.classList.contains("emoji"))return Object(a.a)(e),!1}),document.addEventListener("dragstart",e=>{var t;if("IMG"===(null===(t=e.target)||void 0===t?void 0:t.tagName))return e.preventDefault(),!1}),v.isApple){if(v.isSafari&&(document.documentElement.classList.add("is-safari"),v.isMobile&&p.isTouchSupported)){let e="clientY",t=0;const n={capture:!0,passive:!1},o=n=>{const o=n.touches[0],i=Object(r.a)(o.target,"scrollable-y");if(i){const a=o[e],r=t-a,c=i.scrollTop,s=i.scrollHeight,u=i.clientHeight,d=c?Math.round(c+i.clientHeight+r):c+r;(s===u||d>=s||d<=0)&&n.preventDefault()}else n.preventDefault()};document.addEventListener("focusin",i=>{l&&(Object(c.a)(i.target),document.addEventListener("touchmove",o,n),document.addEventListener("touchstart",n=>{if(n.touches.length>1)return;const o=n.touches[0];t=o[e]}))}),document.addEventListener("focusout",()=>{document.removeEventListener("touchmove",o,n)}),document.addEventListener("visibilitychange",()=>{l&&document.activeElement&&document.activeElement.blur&&Object(c.a)(document.activeElement)})}document.documentElement.classList.add("is-mac","emoji-supported"),v.isAppleMobile&&document.documentElement.classList.add("is-ios")}else v.isAndroid&&(document.documentElement.classList.add("is-android"),document.addEventListener("focusin",()=>{f=!0},{passive:!0}),document.addEventListener("focusout",()=>{f=!1},{passive:!0}));p.isTouchSupported?document.documentElement.classList.add("is-touch"):document.documentElement.classList.add("no-touch");const S=performance.now(),L=P.default.getCacheLangPack(),[O,A]=yield Promise.all([y.default.getState(),L]);function M(e,t){e.style.opacity="0",t.then(()=>{window.requestAnimationFrame(()=>{e.style.opacity=""})})}g.default.setThemeListener(),A.appVersion!==o.a.langPackVersion&&P.default.getLangPack(A.lang_code),console.log("got state, time:",performance.now()-S);const k=O.authState;if("authStateSignedIn"!==k._){console.log("Will mount auth page:",k._,Date.now()/1e3);const e=document.getElementById("auth-pages");let t,o;if(e){t=e.querySelector(".scrollable"),p.isTouchSupported&&!d.isMobileSafari||t.classList.add("no-scrollbar"),t.style.opacity="0";const n=document.createElement("div");n.classList.add("auth-placeholder"),t.prepend(n),t.append(n.cloneNode())}try{yield Promise.all([Promise.all([n.e(0),n.e(1)]).then(n.bind(null,24)),Promise.all([n.e(0),n.e(1)]).then(n.bind(null,23))]).then(([e,t])=>{e.default.setAuthorized(!1),t.default.forceUnsubscribe()})}catch(e){}switch(k._){case"authStateSignIn":o=(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(3),n.e(14)]).then(n.bind(null,18))).default.mount();break;case"authStateSignQr":o=(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(3),n.e(21)]).then(n.bind(null,20))).default.mount();break;case"authStateAuthCode":o=(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(3),n.e(13)]).then(n.bind(null,21))).default.mount(k.sentCode);break;case"authStatePassword":o=(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(3),n.e(12)]).then(n.bind(null,19))).default.mount();break;case"authStateSignUp":o=(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(3),n.e(15)]).then(n.bind(null,22))).default.mount(k.authCode)}if(t){o&&(yield o);M(t,"fonts"in document?Promise.race([new Promise(e=>setTimeout(e,1e3)),document.fonts.ready]):Promise.resolve())}}else console.log("Will mount IM page:",Date.now()/1e3),M(document.getElementById("main-columns"),Object(s.a)()),(yield Promise.all([n.e(0),n.e(1),n.e(2),n.e(28)]).then(n.bind(null,17))).default.mount();const x=(yield n.e(18).then(n.bind(null,16))).ripple;Array.from(document.getElementsByClassName("rp")).forEach(e=>x(e))})))},function(e,t,n){},function(e,t,n){},function(e,t,n){}]);
//# sourceMappingURL=main.ea656b83c4daefd36966.bundle.js.map