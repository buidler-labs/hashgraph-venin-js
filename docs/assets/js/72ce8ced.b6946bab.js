"use strict";(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[274],{3905:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>u});var a=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},d=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),m=p(n),u=i,h=m["".concat(s,".").concat(u)]||m[u]||c[u]||o;return n?a.createElement(h,r(r({ref:t},d),{},{components:n})):a.createElement(h,r({ref:t},d))}));function u(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,r=new Array(o);r[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,r[1]=l;for(var p=2;p<o;p++)r[p]=n[p];return a.createElement.apply(null,r)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"},22063:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>s,default:()=>u,frontMatter:()=>l,metadata:()=>p,toc:()=>c});var a=n(87462),i=n(63366),o=(n(67294),n(3905)),r=["components"],l={id:"bundling",title:"Bundling"},s=void 0,p={unversionedId:"markdown/guides/bundling",id:"markdown/guides/bundling",title:"Bundling",description:"Currently we offer support for bundling strato via rollup with support for other bundlers being scheduled, yet not committed.",source:"@site/markdown/guides/bundling.md",sourceDirName:"markdown/guides",slug:"/markdown/guides/bundling",permalink:"/markdown/guides/bundling",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/lib.docs/markdown/guides/bundling.md",tags:[],version:"current",lastUpdatedBy:"Victor ADASCALITEI",lastUpdatedAt:1649693674,formattedLastUpdatedAt:"4/11/2022",frontMatter:{id:"bundling",title:"Bundling"},sidebar:"docs",previous:{title:"Playground",permalink:"/markdown/playground"},next:{title:"Wallets",permalink:"/markdown/guides/wallet"}},d={},c=[{value:"General considerations",id:"general-considerations",level:3},{value:"Rollup",id:"rollup",level:2}],m={toc:c};function u(e){var t=e.components,n=(0,i.Z)(e,r);return(0,o.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"Currently we offer support for bundling strato via ",(0,o.kt)("a",{parentName:"p",href:"https://rollupjs.org/"},"rollup")," with support for other bundlers ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hedera-strato-js/issues/26"},"being scheduled"),", yet not committed."),(0,o.kt)("h3",{id:"general-considerations"},"General considerations"),(0,o.kt)("p",null,"Strato is delivered in both ",(0,o.kt)("inlineCode",{parentName:"p"},"es-module")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"common-js")," formats. The challenge with bundling the library boils down to whether or not you wish to use the ",(0,o.kt)("inlineCode",{parentName:"p"},"SolidityCompiler")," function in-browser. If you wish in-browser compilation, a web-worker is provided which fetches the appropriate solidity-compiler binary before carring out the compilation itself via calling any of the ",(0,o.kt)("inlineCode",{parentName:"p"},"Contract.newFrom"),"/",(0,o.kt)("inlineCode",{parentName:"p"},"Contract.allFrom")," family of functions. "),(0,o.kt)("p",null,"Compiling ",(0,o.kt)("inlineCode",{parentName:"p"},"path")," variants of the same ",(0,o.kt)("inlineCode",{parentName:"p"},"Contract.newFrom"),"/",(0,o.kt)("inlineCode",{parentName:"p"},"Contract.allFrom")," family of functions is made possible via a synthetically injected ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractsInFileStorage")," class which is basically a dictionary mapping the path of each solidity file from a given folder (default ",(0,o.kt)("inlineCode",{parentName:"p"},"contracts"),") to its content. "),(0,o.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"You don't have to manually deal with ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractsInFileStorage")," in code. The bundler ties everything up for you so that, for example, if you have a file ",(0,o.kt)("inlineCode",{parentName:"p"},"a.sol")," in a ",(0,o.kt)("inlineCode",{parentName:"p"},"contracts")," folder situated in the root of your repo, ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractsInFileStorage")," would be generated holding something approximating: "),(0,o.kt)("pre",{parentName:"div"},(0,o.kt)("code",{parentName:"pre"},'export default {\n  "a.sol": <code of a.sol>,\n  ...\n}\n')),(0,o.kt)("p",{parentName:"div"},"This will, for instance, allow calling ",(0,o.kt)("inlineCode",{parentName:"p"},'Contract.newFrom({ path: "./a.sol" })'),"."))),(0,o.kt)("p",null,(0,o.kt)("inlineCode",{parentName:"p"},"ContractsInFileStorage")," is not the only class being synthetically generated. ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractRegistry")," is another one which gets injected regardless if in-browser compilation is being used or not. This one is important since it contains contract names to their ABI mappings which is needed for acquiring ",(0,o.kt)("inlineCode",{parentName:"p"},"LiveContract")," instances of already deployed ",(0,o.kt)("inlineCode",{parentName:"p"},"Contract"),"s. I'm talking here about the ",(0,o.kt)("inlineCode",{parentName:"p"},"ApiSession.getLiveContract({ id, abi })")," method call."),(0,o.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"For the same ",(0,o.kt)("inlineCode",{parentName:"p"},"a.sol")," file situated in the ",(0,o.kt)("inlineCode",{parentName:"p"},"contracts")," folder described above, if, let's say, it contains a ",(0,o.kt)("inlineCode",{parentName:"p"},"A")," contract and a ",(0,o.kt)("inlineCode",{parentName:"p"},"B")," contract inside, ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractRegistry")," will end up looking something similar to:"),(0,o.kt)("pre",{parentName:"div"},(0,o.kt)("code",{parentName:"pre"},'export default {\n  "A": <ABI code for contract A>,\n  "B": <ABI code for contract B>,\n  ...\n}\n')),(0,o.kt)("p",{parentName:"div"},"This allows calling ",(0,o.kt)("inlineCode",{parentName:"p"},"ApiSession.getLiveContract({ id, abi: ContractRegistry.A })")," to get an instance of an already deployed ",(0,o.kt)("inlineCode",{parentName:"p"},"A")," ",(0,o.kt)("inlineCode",{parentName:"p"},"LiveContract")," to interact with."),(0,o.kt)("h3",{parentName:"div",id:"what-about-nested-solidity-files"},"What about nested solidity files?"),(0,o.kt)("p",{parentName:"div"},"What if you have a ",(0,o.kt)("inlineCode",{parentName:"p"},"A")," contract defined in ",(0,o.kt)("inlineCode",{parentName:"p"},"a.sol")," which is situated in a subfolder 'others",(0,o.kt)("inlineCode",{parentName:"p"},"in"),"contracts",(0,o.kt)("inlineCode",{parentName:"p"},"? So basically, contract "),"A",(0,o.kt)("inlineCode",{parentName:"p"},"is located somewhere at"),"contracts/others/a.sol`. How does this work?"),(0,o.kt)("p",{parentName:"div"},"We've got you covered! "),(0,o.kt)("p",{parentName:"div"},"In this scenario, ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractRegistry")," will be generated to something approximating:"),(0,o.kt)("pre",{parentName:"div"},(0,o.kt)("code",{parentName:"pre"},'export default {\n  "others/A": <ABI code for contract A>,\n  ...\n}\n')),(0,o.kt)("p",{parentName:"div"},"which will allow you to reference its ABI via ",(0,o.kt)("inlineCode",{parentName:"p"},'ContractRegistry["others/A"]'),"."))),(0,o.kt)("p",null,"Besides synthetically generated classes, ",(0,o.kt)("inlineCode",{parentName:"p"},"process.env")," also needs to be unpacked and injected to make the bundling possible."),(0,o.kt)("h2",{id:"rollup"},"Rollup"),(0,o.kt)("div",{className:"admonition admonition-caution alert alert--warning"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"caution")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"Depending on how much interest is for other bundlers to be supported (see ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hedera-strato-js/issues/26"},"#26"),"), this plugin might be extracted into its own package (see ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hedera-strato-js/issues/25"},"#25"),"). "),(0,o.kt)("p",{parentName:"div"},"When this happens, we will try to maintain backwards compatibility as much as possible so that, in theory, only ",(0,o.kt)("inlineCode",{parentName:"p"},"import")," ",(0,o.kt)("em",{parentName:"p"},"specifiers")," will require updating."))),(0,o.kt)("p",null,"If your using ",(0,o.kt)("a",{parentName:"p",href:"https://rollupjs.org/"},"rollup")," to bundle your app, we have made available a plugin to take care of all the considerations described above. It's being available at ",(0,o.kt)("inlineCode",{parentName:"p"},"@buidlerlabs/hedera-strato-js/rollup-plugin")," and you can immediately dive into a working demo ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hsj-rollup-demo"},"here"),"."),(0,o.kt)("p",null,"Importing the ",(0,o.kt)("inlineCode",{parentName:"p"},"rollup-plugin")," gives access to a default-exported function that generates a rollup-behaved object."),(0,o.kt)("p",null,"Currently, it accepts the following options object:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},"{\n  contracts?: {\n    path?: string,\n    recurse?: boolean,\n  },\n  environment?: NodeJS.ProcessEnv,\n  includeCompiler?: boolean,\n  sourceMap?: boolean, \n}\n")),(0,o.kt)("p",null,"where:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"contracts.path")," is the path of the folder holding the contracts to load into ",(0,o.kt)("inlineCode",{parentName:"li"},"ContractRegistry")," and possibly ",(0,o.kt)("inlineCode",{parentName:"li"},"ContractsInFileStorage")," (if ",(0,o.kt)("inlineCode",{parentName:"li"},"includeCompiler")," is ",(0,o.kt)("inlineCode",{parentName:"li"},"true"),"). Defaults to ",(0,o.kt)("inlineCode",{parentName:"li"},"contracts")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"contracts.recurse")," controls the behavior of navigating the ",(0,o.kt)("inlineCode",{parentName:"li"},"contracts.path")," files. If set to ",(0,o.kt)("inlineCode",{parentName:"li"},"true"),", it uses recursion to load everything from ",(0,o.kt)("inlineCode",{parentName:"li"},"contracts.path"),". ",(0,o.kt)("inlineCode",{parentName:"li"},"false")," only loads the first level of files. Defaults to ",(0,o.kt)("inlineCode",{parentName:"li"},"false")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"environment")," is the environment object that gets unpacked and injected in the library. It defaults to ",(0,o.kt)("inlineCode",{parentName:"li"},"process.env")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"includeCompiler")," allows for in-browser compilation when set to ",(0,o.kt)("inlineCode",{parentName:"li"},"true")," and throws an error when trying to compile if set to ",(0,o.kt)("inlineCode",{parentName:"li"},"false"),". Defaults to ",(0,o.kt)("inlineCode",{parentName:"li"},"false")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"sourceMap")," controls source-map generation. ",(0,o.kt)("inlineCode",{parentName:"li"},"true")," generates the source-maps, ",(0,o.kt)("inlineCode",{parentName:"li"},"false")," does not. Defaults to ",(0,o.kt)("inlineCode",{parentName:"li"},"false"))),(0,o.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"info")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"If you're changing ",(0,o.kt)("inlineCode",{parentName:"p"},"contracts.path")," to something non-default, be sure to also change ",(0,o.kt)("a",{parentName:"p",href:"/markdown/configuration"},"the ",(0,o.kt)("inlineCode",{parentName:"a"},"HEDERAS_CONTRACTS_RELATIVE_PATH")," config")," value so that Strato itself knows how to locate and compile your sources and have the synthetically defined classes (eg. ",(0,o.kt)("inlineCode",{parentName:"p"},"ContractRegistry"),") generated."))),(0,o.kt)("p",null,"For guidance, see the ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hsj-rollup-demo/blob/main/rollup.config.js"},"demo repo rollup.config.js")," which makes use of this rollup plugin with in-browser compilation turned on."))}u.isMDXComponent=!0}}]);