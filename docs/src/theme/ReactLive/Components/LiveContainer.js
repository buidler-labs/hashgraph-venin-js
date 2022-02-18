import LiveResultContainer from "./LiveResultContainer";
import LiveEditorContainer from "./LiveEditorContainer";
import * as React from "react";

const LiveContainer = ({isRunning, onRunAction, onChange, hasTopPosition, disabled}) => {
    const contaienerElements = [
        {
            name: 'editor',
            Component: LiveEditorContainer,
            props: {
                isRunning,
                onRunAction,
                onChange,
                disabled
            }
        },
        {
            name: 'result',
            Component: LiveResultContainer,
            props: {
                isRunning
            }
        }
    ]

    const toRender = hasTopPosition
        ? contaienerElements.reverse()
        : contaienerElements

    return toRender.map(element => {
        const {Component, props, name} = element;

        return <Component key={`${name}-container`} {...props}/>
    })
}

export default LiveContainer;