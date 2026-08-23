import{c as s}from"./createLucideIcon-DdXkGE6q.js";import{K as p,r as c,j as r}from"./app-B93f9whJ.js";import{X as k}from"./sheet-Hm3JNSyB.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],b=s("CircleCheck",x);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]],h=s("CircleX",g);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],_=s("Package",u);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],f=s("TriangleAlert",y),N={success:{container:"border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",icon:b},error:{container:"border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100",icon:h},warning:{container:"border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",icon:f}};function z(){const{flash:a}=p().props,[n,t]=c.useState([]);c.useEffect(()=>{t([])},[a.success,a.error,a.warning]);const o=["success","error","warning"].map(e=>({tone:e,message:a[e]})).filter(e=>!!e.message&&!n.includes(e.tone));return o.length===0?null:r.jsx("div",{className:"flex flex-col gap-2 pt-4",role:"status","aria-live":"polite",children:o.map(({tone:e,message:i})=>{const{container:l,icon:d}=N[e];return r.jsxs("div",{className:`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${l}`,children:[r.jsx(d,{className:"mt-0.5 size-4 shrink-0"}),r.jsx("p",{className:"flex-1",children:i}),r.jsx("button",{type:"button",onClick:()=>t(m=>[...m,e]),className:"rounded p-0.5 opacity-60 transition-opacity hover:opacity-100","aria-label":"Dismiss",children:r.jsx(k,{className:"size-4"})})]},e)})})}export{b as C,z as F,_ as P};
