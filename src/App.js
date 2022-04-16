import 'regenerator-runtime/runtime'
import React from 'react'
import Game from './Game'
import Bid from './Bid'
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  useNavigate
} from "react-router-dom";

import './global.css'
import { render } from 'react-dom/cjs/react-dom.production.min';

export default function App() {

  const [game, setGame] = React.useState(null)

  React.useEffect(
    () => {
      if (window.walletConnection.isSignedIn()) {
        window.contract.getGame({ accountId: window.accountId })
          .then(gameFromContract => {
            setGame(gameFromContract)
          })
      }
    },
    []
  )

    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Redirect />} />
          <Route path="bid" element={
            <Bid game={game} setGame={setGame} />
          } />
          <Route path="game" element={
            <Game game={game} setGame={setGame} />
          } />
        </Routes>
      </BrowserRouter>
    )
}


function Redirect() {

  const navigate = useNavigate()

  React.useEffect(() => {
    navigate('/bid', { replace: true })
  }, [])

  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  )
}