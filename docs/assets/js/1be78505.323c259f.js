"use strict";(self.webpackChunk_buidlerlabs_hedera_strato_js=self.webpackChunk_buidlerlabs_hedera_strato_js||[]).push([[514],{31672:(e,n,r)=>{r.d(n,{Z:()=>U});var t=r(87462),o=r(63366),i=r(67294),l=r(52263);const a="playgroundContainer_MKDX",s="playgroundHeader_F0j5",g="playgroundRunButton_ZmUZ",c="playgroundEditor_lFf0",u="playgroundPreview_dYQ_",d="playgroundLogsContainer_cwjg",m="playgroundLogItem_T7bA",v="internal_Na5g",f="userInput_K91j";var p=r(15861),_=r(87757),E=r.n(_),L=r(50776),y=r(29548),h=r(91262),S=r(97762);function b(){return i.createElement("div",null,"Loading...")}var C=function(e){var n=e.isRunning,r=i.useContext(L.L2),t=i.useState(),o=t[0],l=t[1],a=r.element;return i.useEffect((function(){var e=a?(0,S.renderToString)(i.createElement(a,null)):null;e&&l(e)}),[r]),n?a?i.createElement("div",{className:u},i.createElement(a,null)):null:o?i.createElement("div",{className:u},i.createElement("div",{dangerouslySetInnerHTML:{__html:o}})):null},w=function(e){var n=e.error,r=e.errorCallback,t=i.useContext(L.L2);return i.useEffect((function(){t.error&&r(t.error)}),[t]),n?i.createElement("pre",{style:{color:"red"}},n):null};const Z=function(e){var n=e.isRunning,r=e.error,t=e.errorCallback;return i.createElement("div",null,i.createElement(h.Z,{fallback:i.createElement(b,null)},(function(){return i.createElement(i.Fragment,null,i.createElement(C,{isRunning:n}),i.createElement(w,{error:r,errorCallback:t}))})))};var k=r(95999),x=r(72389),N=r(86010);function R(e){var n=e.onChange,r=e.disabled,t=(0,x.Z)();return i.createElement(L.uz,{key:t,className:c,onChange:n,disabled:r})}function T(e){var n=e.children;return i.createElement("div",{className:(0,N.Z)(s)},n)}const A=function(e){var n=e.isRunning,r=e.onRunAction,t=e.onChange,o=e.disabled;return i.createElement(i.Fragment,null,i.createElement(T,null,i.createElement(k.Z,{id:"theme.Playground.liveEditor",description:"The live editor label of the live codeblocks"},"Live Editor")),i.createElement(R,{onChange:t,disabled:n}),i.createElement(T,null,i.createElement("button",{className:g,onClick:r,disabled:o||n},"RUN")))};var H=["hasTopPosition"];const K=function(e){var n=e.hasTopPosition,r=(0,o.Z)(e,H),l=[{name:"editor",Component:A,props:r},{name:"result",Component:Z,props:r}];return(n?l.reverse():l).map((function(e){var n=e.Component,r=e.props,o=e.name;return i.createElement(n,(0,t.Z)({key:o+"-container"},r))}))},P="loadingSpinner_XUBm";const B=function(){return i.createElement("div",{className:P},i.createElement("div",null),i.createElement("div",null),i.createElement("div",null))};var j=["children","playgroundPosition"],F=new(function(){function e(){this._events={}}var n=e.prototype;return n.on=function(e,n){this._events[e]||(this._events[e]=[]),this._events[e].push(n)},n.removeListener=function(e){this._events[e]=null},n.emit=function(e,n){if(!this._events[e])throw new Error("Can't emit an event. Event \""+e+"\" doesn't exits.");this._events[e].forEach((function(e){e(n)}))},e}());const I=function(e){var n=e.children,r=e.playgroundPosition,l=(0,o.Z)(e,j),a=i.useState(!0),s=a[0],g=a[1],c=i.useState(n),u=c[0],_=c[1],h=i.useState(!1),S=h[0],b=h[1],C=i.useState(null),w=C[0],Z=C[1],k=i.useRef(!1),x=(0,y.pJ)(),R={Loader:B,liveEventEmitter:F},T=function(e){e===l.containerKey&&Z(null),b(e===l.containerKey),g(e!==l.containerKey)},A=function(){b(!1),g(!1)},H=function(e){Z(e),F.emit("done")},P=function(e){var n=e.error;e.emitterKey===l.containerKey&&(b(!1),H(n.toString()))};return i.useEffect((function(){k.current=!0;var e=function e(n,r){window[n]?r():setTimeout((function(){e(n,r)}),500)},n=function(){var n=(0,p.Z)(E().mark((function n(){return E().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:e("ApiSession",(function(){k.current&&(F.on("running",T),F.on("done",A),F.on("executionError",P),g(!1))}));case 1:case"end":return n.stop()}}),n)})));return function(){return n.apply(this,arguments)}}();return n(),function(){k.current=!1,F.removeListener("running",T),F.removeListener("done",A),F.removeListener("executionError",P)}}),[l.categoryKey]),i.createElement(i.Fragment,null,i.createElement(L.nu,{code:u.replace(/\n$/,""),scope:R,transformCode:function(e){return S?function(e,n){return"  \n        const originalApiSession = ApiSession.default;\n        const originalLogger = console.log;\n        \n        const argToLogResult = (_arg) => {\n            try{\n                if(_arg.logLevel){\n                    return {\n                        logLevel: _arg.logLevel,\n                        message: _arg.message\n                    }\n                }else{\n                    let _parsed = _arg.toString();\n                    \n                    if(_arg._isBigNumber){\n                        _parsed += ' (BigNumber)';    \n                    }\n                    \n                    return _parsed\n                }\n            }catch (e) {\n              console.error(e)\n            }\n        }\n        \n        const argToStringMapping = _arg => {\n            if(!_arg){\n                 return null;   \n            }\n            \n            if(typeof _arg === 'string'){\n                return _arg;\n            } else{\n                return argToLogResult(_arg);\n            }\n        }\n        \n        const addEventListeners = (_logger) => {\n            _logger.addListener('debug', (message) => logListenerHandler('debug', message))\n            _logger.addListener('error', (message) => logListenerHandler('error', message))\n            _logger.addListener('info', (message) => logListenerHandler('info', message))\n            _logger.addListener('warn', (message) => logListenerHandler('warn', message))\n        }\n        \n        const removeEventListeners = (_logger) => {\n            _logger.removeListener('debug', logListenerHandler);\n            _logger.removeListener('error', logListenerHandler);\n            _logger.removeListener('info', logListenerHandler);\n            _logger.removeListener('warn', logListenerHandler);\n        }\n        \n        const logListenerHandler = (logLevel, message) => console.log({logLevel, message}); \n        \n        ApiSession = {\n            ...ApiSession,\n            default: (...args) => {\n                return originalApiSession(...args).then(({session, controller}) => {\n                    if(!window.originalStratoSession) {\n                        window.originalStratoSession = session;\n                        addEventListeners(session.log);\n                    }\n                    \n                    return {session, controller};\n                })\n            }\n        }\n    \n        let logs = [];\n        console.log = (...args) => {\n            if(Array.isArray(args)) {\n                args = args\n                .map(argToStringMapping)\n                .filter(Boolean)\n        \n                logs = [...logs, ...args]\n            }else{\n                if(!args) return;\n                const log = argToLogResult(args);\n\n                logs = [...logs, log]\n            }\n            \n            const LogLevelBadge = ({text}) => {\n                const itemStyle = '"+m+"';\n                const badgeStyle = itemStyle.replace(itemStyle.substring(0, itemStyle.indexOf('_')), text);\n                \n                return <span className={itemStyle + ' ' + badgeStyle}>{text}</span>\n            }\n            \n            render(<div className={'"+d+"'}>\n                {logs.map((log, index) => {\n                    { \n                        return log.logLevel \n                            ? <p key={index} className={ `"+(0,N.Z)(m,v)+"` }>\n                                    <LogLevelBadge text={log.logLevel}/> - {log.message}\n                              </p>\n                            : <p key={index} className={ `"+(0,N.Z)(m,f)+"` }>{log}</p>\n                    }\n                })}\n            </div>) \n        };\n \n        (async function () {\n            render(<Loader/>); \n            \n            try{\n                 "+e+"\n            }catch (error) {\n                console.log(null) //in case of error, clear the current logs result\n                console.error(error); // also display the error on the console for easy debugging\n                \n                liveEventEmitter.emit('executionError', {\n                    error: error,\n                    emitterKey: '"+n+"' \n                });\n            }\n            \n            if(window.originalStratoSession) {\n                removeEventListeners(originalStratoSession.log);\n                originalStratoSession = null;\n            }\n            \n            console.log = originalLogger;\n            liveEventEmitter.emit('done');\n        })();\n    "}(e,l.containerKey):"render(null)"},theme:x,noInline:!0,disabled:s},i.createElement(K,(0,t.Z)({hasTopPosition:"top"===r,isRunning:S,onRunAction:function(){return F.emit("running",l.containerKey)},onChange:_,disabled:s,error:w,errorCallback:H},l))))};var M=["children"];function U(e){var n=e.children,r=(0,o.Z)(e,M),s=(0,l.Z)().siteConfig.themeConfig.liveCodeBlock.playgroundPosition,g=r.metastring.split(" ").reduce((function(e,n){var r=n.split("="),t=r[0],o=r[1];return e[t]=o,e}),{});return i.createElement("div",{className:a},i.createElement(I,(0,t.Z)({playgroundPosition:s},g),n))}},43106:(e,n,r)=>{r.d(n,{Z:()=>o});var t=r(67294);const o=Object.assign({React:t},t)}}]);