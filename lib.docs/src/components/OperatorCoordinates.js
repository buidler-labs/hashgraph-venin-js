/* eslint-env browser */

import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';

export const OperatorId = () => (
  <BrowserOnly fallback={<code>unknown</code>}>
    {() => 
      window.StratoOperator.network === 'testnet' ? 
        <a href={ "https://testnet.dragonglass.me/hedera/accounts/" + window.StratoOperator.accountId }>
          <code>
            {window.StratoOperator.accountId}
          </code>
        </a> 
        : 
        <code>
          {window.StratoOperator.accountId}
        </code>
    }
  </BrowserOnly>
);

export const OperatorNetwork = () => (
  <BrowserOnly fallback={<code>unknown</code>}>
    {() => <code>{window.StratoOperator.network}</code> }
  </BrowserOnly>
);
