"use strict";(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[593],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>k});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),p=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(d.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},u=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,d=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),u=p(n),k=r,N=u["".concat(d,".").concat(k)]||u[k]||m[k]||l;return n?a.createElement(N,i(i({ref:t},s),{},{components:n})):a.createElement(N,i({ref:t},s))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=u;var o={};for(var d in t)hasOwnProperty.call(t,d)&&(o[d]=t[d]);o.originalType=e,o.mdxType="string"==typeof e?e:r,i[1]=o;for(var p=2;p<l;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}u.displayName="MDXCreateElement"},17036:(e,t,n)=>{n.r(t),n.d(t,{frontMatter:()=>o,contentTitle:()=>d,metadata:()=>p,toc:()=>s,default:()=>u});var a=n(87462),r=n(63366),l=(n(67294),n(3905)),i=["components"],o={id:"configuration",title:"Configuring"},d=void 0,p={unversionedId:"markdown/configuration",id:"markdown/configuration",title:"Configuring",description:"Introduction",source:"@site/markdown/configuration.md",sourceDirName:"markdown",slug:"/markdown/configuration",permalink:"/markdown/configuration",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/markdown/configuration.md",tags:[],version:"current",frontMatter:{id:"configuration",title:"Configuring"},sidebar:"docs",previous:{title:"Quick Start",permalink:"/markdown/quick-start"},next:{title:"The Session",permalink:"/markdown/guides/session"}},s=[{value:"Introduction",id:"introduction",children:[],level:2},{value:"Big table o&#39; parameters",id:"big-table-o-parameters",children:[],level:2},{value:"Parameters resolution",id:"parameters-resolution",children:[],level:2}],m={toc:s};function u(e){var t=e.components,n=(0,r.Z)(e,i);return(0,l.kt)("wrapper",(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h2",{id:"introduction"},"Introduction"),(0,l.kt)("p",null,"As we ",(0,l.kt)("a",{parentName:"p",href:"/markdown/quick-start"},"previously saw"),", in order to get a hold on a precious session, one would need to call one of the 2 available static-factory methods:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default(params?, path?)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.buildFrom(StratoContext)"))),(0,l.kt)("p",null,"Both of them return a Promise which, when resolved, give back the ",(0,l.kt)("inlineCode",{parentName:"p"},"ApiSession")," instance to play with. In fact, ",(0,l.kt)("inlineCode",{parentName:"p"},"ApiSession.buildFrom(StratoContext)")," is wrapped by it's ",(0,l.kt)("inlineCode",{parentName:"p"},"default")," sibling which, we could argue, will most likey probabily end up to beeing used the most. "),(0,l.kt)("p",null,"This section describes the arguments of ",(0,l.kt)("inlineCode",{parentName:"p"},"ApiSession.default")," and how they can be used to obtain a session to operate on."),(0,l.kt)("p",null,"The ",(0,l.kt)("inlineCode",{parentName:"p"},"default")," session can be procured in one of the 4 following ways:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default()")," - run most often with no arguments at all, in which case it will try to load the parameters from the environment file present at ",(0,l.kt)("inlineCode",{parentName:"li"},"HEDERAS_ENV_PATH")," environment-variable path or, if not specified, default loading the ",(0,l.kt)("inlineCode",{parentName:"li"},".env")," from repo-root. This is basically equivalent to calling ",(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default({}, path = process.env.HEDERAS_ENV_PATH || '.env')")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default(path)")," - parse params present at ",(0,l.kt)("inlineCode",{parentName:"li"},"path")," env-file location. This ends up running ",(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default({}, path)")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default(params)")," - build the desired context unpacking a runtime representation of a json object. This is equivalent to running ",(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default(params, path = process.env.HEDERAS_ENV_PATH || '.env')")),(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"ApiSession.default(params, path)")," - creates a session-execution context (",(0,l.kt)("inlineCode",{parentName:"li"},"StratoContex"),") by ",(0,l.kt)("a",{parentName:"li",href:"#parameters-resolution"},"doing a parameter resolution")," over the provided arguments")),(0,l.kt)("p",null,"Following is a table detailing all the object-parameters along with their environmental variables counterparts which can be used to bootstrap a Strato session."),(0,l.kt)("h2",{id:"big-table-o-parameters"},"Big table o' parameters"),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Environment Variable"),(0,l.kt)("th",{parentName:"tr",align:null},"Parameter Property"),(0,l.kt)("th",{parentName:"tr",align:null},"Required"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Default"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CLIENT_CONTROLLER_DEFAULT_PRIVATE_KEY"),(0,l.kt)("td",{parentName:"tr",align:null},"client.controller.default.operatorKey"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-default-operatorkey"},(0,l.kt)("a",{parentName:"sup",href:"#fn-default-operatorkey",className:"footnote-ref"},"6"))),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"The private-key used by the operators when switching accounts on a ",(0,l.kt)("inlineCode",{parentName:"td"},"HederaClient")," using a ",(0,l.kt)("inlineCode",{parentName:"td"},"DefaultPrivateKeyClientController"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CLIENT_CONTROLLER_TYPE"),(0,l.kt)("td",{parentName:"tr",align:null},"client.controller.type"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"Hedera"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"DefaultPrivateKey")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"Hedera")),(0,l.kt)("td",{parentName:"tr",align:null},"The type of client-controller deployed. It's basically laying out the foundation of wallet-integration since a ",(0,l.kt)("inlineCode",{parentName:"td"},"controller")," can propagate either an account-change or a network change.")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CLIENT_TYPE"),(0,l.kt)("td",{parentName:"tr",align:null},"client.type"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"Hedera")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"Hedera")),(0,l.kt)("td",{parentName:"tr",align:null},"The network-client type used for the underlying session")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CONTRACTS_INCLUDED_PREFIXES"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-relative-path-prefixes"},(0,l.kt)("a",{parentName:"sup",href:"#fn-relative-path-prefixes",className:"footnote-ref"},"5"))),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"contracts")),(0,l.kt)("td",{parentName:"tr",align:null},"The places to search for imported contract paths from within a solidity code. The contract's parent folder is the first one being searched, followed by the project's ",(0,l.kt)("inlineCode",{parentName:"td"},"node_modules")," and then, if nothing matches, the rest of the included prefixes are looked at in the order in which they are defined")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CONTRACTS_RELATIVE_PATH"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"path"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"contracts")),(0,l.kt)("td",{parentName:"tr",align:null},"The name of the folder relative to the project root directory where all the solidity contracts are expected to reside. This is used when Strato is doing the contract compiling of a given relative-pathed contract")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_DEFAULT_CONTRACT_CREATION_GAS"),(0,l.kt)("td",{parentName:"tr",align:null},"session.defaults.contractCreationGas"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"number"),(0,l.kt)("td",{parentName:"tr",align:null},"150000"),(0,l.kt)("td",{parentName:"tr",align:null},"The default amount spent for creating a contract on the network")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_DEFAULT_CONTRACT_TRANSACTION_GAS"),(0,l.kt)("td",{parentName:"tr",align:null},"session.defaults.contractTransactionGas"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"number"),(0,l.kt)("td",{parentName:"tr",align:null},"169000"),(0,l.kt)("td",{parentName:"tr",align:null},"The default amount given when executing a contract transaction")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_DEFAULT_EMIT_CONSTRUCTOR_LOGS"),(0,l.kt)("td",{parentName:"tr",align:null},"session.defaults.emitConstructorLogs"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"boolean"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"true")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"true")," to emit the constructor logs at contract-creation time, ",(0,l.kt)("inlineCode",{parentName:"td"},"false")," otherwise")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_DEFAULT_EMIT_LIVE_CONTRACT_RECEIPTS"),(0,l.kt)("td",{parentName:"tr",align:null},"session.defaults.emitLiveContractReceipts"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"boolean"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"false")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"true")," to ask for and emit the receipts originating from live-contract calls, ",(0,l.kt)("inlineCode",{parentName:"td"},"false")," otherwise")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_DEFAULT_PAYMENT_FOR_CONTRACT_QUERY"),(0,l.kt)("td",{parentName:"tr",align:null},"session.defaults.paymentForContractQuery"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"number"),(0,l.kt)("td",{parentName:"tr",align:null},"0"),(0,l.kt)("td",{parentName:"tr",align:null},"The default amount payed for doing a contract query call")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_NETWORK"),(0,l.kt)("td",{parentName:"tr",align:null},"network.name"),(0,l.kt)("td",{parentName:"tr",align:null},"Yes"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"previewnet"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"testnet"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"mainnet"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"customnet")),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"The network profile to use")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_NODES"),(0,l.kt)("td",{parentName:"tr",align:null},"network.nodes"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-customnet-hedera-network"},(0,l.kt)("a",{parentName:"sup",href:"#fn-customnet-hedera-network",className:"footnote-ref"},"4"))),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-customnet-nodes"},(0,l.kt)("a",{parentName:"sup",href:"#fn-customnet-nodes",className:"footnote-ref"},"3"))),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"A condensed address-book representation of the network nodes (see",(0,l.kt)("sup",{parentName:"td",id:"fnref-customnet-nodes"},(0,l.kt)("a",{parentName:"sup",href:"#fn-customnet-nodes",className:"footnote-ref"},"3")),")")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_OPERATOR_ID"),(0,l.kt)("td",{parentName:"tr",align:null},"client.hedera.operatorId"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-client-type-hedera"},(0,l.kt)("a",{parentName:"sup",href:"#fn-client-type-hedera",className:"footnote-ref"},"2"))),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"The account-id of the operator running a ",(0,l.kt)("inlineCode",{parentName:"td"},"HederaClient"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_OPERATOR_KEY"),(0,l.kt)("td",{parentName:"tr",align:null},"client.hedera.operatorKey"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("sup",{parentName:"td",id:"fnref-client-type-hedera"},(0,l.kt)("a",{parentName:"sup",href:"#fn-client-type-hedera",className:"footnote-ref"},"2"))),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"The operator private-key of the operator running a ",(0,l.kt)("inlineCode",{parentName:"td"},"HederaClient"))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_LOGGER_LEVEL"),(0,l.kt)("td",{parentName:"tr",align:null},"logger.level"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"error"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"warn"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"info"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"verbose"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"debug"),", ",(0,l.kt)("inlineCode",{parentName:"td"},"silly")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"info")),(0,l.kt)("td",{parentName:"tr",align:null},"The logger sensitivity ",(0,l.kt)("sup",{parentName:"td",id:"fnref-winston-logger-github"},(0,l.kt)("a",{parentName:"sup",href:"#fn-winston-logger-github",className:"footnote-ref"},"1")))),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_LOGGER_ENABLED"),(0,l.kt)("td",{parentName:"tr",align:null},"logger.enabled"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"boolean"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"false")),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},"true")," to enable the logger, ",(0,l.kt)("inlineCode",{parentName:"td"},"false")," otherwise")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_CLIENT_SAVED_STATE"),(0,l.kt)("td",{parentName:"tr",align:null},"client.saved"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"base64 string"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"Used to recover a previous ongoing session with the purpose of some day having some sort of wallet token here to work with. Can be obtained via a ",(0,l.kt)("inlineCode",{parentName:"td"},"ApiSession.save()")," call")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"HEDERAS_ENV_PATH"),(0,l.kt)("td",{parentName:"tr",align:null},"-"),(0,l.kt)("td",{parentName:"tr",align:null},"No"),(0,l.kt)("td",{parentName:"tr",align:null},"path"),(0,l.kt)("td",{parentName:"tr",align:null},(0,l.kt)("inlineCode",{parentName:"td"},".env")),(0,l.kt)("td",{parentName:"tr",align:null},"The path of the ",(0,l.kt)("inlineCode",{parentName:"td"},".env")," like file used to source the config parameters from")))),(0,l.kt)("h2",{id:"parameters-resolution"},"Parameters resolution"),(0,l.kt)("p",null,"The default context parameters are being resolved in the following order:"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"First, the runtime object-argument is checked and if a config property is present there, that's the one being used ",(0,l.kt)("em",{parentName:"li"},"otherwise")),(0,l.kt)("li",{parentName:"ul"},"If ",(0,l.kt)("inlineCode",{parentName:"li"},"process.env")," (nodejs-case) contains that equivalent environment variable, that is the one which will be used ",(0,l.kt)("em",{parentName:"li"},"else")),(0,l.kt)("li",{parentName:"ul"},"If the ",(0,l.kt)("inlineCode",{parentName:"li"},"HEDERAS_ENV_PATH")," environment file path has been supplied, exists and contains the same keyes expected in ",(0,l.kt)("inlineCode",{parentName:"li"},"process.env"),", it will be used ",(0,l.kt)("em",{parentName:"li"},"else")),(0,l.kt)("li",{parentName:"ul"},"If a ",(0,l.kt)("inlineCode",{parentName:"li"},".env")," file exists and it contains the same key expected in ",(0,l.kt)("inlineCode",{parentName:"li"},"process.env"),", that's one is being used.")),(0,l.kt)("p",null,"If none of the above conditions are true and the parameter is not mandatory, the default value is loaded or an error eventually propagates."),(0,l.kt)("div",{className:"footnotes"},(0,l.kt)("hr",{parentName:"div"}),(0,l.kt)("ol",{parentName:"div"},(0,l.kt)("li",{parentName:"ol",id:"fn-winston-logger-github"},"see ",(0,l.kt)("a",{parentName:"li",href:"https://github.com/winstonjs/winston#logging"},"https://github.com/winstonjs/winston#logging"),(0,l.kt)("a",{parentName:"li",href:"#fnref-winston-logger-github",className:"footnote-backref"},"\u21a9")),(0,l.kt)("li",{parentName:"ol",id:"fn-client-type-hedera"},"required if ",(0,l.kt)("inlineCode",{parentName:"li"},"HEDERAS_CLIENT_TYPE"),"/",(0,l.kt)("inlineCode",{parentName:"li"},"client.type")," is ",(0,l.kt)("inlineCode",{parentName:"li"},"Hedera")," (the default)",(0,l.kt)("a",{parentName:"li",href:"#fnref-client-type-hedera",className:"footnote-backref"},"\u21a9")),(0,l.kt)("li",{parentName:"ol",id:"fn-customnet-nodes"},"a comma separated string of node-network addreses having the following format : ",(0,l.kt)("inlineCode",{parentName:"li"},"<ip>:<port>#<account_id>")," eg ",(0,l.kt)("inlineCode",{parentName:"li"},"127.0.0.2:52111#3")," to make an address-book of one node located at ",(0,l.kt)("inlineCode",{parentName:"li"},"127.0.0.1"),", port ",(0,l.kt)("inlineCode",{parentName:"li"},"52111")," having account-id ",(0,l.kt)("inlineCode",{parentName:"li"},"0.0.3")," ",(0,l.kt)("a",{parentName:"li",href:"#fnref-customnet-nodes",className:"footnote-backref"},"\u21a9")),(0,l.kt)("li",{parentName:"ol",id:"fn-customnet-hedera-network"},"required if ",(0,l.kt)("inlineCode",{parentName:"li"},"HEDERAS_NETWORK"),"/",(0,l.kt)("inlineCode",{parentName:"li"},"network.name")," is ",(0,l.kt)("inlineCode",{parentName:"li"},"customnet"),(0,l.kt)("a",{parentName:"li",href:"#fnref-customnet-hedera-network",className:"footnote-backref"},"\u21a9")),(0,l.kt)("li",{parentName:"ol",id:"fn-relative-path-prefixes"},"a comma separated list of relative folder paths to look at when importing a relative solidity contract-file from within one of the contracts that we wish to compile",(0,l.kt)("a",{parentName:"li",href:"#fnref-relative-path-prefixes",className:"footnote-backref"},"\u21a9")),(0,l.kt)("li",{parentName:"ol",id:"fn-default-operatorkey"},"required if ",(0,l.kt)("inlineCode",{parentName:"li"},"HEDERAS_CLIENT_CONTROLLER_TYPE")," is ",(0,l.kt)("inlineCode",{parentName:"li"},"DefaultPrivateKey"),(0,l.kt)("a",{parentName:"li",href:"#fnref-default-operatorkey",className:"footnote-backref"},"\u21a9")))))}u.isMDXComponent=!0}}]);