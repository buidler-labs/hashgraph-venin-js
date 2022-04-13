"use strict";(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[359],{3905:(e,t,a)=>{a.d(t,{Zo:()=>p,kt:()=>m});var r=a(67294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},i=Object.keys(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)a=i[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var s=r.createContext({}),d=function(e){var t=r.useContext(s),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},p=function(e){var t=d(e.components);return r.createElement(s.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},c=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,i=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),c=d(a),m=n,h=c["".concat(s,".").concat(m)]||c[m]||u[m]||i;return a?r.createElement(h,o(o({ref:t},p),{},{components:a})):r.createElement(h,o({ref:t},p))}));function m(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=a.length,o=new Array(i);o[0]=c;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:n,o[1]=l;for(var d=2;d<i;d++)o[d]=a[d];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}c.displayName="MDXCreateElement"},65362:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>m,frontMatter:()=>l,metadata:()=>d,toc:()=>u});var r=a(87462),n=a(63366),i=(a(67294),a(3905)),o=["components"],l={id:"changelog",title:"Changelog"},s=void 0,d={unversionedId:"markdown/changelog",id:"markdown/changelog",title:"Changelog",description:"0.7.4",source:"@site/markdown/changelog.md",sourceDirName:"markdown",slug:"/markdown/changelog",permalink:"/markdown/changelog",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/lib.docs/markdown/changelog.md",tags:[],version:"current",lastUpdatedBy:"Victor ADASCALITEI",lastUpdatedAt:1649767652,formattedLastUpdatedAt:"4/12/2022",frontMatter:{id:"changelog",title:"Changelog"},sidebar:"docs",previous:{title:"Topic",permalink:"/markdown/guides/entities/topic"}},p={},u=[{value:"0.7.4",id:"074",level:2},{value:"0.7.3",id:"073",level:2},{value:"0.6.10",id:"0610",level:2}],c={toc:u};function m(e){var t=e.components,a=(0,n.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"074"},"0.7.4"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Supports ",(0,i.kt)("inlineCode",{parentName:"li"},"@hashgraph/sdk@2.11.3")),(0,i.kt)("li",{parentName:"ul"},"Support for ",(0,i.kt)("a",{parentName:"li",href:"https://hips.hedera.com/hip/hip-338"},"HIP-338 wallets"),". See ",(0,i.kt)("a",{parentName:"li",href:"/markdown/guides/wallet"},"the wallets guides section")," for more info."),(0,i.kt)("li",{parentName:"ul"},"Added the ",(0,i.kt)("a",{parentName:"li",href:"/markdown/guides/bundling"},"bundling guide")," that makes use of a custom defined ",(0,i.kt)("inlineCode",{parentName:"li"},"@buidlerlabs/hedera-strato-js/rollup-plugin")," export"),(0,i.kt)("li",{parentName:"ul"},"Added ",(0,i.kt)("inlineCode",{parentName:"li"},"LiveEntity.deleteEntity")," and ",(0,i.kt)("inlineCode",{parentName:"li"},"LiveEntity.updateEntity")," operations to ",(0,i.kt)("inlineCode",{parentName:"li"},"delete")," and/or ",(0,i.kt)("inlineCode",{parentName:"li"},"update")," self-entity"),(0,i.kt)("li",{parentName:"ul"},"Added ",(0,i.kt)("a",{parentName:"li",href:"/markdown/guides/entities/topic"},(0,i.kt)("inlineCode",{parentName:"a"},"Topic"),"/",(0,i.kt)("inlineCode",{parentName:"a"},"LiveTopic"))," and ",(0,i.kt)("a",{parentName:"li",href:"/markdown/guides/entities/file"},(0,i.kt)("inlineCode",{parentName:"a"},"File"),"/",(0,i.kt)("inlineCode",{parentName:"a"},"LiveFile"))," pairs"),(0,i.kt)("li",{parentName:"ul"},"Implemented ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/34"},(0,i.kt)("inlineCode",{parentName:"a"},"LiveAddress.equals(AccountId)")," functionality")),(0,i.kt)("li",{parentName:"ul"},"Implemented ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/49"},(0,i.kt)("inlineCode",{parentName:"a"},"StratoAddress.toLiveAccount()"))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/40"},"Auto arrayfying hex string")," if ",(0,i.kt)("inlineCode",{parentName:"li"},"bytes32")," arguments are expected by the ",(0,i.kt)("inlineCode",{parentName:"li"},"LiveContract")," call"),(0,i.kt)("li",{parentName:"ul"},"\ud83d\udca5 ",(0,i.kt)("em",{parentName:"li"},"Potentially braking change!")," Added ",(0,i.kt)("a",{parentName:"li",href:"/markdown/configuration"},(0,i.kt)("inlineCode",{parentName:"a"},"HEDERAS_DEFAULT_CONTRACT_REQUESTS_RETURN_ONLY_RECEIPTS")," config")," option to have ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/48"},"finer cost-control over contract-requests"),". Set it to ",(0,i.kt)("inlineCode",{parentName:"li"},"false")," to revert to v0.7.3 behavior. This only affects state-mutating contract-calls. Non-mutating (query) calls are not affected by this parameter."),(0,i.kt)("li",{parentName:"ul"},"Fixed ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/50"},"recursive loading of ABIs into ",(0,i.kt)("inlineCode",{parentName:"a"},"ContractRegistry"),"s")," at bundling time"),(0,i.kt)("li",{parentName:"ul"},"Allow ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/issues/54"},(0,i.kt)("inlineCode",{parentName:"a"},"ContractRegistry"),"s to be created from abstract")," solidity contracts"),(0,i.kt)("li",{parentName:"ul"},"A lot of tweaks on docs, visual and others"),(0,i.kt)("li",{parentName:"ul"},"Added ",(0,i.kt)("a",{parentName:"li",href:"https://github.com/buidler-labs/hedera-strato-js/actions"},"github actions workflows")," for manual/auto testing")),(0,i.kt)("h2",{id:"073"},"0.7.3"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Supports ",(0,i.kt)("inlineCode",{parentName:"li"},"@hashgraph/sdk@2.7.0")),(0,i.kt)("li",{parentName:"ul"},"Added support for creating ",(0,i.kt)("inlineCode",{parentName:"li"},"Token"),"s"),(0,i.kt)("li",{parentName:"ul"},"Added support for creating ",(0,i.kt)("inlineCode",{parentName:"li"},"Account"),"s"),(0,i.kt)("li",{parentName:"ul"},"Added more config options with sensible defaults to control behavior and expenses"),(0,i.kt)("li",{parentName:"ul"},"Allowed constructors to generate logs"),(0,i.kt)("li",{parentName:"ul"},"Started adding a ",(0,i.kt)("inlineCode",{parentName:"li"},"Controller")," mechanism for sessions in preparation to support integration with wallets")),(0,i.kt)("h2",{id:"0610"},"0.6.10"),(0,i.kt)("p",null,"Initial release"))}m.isMDXComponent=!0}}]);