import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'


// BrowserRouter va SOLO en App.jsx — no duplicar aquí
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)