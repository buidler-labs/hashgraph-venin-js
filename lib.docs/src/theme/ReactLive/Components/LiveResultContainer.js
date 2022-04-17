import * as React from "react";
import BrowserOnly from "@docusaurus/core/lib/client/exports/BrowserOnly";
import { LiveContext } from "react-live";
import { renderToString } from "react-dom/server";
import styles from "../../Playground/styles.module.css";

function LivePreviewLoader() {
  return <div>Loading...</div>;
}

const LiveResultContainer = ({ isRunning, error, errorCallback }) => {
  return (
    <div>
      <BrowserOnly fallback={<LivePreviewLoader />}>
        {() => (
          <>
            <LogsResult isRunning={isRunning} />
            <ErrorResult error={error} errorCallback={errorCallback} />
          </>
        )}
      </BrowserOnly>
    </div>
  );
};

const LogsResult = ({ isRunning }) => {
  const context = React.useContext(LiveContext);
  const [logs, setLogs] = React.useState();
  const { element: Element } = context;

  React.useEffect(() => {
    const logsHTML = Element ? renderToString(<Element />) : null;

    if (logsHTML) {
      setLogs(logsHTML);
    }
  }, [context]);

  const LiveLogsContainer = Element ? (
    <div className={styles.playgroundPreview}>
      <Element />
    </div>
  ) : null;
  const LogsResultContainer = logs ? (
    <div className={styles.playgroundPreview}>
      <div dangerouslySetInnerHTML={{ __html: logs }} />
    </div>
  ) : null;

  return isRunning ? LiveLogsContainer : LogsResultContainer;
};

const ErrorResult = ({ error, errorCallback }) => {
  const context = React.useContext(LiveContext);

  React.useEffect(() => {
    if (context.error) {
      errorCallback(context.error);
    }
  }, [context]);

  return error ? <pre style={{ color: "red" }}>{error}</pre> : null;
};

export default LiveResultContainer;
