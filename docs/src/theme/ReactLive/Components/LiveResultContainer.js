import styles from "../../Playground/styles.module.css";
import BrowserOnly from "@docusaurus/core/lib/client/exports/BrowserOnly";
import {LiveContext, LiveError, LivePreview} from "react-live";
import * as React from "react";
import {renderToString} from "react-dom/server";

function LivePreviewLoader() {
    // Is it worth improving/translating?
    return <div>Loading...</div>;
}

const LiveResultContainer = ({running}) => {
    return <div className={styles.playgroundPreview}>
        <BrowserOnly fallback={<LivePreviewLoader/>}>
            {() => (
                <>
                    <LogsResult isRunning={running}/>
                    <LiveError/>
                </>
            )}
        </BrowserOnly>
    </div>
}

const LogsResult = ({isRunning}) => {
    const context = React.useContext(LiveContext)
    const [logs, setLogs] = React.useState();
    const {element: Element} = context;

    React.useEffect(() => {
        const logsHTML = renderToString(<Element/>)

        if(logsHTML){
            setLogs(logsHTML);
        }
    }, [context])

    return isRunning
        ? (Element ? <Element/> : null)
        : (logs ? <div dangerouslySetInnerHTML={{__html: logs}}/> : null)
}

export default LiveResultContainer;