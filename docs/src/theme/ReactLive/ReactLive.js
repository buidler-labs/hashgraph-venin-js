import * as React from "react";
import {LiveProvider} from "react-live";
import {usePrismTheme} from "@docusaurus/theme-common";
import LiveContainer from "./Components/LiveContainer";
import LoadingSpinner from "./Components/LoadingSpinner";
import LiveEventEmitter from "../ReactLive/LiveEventEmitter";

const wrapAsync = (code) => {
    return `
        console.info('wrap async')       
    
        let logs = [];
        const logger = console.log;
        console.log = (...args) => {
            logs = [...logs, ...args]
            
            render(<div className="plm">
                {logs.map((log, index) => <p key={index} >[DEBUG]: {log}</p>)}
            </div>) 
        };
 
        (async function () {
            render(<Loader/>); 
            ${code}           
            console.log = logger
            liveEventEmitter.emit('done');
        })();
    `;
}

const liveEventEmitter = new LiveEventEmitter();
let isMounted = false;

const ReactLive = ({children: code, playgroundPosition}) => {
    const [isReady, setIsReady] = React.useState(false);
    const [updatedCode, setUpdatedCode] = React.useState(code);
    const [running, setRunning] = React.useState(false);
    const prismTheme = usePrismTheme();
    const scope = {
        Loader: LoadingSpinner,
        liveEventEmitter
    };

    const handleOnDone = () => {
        setRunning(false);
    }

    React.useEffect(async () => {
        const waitFoGlobalBindings = async () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (window.ApiSession) {
                        return resolve();
                    }

                    waitFoGlobalBindings();
                }, 2000);
            })
        }

        const bindEventListeners = async () => {
            if (isMounted) {
                await waitFoGlobalBindings();

                liveEventEmitter.once('done', handleOnDone);

                const originalApiSession = ApiSession.default;
                const logListenerHandler = (...args) => {
                    console.log(args)
                }

                ApiSession = {
                    ...ApiSession,
                    default: (...args) => {
                        return originalApiSession(...args).then(({session, controller}) => {
                            session.log.addListener('debug', logListenerHandler)
                            return {session, controller};
                        })
                    }
                }
                console.log('done binding events')
                setIsReady(true);
            }
        }

        bindEventListeners();
        isMounted = true;

        return () => {
            liveEventEmitter.removeListener('done');
        }
    }, [])

    return <React.Fragment>
        <LiveProvider
            code={updatedCode.replace(/\n$/, '')}
            scope={scope}
            transformCode={(_code) => {
                return running ? wrapAsync(_code) : 'render(null)'
            }}
            theme={prismTheme}
            noInline={true}
            disabled={!isReady}>

            <LiveContainer
                hasTopPosition={playgroundPosition === 'top'}
                isRunning={running}
                onRunAction={() => setRunning(!running)}
                onChange={setUpdatedCode}
                disabled={!isReady}
            />
        </LiveProvider>
    </React.Fragment>

}

export default ReactLive;
