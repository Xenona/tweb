(this.webpackJsonp=this.webpackJsonp||[]).push([[24],{16:function(e,t,s){"use strict";s.r(t),s.d(t,"STATE_INIT",(function(){return u})),s.d(t,"AppStateManager",(function(){return S}));var a=s(33),i=s(10),n=s(46),o=s(24),h=s(19),r=s(3),d=s(8),g=s(62),l=s(0);const c=r.a.version,u={allDialogsLoaded:{},pinnedOrders:{},contactsList:[],updates:{},filters:{},maxSeenMsgId:0,stateCreatedTime:Date.now(),recentEmoji:[],topPeers:[],recentSearch:[],version:c,authState:{_:l.isMobile?"authStateSignIn":"authStateSignQr"},hiddenPinnedMessages:{},settings:{messagesTextSize:16,sendShortcut:"enter",animationsEnabled:!0,autoDownload:{contacts:!0,private:!0,groups:!0,channels:!0},autoPlay:{gifs:!0,videos:!0},stickers:{suggest:!0,loop:!0},themes:[{name:"day",background:{type:"image",blur:!1,slug:"ByxGo2lrMFAIAAAAmkJxZabh8eM",highlightningColor:"hsla(85.5319, 36.9171%, 40.402%, 0.4)"}},{name:"night",background:{type:"color",blur:!1,color:"#0f0f0f",highlightningColor:"hsla(0, 0%, 3.82353%, 0.4)"}}],theme:"system",notifications:{sound:!1}},keepSigned:!0},p=Object.keys(u),m=["dialogs","allDialogsLoaded","messages","contactsList","stateCreatedTime","updates","maxSeenMsgId","filters","topPeers","pinnedOrders"];class S extends a.a{constructor(){super(),this.log=Object(o.b)("STATE"),this.neededPeers=new Map,this.singlePeerMap=new Map,this.storages={users:new g.a({storeName:"users"}),chats:new g.a({storeName:"chats"}),dialogs:new g.a({storeName:"dialogs"})},this.storagesResults={},this.storage=n.a,this.loadSavedState()}loadSavedState(){return this.loaded||(console.time("load state"),this.loaded=new Promise(e=>{const t=Object.keys(this.storages),s=t.map(e=>this.storages[e].getAll()),a=p.concat("user_auth").map(e=>n.a.get(e)).concat(s);Promise.all(a).then(s=>{let a=this.state={};for(let e=0,t=p.length;e<t;++e){const t=p[e],i=s[e];void 0!==i?a[t]=i:this.pushToState(t,Object(h.a)(u[t]))}s.splice(0,p.length);const n=s.shift();n&&(a.authState={_:"authStateSignedIn"},i.default.broadcast("user_auth","number"!=typeof n?n.id:n));for(let e=0,a=t.length;e<a;++e)this.storagesResults[t[e]]=s[e];s.splice(0,t.length);const o=Date.now();if(a.stateCreatedTime+864e5<o&&(d.b&&this.log("will refresh state",a.stateCreatedTime,o),m.forEach(e=>{this.pushToState(e,Object(h.a)(u[e]));const t=this.storagesResults[e];t&&t.length&&(t.length=0)})),!a.settings.hasOwnProperty("theme")&&a.settings.hasOwnProperty("nightTheme")&&(a.settings.theme=a.settings.nightTheme?"night":"day",this.pushToState("settings",a.settings)),!a.settings.hasOwnProperty("themes")&&a.settings.background){a.settings.themes=Object(h.a)(u.settings.themes);const e=a.settings.themes.find(e=>e.name===a.settings.theme);e&&(e.background=a.settings.background,this.pushToState("settings",a.settings))}Object(h.k)(u,a,e=>{this.pushToState(e,a[e])}),a.version!==c&&this.pushToState("version",c),i.default.settings=a.settings,d.b&&this.log("state res",a,Object(h.a)(a)),console.timeEnd("load state"),e(a)}).catch(e)})),this.loaded}getState(){return void 0===this.state?this.loadSavedState():Promise.resolve(this.state)}setByKey(e,t){Object(h.j)(this.state,e,t),i.default.broadcast("settings_updated",{key:e,value:t});const s=e.split(".")[0];this.pushToState(s,this.state[s])}pushToState(e,t,s=!0){s&&(this.state[e]=t),n.a.set({[e]:t})}requestPeer(e,t,s){let a=this.neededPeers.get(e);a&&a.has(t)||(a||(a=new Set,this.neededPeers.set(e,a)),a.add(t),this.dispatchEvent("peerNeeded",e),void 0!==s&&this.keepPeerSingle(e,t))}isPeerNeeded(e){return this.neededPeers.has(e)}keepPeerSingle(e,t){const s=this.singlePeerMap.get(t);if(s&&s!==e&&this.neededPeers.has(s)){const e=this.neededPeers.get(s);e.delete(t),e.size||(this.neededPeers.delete(s),this.dispatchEvent("peerUnneeded",s))}e&&this.singlePeerMap.set(t,e)}}S.STATE_INIT=u;const b=new S;d.a.appStateManager=b,t.default=b}}]);
//# sourceMappingURL=24.0dbf8b9d2ef3ac2613d0.chunk.js.map