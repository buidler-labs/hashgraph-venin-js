import LiveResultContainer from "./LiveResultContainer";
import LiveEditorContainer from "./LiveEditorContainer";
import * as React from "react";

const LiveContainer = ({hasTopPosition, ...props}) => {
    const contaienerElements = [
        {
            name: 'editor',
            Component: LiveEditorContainer,
            props
        },
        {
            name: 'result',
            Component: LiveResultContainer,
            props
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