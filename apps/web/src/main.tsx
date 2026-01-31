/**
 * Fil: main.tsx
 * Utvikler(e): Vebjørn Baustad
 * Beskrivelse: Inngangspunkt for React-applikasjonen som initialiserer
 * appen og renderer rot-komponenten.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
