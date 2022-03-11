/* eslint-env browser */

import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

export const HeadStarterConnectWallet = () => (
  <BrowserOnly fallback={<p>Wallet Button</p>}>
    {() =>
      <center style={{margin: "16px"}}>
        <button className="btn btn-light text-dark"
          onClick={() => window.connectWallet(window.StratoOperator.network)}
          style={{
            backgroundColor: '#58c4cc',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            margin: 'auto 0',
            padding: '0.65rem 1rem',
          }}
          onClick={() => window.connectWallet(window.StratoOperator.network)}>
            CONNECT WALLET
        </button>
      </center>
    }
  </BrowserOnly>
);
