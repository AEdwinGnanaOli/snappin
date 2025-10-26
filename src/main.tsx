import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import 'react-chat-elements/dist/main.css' // React Chat Elements styles
import './styles/react-chat-elements-theme.css' // Custom theme overrides
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
