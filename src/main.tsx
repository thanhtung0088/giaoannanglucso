import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// File này có nhiệm vụ gắn toàn bộ ứng dụng React vào thẻ <div id="root">
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)