import React from 'react'
import Countdown from 'react-countdown';
import { logout, parseNearAmount, formatNearAmount } from './utils'
import NumberFormat from 'react-number-format';
import { useNavigate, useSearchParams } from "react-router-dom"

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function Bid(props) {

    const { game, setGame } = props
    const [topBidders, setTopBidders] = React.useState([]);
    const [currentBid, setCurrentBid] = React.useState("");
    const [totalBidders, setTotalBidders] = React.useState(0);
    const [bidEntry, setBidEntry] = React.useState("0.00001");
    const [buttonDisabled, setButtonDisabled] = React.useState(false)
    const [showNotification, setShowNotification] = React.useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const [transactionHash, setTransactionHash] = React.useState("");
    const navigate = useNavigate()

    React.useEffect(() => {
        const interval = setInterval(() => {
            window.contract.getTopBidders({ accountId: window.accountId })
                .then(topBiddersFromContract => {
                    setTopBidders(topBiddersFromContract)
                })
            window.contract.getTotalBidders({ accountId: window.accountId })
                .then(totalBiddersFromContract => {
                    setTotalBidders(totalBiddersFromContract)
                })
            window.contract.getGame({ accountId: window.accountId })
                .then(gameFromContract => {
                    setButtonDisabled(buttonDisabled || !gameFromContract.gameOver)
                    setGame(gameFromContract)
                })
        }, 5000)
        return () => clearInterval(interval)
    }, [topBidders])
    
    React.useEffect(() => {
        if (!window.walletConnection.isSignedIn()) {
            navigate('/', { replace: true })
        }
    }, [])

    React.useEffect(() => {
        if (game && !game.gameOver) {
            navigate('/game', { replace: true })
        }
    }, [game])

    React.useEffect(
        () => {
        const hash = searchParams.get('transactionHashes')
        if(hash) {
            searchParams.delete('transactionHashes')
            setSearchParams(searchParams, { replace: true })
            setTransactionHash(hash)
            setShowNotification(true)
            setTimeout(() => {
                setShowNotification(false)
            }, 11000)
        }
        if (window.walletConnection.isSignedIn()) {
            try {
                window.contract.getBid({ accountId: window.accountId })
                .then(currentBidFromContract => {
                    setCurrentBid(currentBidFromContract)
                })
                window.contract.getTopBidders({ accountId: window.accountId })
                .then(topBiddersFromContract => {
                    setTopBidders(topBiddersFromContract)
                })
                window.contract.getTotalBidders({ accountId: window.accountId })
                .then(totalBiddersFromContract => {
                    setTotalBidders(totalBiddersFromContract)
                })
            } catch (e) {
                throw e
            }
        }
        },
        []
    )

    const handleStartOnClick = (e) => {
        e.target.disabled = true
        if(window.walletConnection.isSignedIn()) {
            window.contract.startGame({ accountId: window.accountId })
        }
    }

    return (
        // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
        <>
        <button className="link" style={{ float: 'right' }} onClick={logout}>
            Sign out
        </button>
        <main>
            <div>
                <h1 id='wordle-title' style={{ textAlign: 'center', fontFamily: 'Abril Fatface, cursive', fontSize: '3.5em'}}>
                    <span style={{'--i':'1'}}>W</span>
                    <span style={{'--i':'2'}}>o</span>
                    <span style={{'--i':'3'}}>r</span>
                    <span style={{'--i':'4'}}>d</span>
                    <span style={{'--i':'5'}}>u</span>
                    <span style={{'--i':'6'}}>e</span>
                    <span style={{'--i':'7'}}>l</span>
                </h1>
                <div>
                    <h3>Rules:</h3>
                    <ul style={{color:'gray'}}>
                        <li>Top 2 bidders will participate in the next duel, betting for their victory before game time is up.</li>
                        <li>Other bidders get refunded their full bid.</li>
                        <li>The winner gets the total bid. Loser gets nothing.</li>
                        <li>A draw is possible when the word isn't found.</li>
                        <li>The total bid is split equally between the two bidders when a draw occurs.</li>
                        <li>If the game time is up before the game ends, the total bid is made public (can be claimed by anyone).</li>
                        <li>2% of the total bid is rewared to the contract.</li>
                    </ul>
                </div>
            </div>
            {game && <Countdown 
                date={game ? game.timestamp/1000000 + (24*60*60*1000) : Date.now() + 100000} 
                renderer={({ hours, minutes, seconds }) => {

                    const nextGameStart = game ? game.timestamp/1000000 + (24*60*60*1000) : Date.now()
                    const timeLeft = nextGameStart - Date.now()

                    if(timeLeft < 0) {
                        return (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    flexDirection: 'column',
                                }}>
                                <p className='small-info' style={{marginTop:0}}>Be the one that starts the game!</p>
                                <button
                                    onClick={handleStartOnClick}
                                    disabled={totalBidders < 2}
                                    style={{
                                        backgroundColor: '#f44336'
                                    }}>
                                    Start Game
                                </button>
                                <p className='small-info' style={{marginBottom:0}}>Costs around 0.00024 ???</p>
                            </div>
                        )
                    }

                    return (
                        <>
                        <h3>Time left until next game:</h3>
                        <p style={{
                            textAlign: 'center',
                            fontSize: '5em',
                            fontFamily: 'monospace',
                            margin: 0
                        }}>
                            {hours<10?'0':''}{hours}:
                            {minutes<10?'0':''}{minutes}:
                            {seconds<10?'0':''}{seconds}
                        </p>
                        </>
                    )
                }}
            />}
            <form onSubmit={async event => {
            event.preventDefault()

            // get elements from the form using their id attribute
            const { fieldset } = event.target.elements

            const bid = parseNearAmount(bidEntry) 

            // disable the form while the value gets updated on-chain
            fieldset.disabled = true

            try {
                if(currentBid) {
                    await window.contract.increaseBid({ 
                        amount: bid 
                    },"300000000000000",bid) 
                } else {
                    await window.contract.placeBid({
                        amount: bid
                    },"300000000000000",bid)
                }
                
            } catch (e) {
                alert(
                'Something went wrong! ' +
                'Maybe you need to sign out and back in? ' +
                'Check your browser console for more info.'
                )
                throw e
            } finally {
                // re-enable the form, whether the call succeeded or failed
                fieldset.disabled = false
            }

            }}>
            <fieldset id="fieldset">
                <label
                htmlFor="bidValue"
                style={{
                    display: 'block',
                    color: 'var(--gray)',
                    marginBottom: '0.5em'
                }}
                >
                {currentBid ? `Increase your current (${formatNearAmount(currentBid)} NEAR) bid` : 'Place your bid'}
                </label>
                <div style={{ display: 'flex' }}>
                <NumberFormat
                    style={{ flex: 1 }}
                    id="bidValue"
                    defaultValue="0.00001" 
                    onValueChange={values => {
                        const { floatValue, value} = values
                        setButtonDisabled(floatValue === 0)
                        setBidEntry(value) 
                    }}
                    fixedDecimalScale={true}
                    allowLeadingZeros={false}
                    decimalScale={5}
                    allowEmptyFormatting={true}
                    suffix=" NEAR"
                />
                <button
                    disabled={buttonDisabled}
                    style={{ borderRadius: '0 5px 5px 0' }}
                >
                    {currentBid ? 'Increase' : 'Place'}
                </button>
                </div>
            </fieldset>
            </form>
            <div>
                {topBidders.map((bidding, i) => {
                    const {first: bidder, second: amount} = bidding 
                    return (
                        <div key={i} className="bidder-container" place={i}>
                            <div className='bidder-container-number'>
                                <h2>#{i + 1}</h2>
                            </div>
                            <h2>{bidder}</h2>
                            <code>{formatNearAmount(amount)} NEAR</code>
                        </div>
                    )
                })}
            </div>
            <p className='small-info'>
                {
                    totalBidders > 0 ?
                    `${totalBidders} bidder(s) have placed bids` :
                    'No one has placed a bid yet'
                }
            </p>
        </main>
        {showNotification && <Notification transactionHash={transactionHash}/>}
        </>
    )
}

// this component gets rendered by App after the form is submitted
function Notification(props) {
    const { transactionHash } = props

    const urlPrefix = `https://explorer.${networkId}.near.org/`
    return (
        <aside>
        <a target="_blank" rel="noreferrer" href={`${urlPrefix}/accounts/${window.accountId}`}>
            {window.accountId}
        </a>
        {' '/* React trims whitespace around tags; insert literal space character when needed */}
        made a 
        {' '}
        <a target="_blank" rel="noreferrer" href={`${urlPrefix}/transactions/${transactionHash}`}>
            transaction
        </a>
        {' '}
        to
        {' '}
        <a target="_blank" rel="noreferrer" href={`${urlPrefix}/accounts/${window.contract.contractId}`}>
            {window.contract.contractId}
        </a>
        <footer>
            <div>??? Succeeded</div>
            <div>Just now</div>
        </footer>
        </aside>
    )
}
