/* eslint-env browser */

import BrowserOnly from '@docusaurus/BrowserOnly';
import React from 'react';
import './ConnectWallet.style.css';

const HASHCONNECT_DATA_KEY = 'hashconnectData';

export const HeadStarterConnectWallet = () => {
    const operator = window.StratoOperator;
    const [state, setState] = React.useState({
        connected: false,
        wallet: null,
        balance: null
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
            connected: false,
            wallet: null,
            balance: null
        })
    }

    React.useEffect(() => {
        const _wallet = window['hedera'];

        const fetchBalance = async () => {
            const _balance = await _wallet.getAccountBalance();
            return _balance && _balance.hbars;
        }

        if(_wallet) {
            fetchBalance()
                .then(bal => {
                    setState(prevState => ({
                        wallet: _wallet,
                        connected: true,
                        balance: bal.toString()
                    }))
                })
                .catch(() => {
                    setState(prevState => ({
                        ...prevState,
                        wallet: _wallet,
                        connected: true
                    }))
                });
        }
    }, [window['hedera']])

    React.useEffect(() => {
        window.addEventListener("storage",(e) => {
            if(e.key === HASHCONNECT_DATA_KEY && e.newValue === null) {
                clearPairings();
            }
        });
    }, [])

    return <BrowserOnly fallback={<p>Wallet Button</p>}>
        {() =>
            <center style={{margin: "16px"}}>
                {
                    state.connected && state.wallet
                        ? <ConnectedStats
                            accountId={state.wallet.accountId.toString() || ''}
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
        }
    </BrowserOnly>
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
