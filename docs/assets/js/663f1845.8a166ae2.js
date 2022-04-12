(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[426],{91262:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});var a=n(67294),i=n(72389);function o(e){var t=e.children,n=e.fallback;return(0,i.Z)()?a.createElement(a.Fragment,null,t()):null!=n?n:null}},60354:(e,t,n)=>{"use strict";n.r(t),n.d(t,{assets:()=>N,contentTitle:()=>g,default:()=>b,frontMatter:()=>k,metadata:()=>w,toc:()=>v});var a=n(87462),i=n(63366),o=n(67294),r=n(3905),l=n(93456),s=n(91262),c=n(15861),d=n(87757),p=n.n(d),m=function(){var e=window.StratoOperator,t=function(e){if(e){var t=function(){var t=(0,c.Z)(p().mark((function t(){var n;return p().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.getAccountBalance();case 2:return n=t.sent,t.abrupt("return",n&&n.hbars);case 4:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();t().then((function(t){i((function(n){return{balance:t.toString(),connected:!0,wallet:e}}))})).catch((function(){i((function(t){return Object.assign({},t,{connected:!0,wallet:e})}))}))}},n=o.useState({balance:null,connected:!1,wallet:null}),a=n[0],i=n[1],r=function(){var t=(0,c.Z)(p().mark((function t(){return p().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,window.connectWallet(e.network);case 3:i((function(e){return Object.assign({},e,{connected:!0})})),t.next=9;break;case 6:t.prev=6,t.t0=t.catch(0),alert(t.t0);case 9:case"end":return t.stop()}}),t,null,[[0,6]])})));return function(){return t.apply(this,arguments)}}();return window.addEventListener("message",(function(e){"WalletLoaded"===e.data&&t(window.hedera)})),a.wallet||t(window.hedera),window.addEventListener("storage",(function(e){"hashpack-data"!==e.key||e.newValue||window.disconnectWallet()})),o.createElement("center",{style:{margin:"16px"}},a.connected&&a.wallet?o.createElement(u,{accountId:a.wallet.getAccountId().toString()||"",balance:a.balance,onDisconnect:function(){window.disconnectWallet(),i({balance:null,connected:!1,wallet:null})}}):o.createElement("button",{className:"wallet-connect connect",onClick:r},"CONNECT WALLET"))},u=function(e){var t=e.accountId,n=e.balance,a=e.onDisconnect;return o.createElement("div",{className:"connected-stats"},o.createElement("div",{className:"info"},o.createElement("span",{className:"id"},t),o.createElement("span",{className:"balance"},n)),o.createElement("button",{className:"wallet-connect disconnect",onClick:a},"Disconnect"))},h=["components"],k={id:"wallet",title:"Wallets"},g=void 0,w={unversionedId:"markdown/guides/wallet",id:"markdown/guides/wallet",title:"Wallets",description:"",source:"@site/markdown/guides/wallet.md",sourceDirName:"markdown/guides",slug:"/markdown/guides/wallet",permalink:"/markdown/guides/wallet",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/markdown/guides/wallet.md",tags:[],version:"current",lastUpdatedBy:"Victor ADASCALITEI",lastUpdatedAt:1649693674,formattedLastUpdatedAt:"4/11/2022",frontMatter:{id:"wallet",title:"Wallets"},sidebar:"docs",previous:{title:"Bundling",permalink:"/markdown/guides/bundling"},next:{title:"The Session",permalink:"/markdown/guides/session"}},N={},v=[{value:"HIP-338 compliant",id:"hip-338-compliant",level:2},{value:"Under the hood",id:"under-the-hood",level:2},{value:"Hedera&#39;s SDK implementation",id:"hederas-sdk-implementation",level:3},{value:"Strato&#39;s take",id:"stratos-take",level:3},{value:"Configuring",id:"configuring",level:2}],f={toc:v};function b(e){var t=e.components,n=(0,i.Z)(e,h);return(0,r.kt)("wrapper",(0,a.Z)({},f,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h2",{id:"hip-338-compliant"},(0,r.kt)("a",{parentName:"h2",href:"https://hips.hedera.com/hip/hip-338"},"HIP-338")," compliant"),(0,r.kt)("p",null,"We might be the first non-official library to support Hedera's standardized wallet proposal and we're damn proud of it."),(0,r.kt)("p",null,"Want to give it a spin? Make sure you have ",(0,r.kt)("a",{parentName:"p",href:"https://www.hashpack.app/"},"HashPack installed")," and then connect to the docs page by clicking "),(0,r.kt)(s.Z,{fallback:(0,r.kt)("p",null,"Wallet Button"),mdxType:"BrowserOnly"},(function(){return(0,r.kt)(m,{mdxType:"HeadStarterConnectWallet"})})),(0,r.kt)("p",null,"Then get a hold of ",(0,r.kt)("a",{parentName:"p",href:"/markdown/configuration#HEDERAS_WALLET_TYPE"},"a Session that targets a ",(0,r.kt)("inlineCode",{parentName:"a"},"Browser")," wallet")," and use it normally:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-js",metastring:"live",live:!0},"const { session } = await ApiSession.default({ wallet: { type: 'Browser' } });\nconst liveJson = await session.upload(new Json({ theAnswer: 42 }));\n\nconsole.log(`Wallet account id used: ${session.wallet.account.id}`);\nconsole.log(`Json is stored at ${liveJson.id}`);\nconsole.log(`The answer is: ${liveJson.theAnswer}`);\n")),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"We need here to intentionally specify the ",(0,r.kt)("inlineCode",{parentName:"p"},"{ wallet: { type: 'Browser' } }")," object argument to ",(0,r.kt)("inlineCode",{parentName:"p"},"ApiSession.default")," otherwise, ",(0,r.kt)("a",{parentName:"p",href:"/markdown/configuration#parameters-resolution"},"fallowing normal parameters resolution"),", the strato bundle would have defaulted to using the implicit ",(0,r.kt)("inlineCode",{parentName:"p"},"Sdk")," wallet type which was configured when bundling for use with these docs. This is actually the case for other live-code edits present on other pages."))),(0,r.kt)("div",{className:"admonition admonition-warning alert alert--danger"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"}))),"warning")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"Due to Hedera's pricing model as well as ",(0,r.kt)("inlineCode",{parentName:"p"},"Query")," mechanics and, in general, overall ",(0,r.kt)("inlineCode",{parentName:"p"},"Executable")," support from wallet extensions, only ",(0,r.kt)("inlineCode",{parentName:"p"},"Transaction"),"s are currently supported by our wallet-bridge implementation. "),(0,r.kt)("p",{parentName:"div"},"This means that only ",(0,r.kt)("inlineCode",{parentName:"p"},"wallet.getAccountBalance()")," is supported and that, consequently, ",(0,r.kt)("inlineCode",{parentName:"p"},"wallet.getAccountInfo()")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"wallet.getAccountRecords()")," are not."),(0,r.kt)("p",{parentName:"div"},"This also means that contract creation/querying is not currently supported. We plan on mitigating this with a future Strato release."))),(0,r.kt)("h2",{id:"under-the-hood"},"Under the hood"),(0,r.kt)("h3",{id:"hederas-sdk-implementation"},"Hedera's ",(0,r.kt)("a",{parentName:"h3",href:"https://github.com/hashgraph/hedera-sdk-js/pull/960"},"SDK implementation")),(0,r.kt)("p",null,"A ",(0,r.kt)("inlineCode",{parentName:"p"},"LocalWallet")," and a ",(0,r.kt)("inlineCode",{parentName:"p"},"LocalProvider")," have been developed by Hedera to wrap the traditional ",(0,r.kt)("inlineCode",{parentName:"p"},"Client")," account-operated instance. As of ",(0,r.kt)("inlineCode",{parentName:"p"},"hedera-sdk-js"),"'s ",(0,r.kt)("inlineCode",{parentName:"p"},"v2.11.0"),", the only way to instantiate such a wallet is through the following environmental variables:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"Variable"),(0,r.kt)("th",{parentName:"tr",align:null},"Description"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"HEDERA_NETWORK"),(0,r.kt)("td",{parentName:"tr",align:null},"The name of the official",(0,r.kt)("sup",{parentName:"td",id:"fnref-local-provider-hedera-network"},(0,r.kt)("a",{parentName:"sup",href:"#fn-local-provider-hedera-network",className:"footnote-ref"},"1"))," network used by this wallet instance. Can be one of: ",(0,r.kt)("inlineCode",{parentName:"td"},"testnet"),", ",(0,r.kt)("inlineCode",{parentName:"td"},"previewnet")," or ",(0,r.kt)("inlineCode",{parentName:"td"},"mainnet"))),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"OPERATOR_ID"),(0,r.kt)("td",{parentName:"tr",align:null},"The ",(0,r.kt)("inlineCode",{parentName:"td"},"AccountId")," of the operator paying for the wallet's transactions")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"OPERATOR_KEY"),(0,r.kt)("td",{parentName:"tr",align:null},"The operator's private key")))),(0,r.kt)("p",null,"Following is a architecture diagram portraying the initial wallet-signer-provider implementation:"),(0,r.kt)(l.Mermaid,{config:{},chart:" classDiagram\n  direction TB\n\n  LocalProvider --o LocalWallet\n  LocalProvider ..|> Provider\n  Signer <|-- Wallet\n  LocalWallet ..> SignerSignature\n  LocalWallet ..|> Wallet\n  Provider --o Wallet\n\n  class Provider {\n    <<interface>>\n    +getLedgerId() LedgerId\n    +getNetwork()\n    +getMirrorNetwork() string[]\n    +getAccountBalance(AccountId|string) Promise(AccountBalance)\n    +getAccountInfo(AccountId|string) Promise(AccountInfo)\n    +getAccountRecords(AccountId|string) Promise(TransactionRecord[])\n    +getTransactionReceipt(TransactionId|string) Promise(TransactionReceipt)\n    +waitForReceipt(TransactionResponse) Promise(TransactionReceipt)\n    +sendRequest(Executable) Promise(Executable_OutputT)\n  }\n\n  class SignerSignature {\n    +publicKey PublicKey\n    +signature Uint8Array\n    +accountId AccountId\n  }\n\n  class Signer {\n    <<interface>>\n    +getLedgerId() LedgerId\n    +getAccountId() AccountId\n    +getNetwork()\n    +getMirrorNetwork() string[]\n    +sign(Uint8Array[]) Promise(SignerSignature[])\n    +getAccountBalance() Promise(AccountBalance)\n    +getAccountInfo() Promise(AccountInfo)\n    +getAccountRecords() Promise(TransactionRecord[])\n    +signTransaction(Transaction) Promise(Transaction)\n    +checkTransaction(Transaction) Promise(Transaction)\n    +populateTransaction(Transaction) Promise(Transaction)\n    +sendRequest(Executable) Promise(Executable_OutputT)\n  }\n\n  class Wallet {\n    <<interface>>\n    +getProvider() Provider\n    +getAccountKey() Key\n  }\n\n  class LocalProvider {\n    \n  }\n\n  class LocalWallet {\n\n  }",mdxType:"Mermaid"}),(0,r.kt)("p",null,"A couple of summarizing points here:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"Wallet")," is an interface extending a ",(0,r.kt)("inlineCode",{parentName:"li"},"Signer")," and having a ",(0,r.kt)("inlineCode",{parentName:"li"},"Provider")," associated. It's basically the ",(0,r.kt)("em",{parentName:"li"},"glue")," that ties everything up"),(0,r.kt)("li",{parentName:"ul"},"As such ",(0,r.kt)("inlineCode",{parentName:"li"},"Wallet"),"s are the objects that are meant to be hooked into in order to operate a Hedera session"),(0,r.kt)("li",{parentName:"ul"},"The associated wallet account id information is something bound to the ",(0,r.kt)("inlineCode",{parentName:"li"},"Wallet")," and made available through the ",(0,r.kt)("inlineCode",{parentName:"li"},"Signer")," interface"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"Provider"),"s should only bridge the implementation with the data-source (which is most likely network based)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"Provider"),"s should not have hard-coded account-ids on their instance and should, with respect to this data, be stateless ")),(0,r.kt)("p",null,"For a more detailed analysis, please have a ",(0,r.kt)("a",{parentName:"p",href:"https://hips.hedera.com/hip/hip-338"},"look at the original HIP"),"."),(0,r.kt)("h3",{id:"stratos-take"},"Strato's take"),(0,r.kt)("div",{className:"admonition admonition-caution alert alert--warning"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"caution")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"This feature is currently in active development. As such, it is very likely that the final API, once the stable release hits the streets, will differ."))),(0,r.kt)("p",null,"Based on the original HIP-338 proposal, we went on and simplified the overall ",(0,r.kt)("inlineCode",{parentName:"p"},"Wallet")," interface to a ",(0,r.kt)("inlineCode",{parentName:"p"},"StratoWallet")," which only currently knows 2 operations: "),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"executing ",(0,r.kt)("inlineCode",{parentName:"li"},"Transaction"),"s and ",(0,r.kt)("inlineCode",{parentName:"li"},"Query"),"s"),(0,r.kt)("li",{parentName:"ul"},"getting a ",(0,r.kt)("inlineCode",{parentName:"li"},"TransactionReceipt")," for a ",(0,r.kt)("inlineCode",{parentName:"li"},"TransactionResponse")," ")),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},(0,r.kt)("inlineCode",{parentName:"p"},"Sign"),"-ing mechanics are still being designed and considered and will probably see the light of day in a future release."))),(0,r.kt)("p",null,"We then extracted away the ",(0,r.kt)("inlineCode",{parentName:"p"},"Signer")," query calls and isolated them into their own ",(0,r.kt)("inlineCode",{parentName:"p"},"SignerInfo")," interface. ",(0,r.kt)("inlineCode",{parentName:"p"},"WalletInfo")," glues everything up nicely and is made available on every session at ",(0,r.kt)("inlineCode",{parentName:"p"},"ApiSession.wallet"),"."),(0,r.kt)(l.Mermaid,{chart:" classDiagram\n  direction TB\n\n  WalletInfo o-- SignerInfo\n  WalletInfo <|-- StratoWallet\n\n  class SignerInfo {\n    <<interface>>\n    +getLedgerId() LedgerId\n    +getAccountId() AccountId\n    +getNetwork()\n    +getMirrorNetwork() string[]\n    +getAccountBalance() Promise(AccountBalance)\n    +getAccountInfo() Promise(AccountInfo)\n    +getAccountRecords() Promise(TransactionRecord[])\n  }\n\n  class WalletInfo {\n    <<interface>>\n    +account PublicAccountInfo\n    +signer SignerInfo\n  }\n\n  class StratoWallet {\n    <<interface>>\n    +execute(Transaction|Query) Promise(...)\n    +getReceipt(TransactionResponse) Promise(TransactionReceipt)\n  }",mdxType:"Mermaid"}),(0,r.kt)("h2",{id:"configuring"},"Configuring"),(0,r.kt)("p",null,"As seen above, there are currently 2 types of ",(0,r.kt)("inlineCode",{parentName:"p"},"wallet")," backends:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"a, default, ",(0,r.kt)("inlineCode",{parentName:"li"},"Sdk")," one which uses a re-implemented version of Hedera's ",(0,r.kt)("inlineCode",{parentName:"li"},"LocalWallet")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"LocalProvider")," to also work with ",(0,r.kt)("inlineCode",{parentName:"li"},"customnet")," networks"),(0,r.kt)("li",{parentName:"ul"},"a ",(0,r.kt)("inlineCode",{parentName:"li"},"Browser")," one which, when selected, looks at a global ",(0,r.kt)("inlineCode",{parentName:"li"},"window.hedera")," object and uses that as the ",(0,r.kt)("inlineCode",{parentName:"li"},"Wallet")," sync for all transactions of that particular session")),(0,r.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,r.kt)("div",{parentName:"div",className:"admonition-heading"},(0,r.kt)("h5",{parentName:"div"},(0,r.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,r.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,r.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,r.kt)("div",{parentName:"div",className:"admonition-content"},(0,r.kt)("p",{parentName:"div"},"For ",(0,r.kt)("inlineCode",{parentName:"p"},"Browser")," wallets, property names can be changed via the ",(0,r.kt)("inlineCode",{parentName:"p"},"HEDERAS_WALLET_WINDOW_PROPERTY_NAME"),"/",(0,r.kt)("inlineCode",{parentName:"p"},"wallet.window.propName")," config."))),(0,r.kt)("p",null,"The code for the HashPack HIP-338 wallet-bridge used in this page can be ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/buidler-labs/hedera-strato-js/tree/va/hip-338/lib.docs/src/hashconnect"},"found here"),". In the future, this will most likely be contained within the hashconnect codebase for obvious reasons."),(0,r.kt)("div",{className:"footnotes"},(0,r.kt)("hr",{parentName:"div"}),(0,r.kt)("ol",{parentName:"div"},(0,r.kt)("li",{parentName:"ol",id:"fn-local-provider-hedera-network"},"as of ",(0,r.kt)("inlineCode",{parentName:"li"},"v2.11.0")," of the ",(0,r.kt)("inlineCode",{parentName:"li"},"hedera-sdk-js"),", custom network definitions (such as local ones) are not supported. ",(0,r.kt)("a",{parentName:"li",href:"#fnref-local-provider-hedera-network",className:"footnote-backref"},"\u21a9")))))}b.isMDXComponent=!0},11748:(e,t,n)=>{var a={"./locale":89234,"./locale.js":89234};function i(e){var t=o(e);return n(t)}function o(e){if(!n.o(a,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return a[e]}i.keys=function(){return Object.keys(a)},i.resolve=o,e.exports=i,i.id=11748}}]);