/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import {LiveProvider, LiveEditor, LiveError, LivePreview} from 'react-live';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {usePrismTheme} from '@docusaurus/theme-common';
import styles from './styles.module.css';
import useIsBrowser from '@docusaurus/useIsBrowser';

function Header({children}) {
  return <div className={clsx(styles.playgroundHeader)}>{children}</div>;
}

function LivePreviewLoader() {
  // Is it worth improving/translating?
  return <div>Loading...</div>;
}

function ResultWithHeader() {
  return (
    <>
      <Header>
        {/* <Translate
          id="theme.Playground.result"
          description="The result label of the live codeblocks">
          Result
        </Translate> */}
        <button style={{ padding: 8, cursor: 'pointer', backgroundColor: 'green' }} onClick={() => alert('hey!')}>Run</button>
      </Header>
      {/* https://github.com/facebook/docusaurus/issues/5747 */}
      <div className={styles.playgroundPreview}>
        <BrowserOnly fallback={<LivePreviewLoader />}>
          {() => (
            <>
              <LivePreview />
              <LiveError />
            </>
          )}
        </BrowserOnly>
      </div>
    </>
  );
}

function ThemedLiveEditor() {
  const isBrowser = useIsBrowser();
  return (
    <LiveEditor
      // We force remount the editor on hydration,
      // otherwise dark prism theme is not applied
      key={isBrowser}
      className={styles.playgroundEditor}
    />
  );
}

function EditorWithHeader() {
  return (
    <>
      <Header>
        <Translate
          id="theme.Playground.liveEditor"
          description="The live editor label of the live codeblocks">
          Live Editor
        </Translate>
      </Header>
      <ThemedLiveEditor />
    </>
  );
}

function wrapAsync(code) {
  return `(async function () { ${code} })();`
}

export default function Playground({children, transformCode, ...props}) {
  const {
    siteConfig: {
      themeConfig: {
        liveCodeBlock: {playgroundPosition},
      },
    },
  } = useDocusaurusContext();
  const prismTheme = usePrismTheme();

  return (
    <div className={styles.playgroundContainer}>
      <LiveProvider
        code={children.replace(/\n$/, '')}
        transformCode={transformCode || ((code) => wrapAsync(code))}
        theme={prismTheme}
        noInline={true}
        {...props}>
        {playgroundPosition === 'top' ? (
          <>
            <ResultWithHeader />
            <EditorWithHeader />
          </>
        ) : (
          <>
            <EditorWithHeader />
            <ResultWithHeader />
          </>
        )}
      </LiveProvider>
    </div>
  );
}
