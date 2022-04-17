import * as React from "react";
import LiveContainer from "./Components/LiveContainer";
import LiveEventEmitter from "../ReactLive/LiveEventEmitter";
import { LiveProvider } from "react-live";
import LoadingSpinner from "./Components/LoadingSpinner";
import clsx from "clsx";
import styles from "../Playground/styles.module.css";
import { usePrismTheme } from "@docusaurus/theme-common";

const wrapAsync = (code, containerKey) => {
  return `  
        const originalApiSession = ApiSession.default;
        const originalLogger = console.log;
        
        const argToLogResult = (_arg) => {
            try{
                if(_arg.logLevel){
                    return {
                        logLevel: _arg.logLevel,
                        message: _arg.message
                    }
                }else{
                    let _parsed = _arg.toString();
                    
                    if(_arg._isBigNumber){
                        _parsed = <span>
                            {_parsed}
                            <span className={ \`${clsx(
                              styles.playgroundLogItem,
                              styles.internal,
                              styles.logHint
                            )}\` }>(BigNumber)</span>
                        </span>;    
                    }
                    
                    return _parsed
                }
            }catch (e) {
              console.error(e)
            }
        }
        
        const argToStringMapping = _arg => {
            if(!_arg){
                 return null;   
            }
            
            if(typeof _arg === 'string'){
                return _arg;
            } else{
                return argToLogResult(_arg);
            }
        }
        
        const addEventListeners = (_logger) => {
            _logger.addListener('debug', (message) => logListenerHandler('debug', message))
            _logger.addListener('error', (message) => logListenerHandler('error', message))
            _logger.addListener('info', (message) => logListenerHandler('info', message))
            _logger.addListener('warn', (message) => logListenerHandler('warn', message))
        }
        
        const removeEventListeners = (_logger) => {
            _logger.removeListener('debug', logListenerHandler);
            _logger.removeListener('error', logListenerHandler);
            _logger.removeListener('info', logListenerHandler);
            _logger.removeListener('warn', logListenerHandler);
        }
        
        const logListenerHandler = (logLevel, message) => console.log({logLevel, message}); 
        
        ApiSession = {
            ...ApiSession,
            default: (...args) => {
                return originalApiSession(...args).then(({session, controller}) => {
                    if(!window.originalStratoSession) {
                        window.originalStratoSession = session;
                        addEventListeners(session.log);
                    }
                    
                    return {session, controller};
                })
            }
        }
    
        let logs = [];
        console.log = (...args) => {
            if(Array.isArray(args)) {
                args = args
                .map(argToStringMapping)
                .filter(Boolean)
        
                logs = [...logs, ...args]
            }else{
                if(!args) return;
                const log = argToLogResult(args);

                logs = [...logs, log]
            }
            
            const LogLevelBadge = ({text}) => {
                const _styles = ${JSON.stringify(styles)};
                const logClassName = _styles.playgroundLogItem;
                const logBadgeClassName = _styles[text];
                
                return <span className={logClassName + ' ' + logBadgeClassName}>{text}</span>
            }
            
            render(<div className={'${styles.playgroundLogsContainer}'}>
                {logs.map((log, index) => {
                    { 
                        return log.logLevel 
                            ? <p key={index} className={ \`${clsx(
                              styles.playgroundLogItem,
                              styles.internal
                            )}\` }>
                                    <LogLevelBadge text={log.logLevel}/> - {log.message}
                              </p>
                            : <p key={index} className={ \`${clsx(
                              styles.playgroundLogItem,
                              styles.userInput
                            )}\` }>{log}</p>
                    }
                })}
            </div>) 
        };
 
        (async function () {
            render(<Loader/>); 
            
            try{
                 ${code}
            }catch (error) {
                console.log(null) //in case of error, clear the current logs result
                console.error(error); // also display the error on the console for easy debugging
                
                liveEventEmitter.emit('executionError', {
                    error: error,
                    emitterKey: '${containerKey}' 
                });
            }
            
            if(window.originalStratoSession) {
                removeEventListeners(originalStratoSession.log);
                originalStratoSession = null;
            }
            
            console.log = originalLogger;
            liveEventEmitter.emit('done');
        })();
    `;
};

const liveEventEmitter = new LiveEventEmitter();

const ReactLive = ({ children: code, playgroundPosition, ...props }) => {
  const [disabled, setDisabled] = React.useState(true);
  const [updatedCode, setUpdatedCode] = React.useState(code);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState(null);
  const isMounted = React.useRef(false);

  const prismTheme = usePrismTheme();
  const scope = {
    Loader: LoadingSpinner,
    liveEventEmitter,
  };

  const onRunHandler = (emitterKey) => {
    if (emitterKey === props.containerKey) {
      setError(null);
    }

    setRunning(emitterKey === props.containerKey);
    setDisabled(emitterKey !== props.containerKey);
  };

  const onDoneHandler = () => {
    setRunning(false);
    setDisabled(false);
  };

  const onErrorHandler = (error) => {
    setError(error);
    liveEventEmitter.emit(`done`);
  };

  const executionErrorHandler = ({ error, emitterKey }) => {
    if (emitterKey === props.containerKey) {
      setRunning(false);
      onErrorHandler(error.toString());
    }
  };

  React.useEffect(() => {
    isMounted.current = true;

    const waitFor = function (property, callback) {
      if (window[property]) {
        callback();
      } else {
        setTimeout(() => {
          waitFor(property, callback);
        }, 500);
      }
    };

    const bindEventListeners = async () => {
      waitFor("ApiSession", () => {
        if (isMounted.current) {
          liveEventEmitter.on(`running`, onRunHandler);
          liveEventEmitter.on(`done`, onDoneHandler);
          liveEventEmitter.on("executionError", executionErrorHandler);

          setDisabled(false);
        }
      });
    };

    const unbindEventListeners = () => {
      liveEventEmitter.removeListener("running", onRunHandler);
      liveEventEmitter.removeListener("done", onDoneHandler);
      liveEventEmitter.removeListener("executionError", executionErrorHandler);
    };

    bindEventListeners();

    return () => {
      isMounted.current = false;
      unbindEventListeners();
    };
  }, [props.categoryKey]);

  return (
    <React.Fragment>
      <LiveProvider
        code={updatedCode.replace(/\n$/, "")}
        scope={scope}
        transformCode={(_code) =>
          running ? wrapAsync(_code, props.containerKey) : "render(null)"
        }
        theme={prismTheme}
        noInline={true}
        disabled={disabled}
      >
        <LiveContainer
          hasTopPosition={playgroundPosition === "top"}
          isRunning={running}
          onRunAction={() =>
            liveEventEmitter.emit("running", props.containerKey)
          }
          onChange={setUpdatedCode}
          disabled={disabled}
          error={error}
          errorCallback={onErrorHandler}
          {...props}
        />
      </LiveProvider>
    </React.Fragment>
  );
};

export default ReactLive;
