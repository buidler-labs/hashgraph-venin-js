/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';
import ReactLive from "../ReactLive/ReactLive";

export default function Playground({children}) {
    const {
        siteConfig: {
            themeConfig: {
                liveCodeBlock: {playgroundPosition},
            },
        },
    } = useDocusaurusContext();

    return (
        <div className={styles.playgroundContainer}>
            <ReactLive playgroundPosition={playgroundPosition}>{children}</ReactLive>
        </div>
    );
}
