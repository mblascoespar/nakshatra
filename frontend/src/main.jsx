import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import App from './App'
import LoginPage from './components/LoginPage'
import './index.css'

function AuthGate() {
  const [user, setUser] = useState(undefined)  // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return unsubscribe
  }, [])

  // Loading state: show nothing until auth state is determined
  if (user === undefined) {
    return null
  }

  // Not logged in: show login page
  if (!user) {
    return <LoginPage />
  }

  // Logged in: show app
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate />
  </React.StrictMode>
)
