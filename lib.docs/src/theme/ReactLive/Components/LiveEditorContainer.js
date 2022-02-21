import * as React from "react";
import Translate from "@docusaurus/core/lib/client/exports/Translate";
import useIsBrowser from "@docusaurus/core/lib/client/exports/useIsBrowser";
import {LiveEditor} from "react-live";
import styles from "../../Playground/styles.module.css";
import clsx from "clsx";

const LiveEditorContainer = ({isRunning, onRunAction, onChange, disabled}) => {
    return (
        <>
            <Header>
                <Translate
                    id="theme.Playground.liveEditor"
                    description="The live editor label of the live codeblocks">
                    Live Editor
                </Translate>
            </Header>
            <ThemedLiveEditor onChange={onChange} disabled={isRunning}/>
            <Header>
                <button
                    className={styles.playgroundRunButton}
                    onClick={onRunAction} disabled={disabled || isRunning}>
                    RUN
                </button>
            </Header>
        </>
    );
}

function ThemedLiveEditor({onChange, disabled}) {
    const isBrowser = useIsBrowser();
    return (
        <LiveEditor
            key={isBrowser}
            className={styles.playgroundEditor}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

function Header({children}) {
    return <div className={clsx(styles.playgroundHeader)}>{children}</div>;
}



export default LiveEditorContainer;