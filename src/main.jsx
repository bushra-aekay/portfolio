// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Note: This path should be correct if App.jsx is in the root
import './index.css' // Import your global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)