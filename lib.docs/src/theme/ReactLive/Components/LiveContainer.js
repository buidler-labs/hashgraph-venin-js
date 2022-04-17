import * as React from "react";
import LiveEditorContainer from "./LiveEditorContainer";
import LiveResultContainer from "./LiveResultContainer";

const LiveContainer = ({ hasTopPosition, ...props }) => {
  const containerElements = [
    {
      Component: LiveEditorContainer,
      name: "editor",
      props,
    },
    {
      Component: LiveResultContainer,
      name: "result",
      props,
    },
  ];

  const toRender = hasTopPosition
    ? containerElements.reverse()
    : containerElements;

  return toRender.map((element) => {
    const { Component, props, name } = element;

    return <Component key={`${name}-container`} {...props} />;
  });
};

export default LiveContainer;
