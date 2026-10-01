import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export const roleMeta = {
  hotel: { label: 'Food Provider', org: 'GreenLeaf Hotel', email: 'hotel@foodwise.ai', password: 'demo123' },
  ngo: { label: 'NGO', org: 'Hope Foundation', email: 'ngo@foodwise.ai', password: 'demo123' },
  admin: { label: 'Administrator', org: 'FoodWiseAI Control Center', email: 'admin@foodwise.ai', password: 'admin123' },
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('foodwise-role') || null)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('foodwise-user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (role) localStorage.setItem('foodwise-role', role)
    else localStorage.removeItem('foodwise-role')
    if (user) localStorage.setItem('foodwise-user', JSON.stringify(user))
    else localStorage.removeItem('foodwise-user')
  }, [role, user])

  const login = (selectedRole, email, password) => {
    const meta = roleMeta[selectedRole]
    if (!meta || email.trim().toLowerCase() !== meta.email || password !== meta.password) return false
    setRole(selectedRole)
    setUser({ name: selectedRole === 'hotel' ? 'Aarav Mehta' : selectedRole === 'ngo' ? 'Maya Joseph' : 'Anika Rao', ...meta })
    return true
  }

  const logout = () => { setRole(null); setUser(null) }
  return <AuthContext.Provider value={{ role, user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
