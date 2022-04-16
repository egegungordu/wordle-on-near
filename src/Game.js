import React from 'react'
import { parseNearAmount, formatNearAmount } from './utils'
import ReactModal from 'react-modal'
import { useNavigate } from 'react-router-dom'

import getConfig from './config'
import { format } from 'near-api-js/lib/utils'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function Game(props)
{
    const { game, setGame } = props
    const urlPrefix = `https://explorer.${networkId}.near.org/`

    // call getGame every 5 seconds
    React.useEffect(() => {
        const interval = setInterval(() => {
            window.contract.getGame({ accountId: window.accountId })
                .then(gameFromContract => {
                    console.log(gameFromContract)
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

    return  (
        <main>
            <div className='live'><div className='live-blink'></div>Live</div>
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
                Total bid: {formatNearAmount(game.totalBid)} NEAR
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
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }
                }}
                >
                    <GameOver game={game}/>
            </ReactModal>
        </main>
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

    React.useEffect(() => {
        let inputWord
        if (isTurn()) {
            inputWord = [...board[game.currentRow]]
        }
        for(let i = 0; i < rows; i++) {
            const word = game.board[i] ? game.board[i].split('') : Array(cols).fill('')
            for(let j = 0; j < cols; j++) {
                board[i][j] = word[j]
            }
        }
        setBoard(board)
        setCurrentPos([game.board.length, currentPos[1]])    
        if (game.pendingWord) {
            board[game.currentRow] = game.pendingWord.split('')
            setBoard(board)
            setWaitPlay(false)
            setInputDisabled(true)
        } else {
            setInputDisabled(false)
            if(inputWord) {
                board[game.currentRow] = inputWord
            }
        }
    }, [game.board])

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
        console.log(`keydown: ${e.key} ${lowerCase} ${isLetter}`)
        if (e.key === 'Backspace') {
            if (currentColumn >= 0) {
                board[currentRow][currentColumn] = ''
                setBoard(board)
                setCurrentPos([currentRow, currentColumn - 1])
                setWasBackspace(true)
                console.log("set word backspace")
            }
        } else if (isLetter) {
            if (currentColumn + 1 < cols) {
                currentColumn += 1
                board[currentRow][currentColumn] = e.key
                setBoard(board)
                setCurrentPos([currentRow, currentColumn])
                setWasBackspace(false)
                console.log("set word letter")
            }
        } else if (e.key === 'Enter') {
            console.log(currentColumn, cols)
            if (currentColumn === cols - 1) {
                setInputDisabled(true)
                setCurrentPos([currentRow, currentColumn])
                if(window.walletConnection.isSignedIn()) {
                    setWaitPlay(true)
                    window.contract.playGame({
                        accountId: window.accountId,
                        word: board[currentRow].join(''),
                    })
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
            player={game.pendingWord == '' ? (game.turn ? "1" : "2") : undefined}
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
            }}
            >
            {board.map((row, rowIndex) => {
                const similarityArray = game.similarityBoard.length > rowIndex ? 
                    game.similarityBoard[rowIndex].split('') :
                    Array(cols).fill('bb')
                const isEvaluating = (game.pendingWord || waitPlay) && game.currentRow === rowIndex
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

    return (
        <div className="game-over">
            <h1 style={{margin: 0, fontFamily: 'Abril Fatface, cursive'}}>Game Over</h1>
            {winner ?
                <p>{winner} wins the total bid of {formatNearAmount(game.totalBid)} NEAR</p> :
                <p>Draw! Players split the total bid, each getting {formatNearAmount(game.totalBid)} NEAR</p>
            }
            <button onClick={() => {
                navigate('bid')
            }}>Return to Bidding</button>
        </div>
    )
}
