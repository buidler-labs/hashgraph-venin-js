/* eslint-env browser */

import './ConnectWallet.style.css';
import React from 'react';

const HASHCONNECT_DATA_KEY = 'hashpack-data';

export const HeadStarterConnectWallet = () => {
  const operator = window.StratoOperator;
  const tryToSetWallet = (wallet) => {
    if (!wallet) return;

    const fetchBalance = async () => {
      const _balance = await wallet.getAccountBalance();
      return _balance && _balance.hbars;
    }
    
    fetchBalance()
      .then(bal => {
        setState(_prevState => ({
          balance: bal.toString(),
          connected: true,
          wallet,
        }))
      })
      .catch(() => {
        setState(prevState => ({
          ...prevState,
          connected: true,
          wallet,
        }))
      });
  };

  const [state, setState] = React.useState({
    balance: null,
    connected: false,
    wallet: null,
  })

  const handleOnConnect = async () => {
    window.connectWallet(operator.network)
      .then(() => {
        setState(prevState => ({
          ...prevState,
          connected: true
        }))
      })
      .catch(err => {
        console.error(err)
      })
  }

  const handleOnDisconnect = () => {
    window.disconnectWallet();

    setState({
      balance: null,
      connected: false,
      wallet: null,
    })
  }

  window.addEventListener("message", ({ data: key }) => {
    if (key !== "WalletLoaded") return;

    tryToSetWallet(window['hedera']);
  });
  if (!state.wallet) {
    tryToSetWallet(window['hedera'])
  }

  window.addEventListener("storage",(e) => {
    if(e.key === HASHCONNECT_DATA_KEY && !e.newValue) {
      window.disconnectWallet();
    }
  });

  return <center style={{margin: "16px"}}>
    {
      state.connected && state.wallet
        ? <ConnectedStats
          accountId={state.wallet.getAccountId().toString() || ''}
          balance={state.balance}
          onDisconnect={handleOnDisconnect}
        />
        : <button
          className="wallet-connect connect"
          onClick={handleOnConnect}>
                            CONNECT WALLET
        </button>
    }
  </center>
};

const ConnectedStats = ({accountId, balance, onDisconnect}) => {
  return <div className="connected-stats">
    <div className="info">
      <span className="id">{accountId}</span>
      <span className="balance">{balance}</span>
    </div>
    <button className="wallet-connect disconnect" onClick={onDisconnect}>Disconnect</button>
  </div>
}
