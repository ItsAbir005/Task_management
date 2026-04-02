import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { GlobleProvider } from './context/GlobleContext'


createRoot(document.getElementById('root')!).render(
  <GlobleProvider>
    <BrowserRouter>
    <App />
  </BrowserRouter>
  </GlobleProvider>,
)
