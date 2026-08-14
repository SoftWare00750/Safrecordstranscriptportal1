import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('safrecords-user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) sessionStorage.setItem('safrecords-user', JSON.stringify(user))
    else sessionStorage.removeItem('safrecords-user')
  }, [user])

  const loginAsStudent = (student) => setUser({ role: 'student', ...student })
  const loginAsAdmin = (name) => setUser({ role: 'admin', name, staffId: 'REG-STAFF' })
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, loginAsStudent, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
