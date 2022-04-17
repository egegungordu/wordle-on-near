import React from 'react'
import { formatNearAmount } from './utils'
import ReactModal from 'react-modal'
import { useNavigate } from 'react-router-dom'
import Confetti from 'react-confetti'

import getConfig from './config'
import Countdown from 'react-countdown';
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function Game(props)
{
    const { game, setGame } = props
    const urlPrefix = `https://explorer.${networkId}.near.org/`
    const [playConfetti, setPlayConfetti] = React.useState(true)

    // call getGame every 5 seconds
    React.useEffect(() => {
        if(game && game.gameOver){
            setTimeout(() => {
                setPlayConfetti(false)
            },200)
        }
        const interval = setInterval(() => {
            window.contract.getGame({ accountId: window.accountId })
                .then(gameFromContract => {
                    setGame(gameFromContract)
                })
        }, 5000)
        return () => clearInterval(interval)
    }, [game])

    if (!game) {
        return <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <h1>
                <span role="img" aria-label="loading">⏳</span>
            </h1>
        </div>
    }

    const gameEndingTime = (game.timestamp/1000000+game.maxGameTime/1000000)

    return  (
        <>
            <main>
                <Confetti
                    recycle={game.gameOver && playConfetti}
                />
                <div className='live'><div className='live-blink'></div>Live</div>
                <div className='countdown'
                    style={{
                        position: 'absolute',
                        top: '1em',
                        left: '2em',
                    }}>
                </div>
                <h1 style={{ textAlign: 'center', position: 'relative'}}>
                    Ongoing <span style={{fontFamily: 'Abril Fatface, cursive'}}>Worduel</span> 
                </h1>
                <p style={{textAlign:'center'}}>
                    Duel between 
                    {' '}
                    <a style={{color:'var(--player-blue)'}}target="_blank" rel="noreferrer" href={`${urlPrefix}/accounts/${game.player1}`}>
                        {game.player1}
                    </a>
                    {' '}
                    and
                    {' '}
                    <a style={{color:'var(--player-red)'}}target="_blank" rel="noreferrer" href={`${urlPrefix}/accounts/${game.player2}`}>
                        {game.player2}
                    </a>
                </p>
                <p style={{textAlign:'center'}}>
                    Total bid: {formatNearAmount(game.totalBid)} Ⓝ
                </p>

                <WordleBoard game={game}/>
                <ReactModal 
                    ariaHideApp={false}
                    isOpen={game.gameOver}
                    contentLabel="Game Over"
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(0,0,0,0)',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                        },
                        overlay: {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                        }
                    }}
                    >
                        <GameOver game={game}/>
                </ReactModal>
            </main>
            <footer style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                right: '0',
                textAlign: 'center',
                padding: '0.3rem',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0,0,0,0.3)',
            }}>
                <Countdown 
                    date={gameEndingTime} 
                    renderer={({ hours, minutes, seconds }) => {
                        return (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                
                            }}>
                                <h3 style={{
                                    fontSize: '0.8rem',
                                    marginRight: '0.5rem',
                                }}>Time until bid release:</h3>
                                <p style={{
                                    textAlign: 'center',
                                    fontSize: '5em',
                                    fontFamily: 'monospace',
                                    fontSize: '2em',
                                    margin: 0
                                }}>
                                    {hours<10?'0':''}{hours}:
                                    {minutes<10?'0':''}{minutes}:
                                    {seconds<10?'0':''}{seconds}
                                </p>
                            </div>
                        )
                    }}
                />
            </footer>
        </>
    )
}

function WordleBoard(props) {

    const { game } = props
    const { wordSize: cols, wordCount: rows } = game
    const [board, setBoard] = React.useState(Array.from(Array(rows), () => Array(cols).fill('')))
    const [currentPos, setCurrentPos] = React.useState([0, -1])
    const [inputDisabled, setInputDisabled] = React.useState(false)
    const [waitPlay, setWaitPlay] = React.useState(false)
    const [wasBackspace, setWasBackspace] = React.useState(false)
    const [retries, setRetries] = React.useState(game.retries)

    React.useEffect(() => {
        let inputWord
        if (game.gameOver) {
            setWaitPlay(false)
        }
        if(isTurn()){
            inputWord = [...board[game.currentRow]]
        }
        for(let i = 0; i < rows; i++) {
            const word = game.board[i] ? game.board[i].split('') : Array(cols).fill('')
            board[i] = word
        }
        setCurrentPos([game.board.length, currentPos[1]])    
        if(retries < game.retries){
            inputWord = null
            setWaitPlay(false)
            const wordleRowElement = document.getElementsByClassName('wordle-row')[game.currentRow]
            wordleRowElement.classList.add('shake')
            setCurrentPos([currentPos[0], -1])
        }
        if (isTurn()) {
            if(inputWord){
                board[game.currentRow] = inputWord
            }
            if(board[game.currentRow][0] === '') {
                setCurrentPos([game.board.length, -1])
            }
            setInputDisabled(false)
        } else{
            setWaitPlay(false)
        }
        setRetries(game.retries)
        setBoard(board)
    }, [game])

    const isTurn = () => {
        return (game.player1 === window.accountId) == game.turn
    }

    const handleKeyDown = (e) => {
        if (!isTurn() || inputDisabled) {
            return
        }
        let currentRow = currentPos[0]
        let currentColumn = currentPos[1]
        const lowerCase = e.key.toLowerCase()
        const isLetter = lowerCase.length === 1 && (lowerCase >= "a" && lowerCase <= "z")
        if (e.key === 'Backspace') {
            if (currentColumn >= 0) {
                board[currentRow][currentColumn] = ''
                setBoard(board)
                setCurrentPos([currentRow, currentColumn - 1])
                setWasBackspace(true)
            }
        } else if (isLetter) {
            if (currentColumn + 1 < cols) {
                currentColumn += 1
                board[currentRow][currentColumn] = e.key
                setBoard(board)
                setCurrentPos([currentRow, currentColumn])
                setWasBackspace(false)
            }
        } else if (e.key === 'Enter') {
            if (currentColumn === cols - 1) {
                setInputDisabled(true)
                setCurrentPos([currentRow, currentColumn])
                if(window.walletConnection.isSignedIn()) {
                    setWaitPlay(true)
                    window.contract.playGame({
                        accountId: window.accountId,
                        word: board[currentRow].join(''),
                    },"60000000000000","")
                    .then(() => {
                    })
                    .catch(console.error)
                }
            }
        }
    }

    return (
        <div 
            className="wordle-board"
            player={game.turn ? "1" : "2"}
            onKeyDown={handleKeyDown}
            tabIndex="-1"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gap: '5px',
                width: 'calc(70px * ' + cols + ')',
                height: 'calc(70px * ' + rows + ')',
                margin: '0 auto',
                userSelect: 'none',
                marginBottom: '6em'
            }}
            >
            {board.map((row, rowIndex) => {
                const similarityArray = game.similarityBoard.length > rowIndex ? 
                    game.similarityBoard[rowIndex].split('') :
                    Array(cols).fill('bb')
                const isEvaluating = waitPlay && game.currentRow === rowIndex
                return (
                    <div 
                        className='wordle-row'
                        isevaluating={isEvaluating ? 'true' : undefined}
                        key={rowIndex}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${cols}, 1fr)`,
                            gap: '5px'
                        }}>
                        {row.map((letter, colIndex) => {
                            const isEditing = isTurn() && currentPos[0] === rowIndex && currentPos[1] === colIndex
                            const isAdded = isTurn() && currentPos[0] === rowIndex && currentPos[1] === colIndex && !wasBackspace
                            return (
                                <div style={{animationDelay:`${0.2*colIndex}s,0s`,animationDuration:`0.8s,${0.2*colIndex+0.4}s`}} isediting={isEditing ? 'true' : undefined} className={`wordle-cell ${isAdded ? 'bounced-cell' : ''}`} format={similarityArray[colIndex]} key={colIndex}>
                                    {letter}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

function GameOver(props) {

    const { game } = props
    const navigate = useNavigate()
    const winner = game.winner
    const wasStolen = winner != game.player1 && winner != game.player2 && winner != ''

    const winnerJSX = (winner ? 
        <p>{winner} wins the total bid of {formatNearAmount(game.totalBid)} NEAR</p> :
        <p>Draw! Players split the total bid, each getting {formatNearAmount(game.totalBid)} NEAR</p>
    )

    const stolenJSX = (
        <p>{winner} stole the bid of {formatNearAmount(game.totalBid)} NEAR</p>
    )

    return (
        <div className="game-over">
            <h1 style={{margin: 0, fontFamily: 'Abril Fatface, cursive'}}>Game Over</h1>
            {winner && !wasStolen ? <p>The word was: <span style={{color: 'var(--wordle-green)', textTransform: 'uppercase'}}>{game.board[game.currentRow]}</span></p> : <p>The word was not found</p>}
            {wasStolen ? stolenJSX : winnerJSX}
            <button onClick={() => {
                navigate('bid')
            }}>Return to Bidding</button>
        </div>
    )
}
