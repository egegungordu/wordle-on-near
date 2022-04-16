import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initContract } from './utils'

window.nearInitPromise = initContract()
  .then(() => {
    const root = ReactDOM.createRoot(
      document.querySelector('#root')
    )
    root.render(<App />)
  })
  .catch(console.error)