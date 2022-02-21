(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[265],{51181:(e,t,n)=>{"use strict";n.r(t),n.d(t,{frontMatter:()=>d,contentTitle:()=>p,metadata:()=>u,toc:()=>m,default:()=>k});var a=n(87462),i=n(63366),o=(n(67294),n(3905)),r=n(9877),l=n(58215),s=n(93456),c=["components"],d={id:"quick-start",title:"Quick Start"},p=void 0,u={unversionedId:"markdown/quick-start",id:"markdown/quick-start",title:"Quick Start",description:"Installing",source:"@site/markdown/quick-start.md",sourceDirName:"markdown",slug:"/markdown/quick-start",permalink:"/markdown/quick-start",editUrl:"https://github.com/buidler-labs/hedera-strato-js/edit/main/markdown/quick-start.md",tags:[],version:"current",frontMatter:{id:"quick-start",title:"Quick Start"},sidebar:"docs",previous:{title:"\ud83d\udc4b Welcome to Strato! \ud83c\udf0c",permalink:"/"},next:{title:"Configuring",permalink:"/markdown/configuration"}},m=[{value:"Installing",id:"installing",children:[],level:2},{value:"Hello Strato",id:"hello-strato",children:[],level:2},{value:"Architecture",id:"architecture",children:[],level:2},{value:"Next up",id:"next-up",children:[],level:2}],h={toc:m};function k(e){var t=e.components,n=(0,i.Z)(e,c);return(0,o.kt)("wrapper",(0,a.Z)({},h,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h2",{id:"installing"},"Installing"),(0,o.kt)("p",null,"Your normal"),(0,o.kt)(r.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,o.kt)(l.Z,{value:"npm",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"npm install @buidlerlabs/hedera-strato-js\n"))),(0,o.kt)(l.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-bash"},"yarn add @buidlerlabs/hedera-strato-js\n")))),(0,o.kt)("p",null,"will suffice."),(0,o.kt)("h2",{id:"hello-strato"},"Hello Strato"),(0,o.kt)("p",null,"As we've seen in our introductory page, firing up your first Strato smart-contract example should be straight forward but let's kick it up a notch to make things a little more interesting. Suppose you have a trimmed down version (comments & no ",(0,o.kt)("inlineCode",{parentName:"p"},"dec")," method stripped) of ",(0,o.kt)("a",{parentName:"p",href:"https://solidity-by-example.org/first-app/"},"the following contract"),":"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-sol",metastring:'title="./increment.sol"',title:'"./increment.sol"'},"// SPDX-License-Identifier: MIT\npragma solidity ^0.8.9;\n\ncontract Counter {\n  uint public count;\n\n  function get() public view returns (uint) {\n    return count;\n  }\n\n  function inc() public {\n    count += 1;\n  }\n}\n")),(0,o.kt)("p",null,"Instead of having a value that we read from the contract, we have state-mutating methods and a way to query the inner state which is much closer to production scenarios and, therefore, much more useful for our learning journey."),(0,o.kt)("p",null,"Interacting with it via Strato would be as simple as "),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js",metastring:"live=true containerKey=increment_from_path",live:"true",containerKey:"increment_from_path"},"const { session } = await ApiSession.default();\nconst counterContract = await Contract.newFrom({ path: './increment.sol' });\nconst liveContract = await session.upload(counterContract);\n\n// Increment then retrieve the counter\nawait liveContract.inc();\nconsole.log(await liveContract.get());\n")),(0,o.kt)("div",{className:"admonition admonition-note alert alert--secondary"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"}))),"note")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"We need the ",(0,o.kt)("inlineCode",{parentName:"p"},".toNumber")," call since the returned value of calling the ",(0,o.kt)("inlineCode",{parentName:"p"},"get")," method is an ",(0,o.kt)("inlineCode",{parentName:"p"},"uint")," which ",(0,o.kt)("a",{parentName:"p",href:"https://mikemcl.github.io/bignumber.js/"},"maps to a ",(0,o.kt)("inlineCode",{parentName:"a"},"BigNumber"))," and ",(0,o.kt)("inlineCode",{parentName:"p"},"console.log")," does not know how to display such instances."))),(0,o.kt)("p",null,"By convention, when calling ",(0,o.kt)("inlineCode",{parentName:"p"},"Contract.newFrom")," passing it a ",(0,o.kt)("inlineCode",{parentName:"p"},"path"),", Strato expects to find the solidity contract code in the ",(0,o.kt)("inlineCode",{parentName:"p"},"contracts")," folder. This is configurable via the ",(0,o.kt)("inlineCode",{parentName:"p"},"HEDERAS_CONTRACTS_RELATIVE_PATH")," environment variable."),(0,o.kt)("p",null,"If you were to run this code snippet, you would end up with a complaint issued by ",(0,o.kt)("inlineCode",{parentName:"p"},"ApiSession.default")," saying something about a network not avaiable issue. That's because Strato does not know, out of the box, to which network you want to connect."),(0,o.kt)("p",null,"We'll discuss configuration aspects in the upcoming page, but for now, to make this running, just create a ",(0,o.kt)("inlineCode",{parentName:"p"},".env")," file in your project root directory and have the following values defined:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"HEDERAS_NETWORK=testnet\nHEDERAS_OPERATOR_ID=0.0...\nHEDERAS_OPERATOR_KEY=302e02...\n")),(0,o.kt)("p",null,"Make sure to replace the values as you see fit: "),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"HEDERAS_NETWORK")," : can be either one of the official networks (",(0,o.kt)("inlineCode",{parentName:"li"},"previewnet"),", ",(0,o.kt)("inlineCode",{parentName:"li"},"testnet")," or ",(0,o.kt)("inlineCode",{parentName:"li"},"mainnet"),") or, for a more close-tight experience, ",(0,o.kt)("inlineCode",{parentName:"li"},"customnet")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"HEDERAS_OPERATOR_ID")," and ",(0,o.kt)("inlineCode",{parentName:"li"},"HEDERAS_OPERATOR_KEY")," are the operator's account id and private key which will pay for the transactions.")),(0,o.kt)("p",null,"If you don't have a pair of operator credentials, you can create a ",(0,o.kt)("inlineCode",{parentName:"p"},"testnet"),"/",(0,o.kt)("inlineCode",{parentName:"p"},"previewnet")," account for free if you register on the ",(0,o.kt)("a",{parentName:"p",href:"https://portal.hedera.com/register"},"Hedera Portal"),"."),(0,o.kt)("p",null,"Having the ",(0,o.kt)("inlineCode",{parentName:"p"},".env")," file available with the required values is enough to allow for successfully re-running the above example."),(0,o.kt)("div",{className:"admonition admonition-tip alert alert--success"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"}))),"tip")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"If you want to see a bit more console activity of what's happening underneath the hood, you can enable the logger and setup a sensible threshold by also adding to ",(0,o.kt)("inlineCode",{parentName:"p"},".env")," the following values:"),(0,o.kt)("pre",{parentName:"div"},(0,o.kt)("code",{parentName:"pre"},"HEDERAS_LOGGER_LEVEL=debug\nHEDERAS_LOGGER_ENABLED=true\n")))),(0,o.kt)("h2",{id:"architecture"},"Architecture"),(0,o.kt)("p",null,"Before we move on, it's worth talking here a bit about Strato's envisioned design:"),(0,o.kt)(s.Mermaid,{chart:"classDiagram\n  class Account\n  class ApiSession {\n    +LiveEntity<T> upload(what: UploadableEntity<T>)\n    +LiveEntity<T> create(what: CreatableEntity<T>)\n  }\n  class BasicCreatableEntity {\n    +name: string\n  }\n  class BasicUploadableEntity {\n    +nameOfUpload: string\n  }\n  class Contract\n  class CreatableEntity {\n    <<interface>>\n  }\n  class Json\n  class LiveAccount\n  class LiveContract\n  class LiveEntity\n  class LiveJson\n  class LiveToken\n  class UploadableEntity {\n    <<interface>>\n  }\n\n  class Token\n\n  ApiSession -- CreatableEntity\n  ApiSession -- UploadableEntity\n  ApiSession -- LiveEntity\n  CreatableEntity <|-- BasicCreatableEntity\n  BasicCreatableEntity <|-- Account\n  BasicCreatableEntity <|-- Token\n  LiveEntity <|-- LiveAccount\n  LiveEntity <|-- LiveContract\n  LiveEntity <|-- LiveJson\n  LiveEntity <|-- LiveToken\n  UploadableEntity <|-- BasicUploadableEntity\n  BasicUploadableEntity <|-- Contract\n  BasicUploadableEntity <|-- Json",mdxType:"Mermaid"}),(0,o.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,o.kt)("div",{parentName:"div",className:"admonition-heading"},(0,o.kt)("h5",{parentName:"div"},(0,o.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,o.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,o.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"info")),(0,o.kt)("div",{parentName:"div",className:"admonition-content"},(0,o.kt)("p",{parentName:"div"},"This is just a high level overview that helps arguing the library architecture decisions for most of the developer use-cases. It is, by no means, complete. More sophisitcated entities such as the ",(0,o.kt)("inlineCode",{parentName:"p"},"StratoClient")," interface (which helps configure the underlying network layer with the promise of future bridging Strato with wallets) have been excluded from the diagram. "),(0,o.kt)("p",{parentName:"div"},"This has been done both to conserve pixels and due to the fact that those entities are still in heavy development."))),(0,o.kt)("p",null,"Basically, we tried to walk away from the ",(0,o.kt)("em",{parentName:"p"},"builder")," feel given by working with the official Hedera SDK and move towards a more ",(0,o.kt)("em",{parentName:"p"},"mapping")," kind of approach which, hopefully, should be more familiar to how Object Oriented Programing solutions are thought. This means that, instead of having"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"new FileCreateTransaction()\n  .setKeys([client.operatorPublicKey])\n  .setContents(contractByteCode)\n  .execute(client)\n")),(0,o.kt)("p",null,"we tweaked and reversed the execution to have"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-js"},"session.upload(contract)\n")),(0,o.kt)("p",null,"which would better aproximate the mechanics of"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre"},"instance = session.newInstance(class)\n")),(0,o.kt)("p",null,"with ",(0,o.kt)("inlineCode",{parentName:"p"},"instance")," being the ",(0,o.kt)("inlineCode",{parentName:"p"},"live"),", hedera-deployed, runtime object and ",(0,o.kt)("inlineCode",{parentName:"p"},"class")," being the blueprint of whatever needs to be constructed on the network (eg. Token or Contract)."),(0,o.kt)("p",null,"Having said that, depending on the Hedera targeted service, there are 2 types of entities in the library:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"static entities - which are further down differentiatable into ",(0,o.kt)("inlineCode",{parentName:"li"},"CreatableEntity"),"s and ",(0,o.kt)("inlineCode",{parentName:"li"},"UploadableEntity"),"s "),(0,o.kt)("li",{parentName:"ul"},'live entities - which are the "resulting instances" of having the ',(0,o.kt)("em",{parentName:"li"},"static entities")," deployed")),(0,o.kt)("h2",{id:"next-up"},"Next up"),(0,o.kt)("p",null,"Now that we've discussed a bit about installing and running some Strato code as well as the overall design vesion of the library, it's high time we have a look at configuring/customizing a runtime ",(0,o.kt)("inlineCode",{parentName:"p"},"ApiSession"),"."))}k.isMDXComponent=!0},11748:(e,t,n)=>{var a={"./locale":89234,"./locale.js":89234};function i(e){var t=o(e);return n(t)}function o(e){if(!n.o(a,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return a[e]}i.keys=function(){return Object.keys(a)},i.resolve=o,e.exports=i,i.id=11748}}]);