var serviceWorkerOption = {"assets":[]};
        
        !function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);const r=navigator?navigator.userAgent:null,o=(navigator.userAgent.search(/OS X|iPhone|iPad|iOS/i),navigator.userAgent.toLowerCase().indexOf("android"),/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor),"undefined"!=typeof window?window:self),i=((/iPad|iPhone|iPod/.test(navigator.platform)||"MacIntel"===navigator.platform&&navigator.maxTouchPoints>1)&&o.MSStream,!!("safari"in o)||!(!r||!(/\b(iPad|iPhone|iPod)\b/.test(r)||r.match("Safari")&&!r.match("Chrome"))));navigator.userAgent.toLowerCase().indexOf("firefox"),navigator.userAgent.search(/iOS|iPhone OS|Android|BlackBerry|BB10|Series ?[64]0|J2ME|MIDP|opera mini|opera mobi|mobi.+Gecko|Windows Phone/i);const s={test:location.search.indexOf("test=1")>0,debug:location.search.indexOf("debug=1")>0,http:!1,ssl:!0,multipleConnections:!0,asServiceWorker:!1}.debug;"undefined"!=typeof window?window:self;var a,c=s;!function(e){e[e.None=0]="None",e[e.Error=1]="Error",e[e.Warn=2]="Warn",e[e.Log=4]="Log",e[e.Debug=8]="Debug"}(a||(a={}));const l=[a.None,a.Error,a.Warn,a.Log,a.Debug],u=Date.now();function f(){return"["+((Date.now()-u)/1e3).toFixed(3)+"]"}const d="undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope,g="undefined"!=typeof ServiceWorkerGlobalScope&&self instanceof ServiceWorkerGlobalScope,p=(e,...t)=>{self.clients.matchAll({includeUncontrolled:!1,type:"window"}).then(n=>{n.length&&n.slice(e?0:-1).forEach(e=>{e.postMessage(...t)})})},h=(...e)=>{self.postMessage(...e)},y=()=>{},b=g?p.bind(null,!1):d?h:y;g&&p.bind(null,!0);var v=function(e,t,n,r){return new(n||(n=Promise))((function(o,i){function s(e){try{c(r.next(e))}catch(e){i(e)}}function a(e){try{c(r.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}c((r=r.apply(e,t||[])).next())}))};const m=function(e,t=a.Log|a.Warn|a.Error){function n(...n){return t&a.Log&&console.log(f(),e,...n)}return c||(t=a.Error),n.warn=function(...n){return t&a.Warn&&console.warn(f(),e,...n)},n.info=function(...n){return t&a.Log&&console.info(f(),e,...n)},n.error=function(...n){return t&a.Error&&console.error(f(),e,...n)},n.trace=function(...n){return t&a.Log&&console.trace(f(),e,...n)},n.debug=function(...n){return t&a.Debug&&console.debug(f(),e,...n)},n.setPrefix=function(t){e="["+t+"]:"},n.setPrefix(e),n.setLevel=function(e){t=l.slice(0,e+1).reduce((e,t)=>e|t,0)},n}("SW",a.Error|a.Debug|a.Log|a.Warn),w=self,P={};w.addEventListener("message",e=>{const t=e.data,n=P[t.id];t.error?n.reject(t.error):n.resolve(t.payload),delete P[t.id]});let S=0;const x=e=>{if(0===e.request.url.indexOf(location.origin+"/")&&e.request.url.match(/\.(js|css|jpe?g|json|wasm|png|mp3|svg|tgs|ico|woff2?|ttf|webmanifest?)(?:\?.*)?$/))return e.respondWith(function(e){return v(this,void 0,void 0,(function*(){try{const t=yield w.caches.open("cachedAssets"),n=yield t.match(e.request);if(n)return n;const r=yield fetch(e.request);return t.put(e.request,r.clone()),r}catch(t){return fetch(e.request)}}))}(e));try{const[,n,r,o]=/http[:s]+\/\/.*?(\/(.*?)(?:$|\/(.*)$))/.exec(e.request.url)||[];switch(r){case"stream":{const n=function(e){if(!e)return[0,0];const[,t]=e.split("="),n=t.split(", "),[r,o]=n[0].split("-");return[+r,+o||0]}(e.request.headers.get("Range"));let[r,s]=n;const a=JSON.parse(decodeURIComponent(o)),c=a.size>78643200?O:j;e.respondWith(Promise.race([(t=45e3,new Promise(e=>{setTimeout(()=>{e(new Response("",{status:408,statusText:"Request timed out."}))},t)})),new Promise((e,t)=>{const o=function(e,t,n){if(0===e[0]&&1===e[1])return new Response(new Uint8Array(2).buffer,{status:206,statusText:"Partial Content",headers:{"Accept-Ranges":"bytes","Content-Range":"bytes 0-1/"+(n||"*"),"Content-Length":"2","Content-Type":t||"video/mp4"}});return null}(n,a.mimeType,a.size);if(o)return e(o);const l=s&&s<c?function(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.log(2)))}(s-r+1):c,u=function(e,t=2048){return e-e%t}(r,l),f={type:"requestFilePart",id:S++,payload:[a.dcId,a.location,u,l]};(P[f.id]=function(){let e={isFulfilled:!1,isRejected:!1,notify:()=>{},notifyAll:(...t)=>{e.lastNotify=t,e.listeners.forEach(e=>e(...t))},lastNotify:void 0,listeners:[],addNotifyListener:t=>{e.lastNotify&&t(...e.lastNotify),e.listeners.push(t)}},t=new Promise((n,r)=>{e.resolve=e=>{t.isFulfilled||(t.isFulfilled=!0,n(e))},e.reject=(...e)=>{t.isRejected||(t.isRejected=!0,r(...e))}});return t.finally(()=>{t.notify=null,t.listeners.length=0,t.lastNotify=null,t.cancel&&(t.cancel=()=>{})}),Object.assign(t,e),t}()).then(t=>{let n=t.bytes;const o={"Accept-Ranges":"bytes","Content-Range":`bytes ${u}-${u+n.byteLength-1}/${a.size||"*"}`,"Content-Length":""+n.byteLength};a.mimeType&&(o["Content-Type"]=a.mimeType),i&&(n=n.slice(r-u,s-u+1),o["Content-Range"]=`bytes ${r}-${r+n.byteLength-1}/${a.size||"*"}`,o["Content-Length"]=""+n.byteLength),e(new Response(n,{status:206,statusText:"Partial Content",headers:o}))}).catch(e=>{}),b(f)})]));break}}}catch(t){e.respondWith(new Response("",{status:500,statusText:"Internal Server Error"}))}var t},L=()=>{w.onfetch=x};w.addEventListener("install",e=>{m("installing"),e.waitUntil(w.skipWaiting())}),w.addEventListener("activate",e=>{m("activating",w),e.waitUntil(w.caches.delete("cachedAssets")),e.waitUntil(w.clients.claim())}),w.onerror=e=>{m.error("error:",e)},w.onunhandledrejection=e=>{m.error("onunhandledrejection:",e)},w.onoffline=w.ononline=L,L();const j=524288,O=1048576}]);
//# sourceMappingURL=sw.js.map