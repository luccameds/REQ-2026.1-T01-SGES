import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryProvider } from './app/providers/QueryProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>,
)
