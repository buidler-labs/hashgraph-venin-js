/* eslint-env browser */

import "./ConnectWallet.style.css";
import React from "react";

const HASHCONNECT_DATA_KEY = "hashpack-data";

export const HeadStarterConnectWallet = () => {
  const tryToSetWallet = (wallet) => {
    if (!wallet) return;

    const fetchBalance = async () => {
      const _balance = await wallet.getAccountBalance();
      return _balance && _balance.hbars;
    };

    fetchBalance()
      .then((bal) => {
        setState((_prevState) => ({
          balance: bal.toString(),
          connected: true,
          wallet,
        }));
      })
      .catch(() => {
        setState((prevState) => ({
          ...prevState,
          connected: true,
          wallet,
        }));
      });
  };

  const [state, setState] = React.useState({
    balance: null,
    connected: false,
    wallet: null,
  });

  const handleOnConnect = async () => {
    const operator = await fetch(
      "https://eu2.contabostorage.com/963797152a304f4bb7f75cc0af884bd7:buidler-labs/projects/hedera-strato-js/docs-operator.json"
    )
      .then((docsOperatorResponse) =>
        docsOperatorResponse.body.getReader().read()
      )
      .then(({ value }) => new TextDecoder().decode(value))
      .then((rawDocsOperator) => JSON.parse(rawDocsOperator));

    try {
      await window.connectWallet(operator.network);
      setState((prevState) => ({
        ...prevState,
        connected: true,
      }));
    } catch (e) {
      alert(e);
    }
  };

  const handleOnDisconnect = () => {
    window.disconnectWallet();

    setState({
      balance: null,
      connected: false,
      wallet: null,
    });
  };

  window.addEventListener("message", ({ data: key }) => {
    if (key !== "WalletLoaded") return;

    tryToSetWallet(window["hedera"]);
  });
  if (!state.wallet) {
    tryToSetWallet(window["hedera"]);
  }

  window.addEventListener("storage", (e) => {
    if (e.key === HASHCONNECT_DATA_KEY && !e.newValue) {
      window.disconnectWallet();
    }
  });

  return (
    <center style={{ margin: "16px" }}>
      {state.connected && state.wallet ? (
        <ConnectedStats
          accountId={state.wallet.getAccountId().toString() || ""}
          balance={state.balance}
          onDisconnect={handleOnDisconnect}
        />
      ) : (
        <button className="wallet-connect connect" onClick={handleOnConnect}>
          CONNECT WALLET
        </button>
      )}
    </center>
  );
};

const ConnectedStats = ({ accountId, balance, onDisconnect }) => {
  return (
    <div className="connected-stats">
      <div className="info">
        <span className="id">{accountId}</span>
        <span className="balance">{balance}</span>
      </div>
      <button className="wallet-connect disconnect" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
};
