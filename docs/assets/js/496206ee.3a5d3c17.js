"use strict";(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[289],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>y});var r=n(67294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var l=r.createContext({}),u=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=u(e.components);return r.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),d=u(n),y=o,f=d["".concat(l,".").concat(y)]||d[y]||p[y]||a;return n?r.createElement(f,i(i({ref:t},s),{},{components:n})):r.createElement(f,i({ref:t},s))}));function y(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var c={};for(var l in t)hasOwnProperty.call(t,l)&&(c[l]=t[l]);c.originalType=e,c.mdxType="string"==typeof e?e:o,i[1]=c;for(var u=2;u<a;u++)i[u]=n[u];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},91262:(e,t,n)=>{n.d(t,{Z:()=>a});var r=n(67294),o=n(72389);const a=function(e){var t=e.children,n=e.fallback;return(0,o.Z)()?r.createElement(r.Fragment,null,t()):n||null}},62614:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>l,contentTitle:()=>u,metadata:()=>s,toc:()=>p,OperatorId:()=>d,OperatorNetwork:()=>y,default:()=>m});var r=n(87462),o=n(63366),a=(n(67294),n(3905)),i=n(91262),c=["components"],l={id:"playground",title:"Playground"},u=void 0,s={unversionedId:"markdown/playground",id:"markdown/playground",title:"Playground",description:"export const OperatorId = () => (",source:"@site/markdown/playground.md",sourceDirName:"markdown",slug:"/markdown/playground",permalink:"/markdown/playground",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/markdown/playground.md",tags:[],version:"current",frontMatter:{id:"playground",title:"Playground"},sidebar:"docs",previous:{title:"Token",permalink:"/markdown/guides/entities/token"}},p=[],d=function(){return(0,a.kt)(i.Z,{fallback:(0,a.kt)("code",null,"unknown"),mdxType:"BrowserOnly"},(function(){return"testnet"===window.StratoOperator.network?(0,a.kt)("a",{href:"https://testnet.dragonglass.me/hedera/accounts/"+window.StratoOperator.accountId},(0,a.kt)("code",null,window.StratoOperator.accountId)):(0,a.kt)("code",null,window.StratoOperator.accountId)}))},y=function(){return(0,a.kt)(i.Z,{fallback:(0,a.kt)("code",null,"unknown"),mdxType:"BrowserOnly"},(function(){return(0,a.kt)("code",null," ",window.StratoOperator.network," ")}))},f={toc:p,OperatorId:d,OperatorNetwork:y};function m(e){var t=e.components,n=(0,o.Z)(e,c);return(0,a.kt)("wrapper",(0,r.Z)({},f,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"Want to give it a in-browser spin, now you can. Type in your code and press the ",(0,a.kt)("inlineCode",{parentName:"p"},"Run")," button and you should be set to go."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-js",metastring:"live=true containerKey=live_from_code",live:"true",containerKey:"live_from_code"},"const code = `\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.9;\n\n// TODO: add your solidity contract code here\n`;\nconst { session } = await ApiSession.default();\nconst contract = await Contract.newFrom({ code });\nconst liveContract = await hapiSession.upload(contract);\n\n// TODO: stuff with your contract or switch to a different entity such as a token or Json ...\n")),(0,a.kt)("details",null,(0,a.kt)("summary",null,"A note on the account paying for these transactions"),(0,a.kt)("p",null,"Please be considerate with the transactions that you run as to also give others the oportunity to play and learn. By default, the session will be operated by ",(0,a.kt)(d,{mdxType:"OperatorId"})," on the ",(0,a.kt)(y,{mdxType:"OperatorNetwork"})," network. We strive to keep a working balance on it, but if we can't keep up with the usage, you might experience failed transactions due to insuficient funds. If this happens you can also\nuse your own hedera account to pay for them. ",(0,a.kt)("a",{parentName:"p",href:"https://portal.hedera.com/"},"Hedera's Portal")," is the best and easiest way to start out in this scenario."),(0,a.kt)("p",null,"Once available, you can create a session using your account like so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},"const { session } = await ApiSession.default({\n  client: {\n    operatorId: <Your operator account id>\n    operatorKey: <Your operator private key>\n  },\n  network: {\n    name: testnet / previewnet / customnet\n  }\n});\n")),(0,a.kt)("p",null,"To find out more configuration options, head over to our ",(0,a.kt)("a",{parentName:"p",href:"/markdown/configuration"},"configuration page"),".")))}m.isMDXComponent=!0}}]);