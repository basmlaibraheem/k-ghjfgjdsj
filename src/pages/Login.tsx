import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    else navigate('/profile')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-serif text-3xl text-center mb-2">Welcome Back</h1>
        <p className="text-center text-ink/60 mb-6">Sign in to your YUSMÉ account</p>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" /></div>
          <div><label className="label">Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input" /></div>
          {error && <p className="text-dusty-400 text-sm">{error}</p>}
          <button disabled={loading} className="btn btn-primary w-full">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-sm text-ink/60 mt-6">Don't have an account? <Link to="/register" className="text-mustard-500 font-medium">Register</Link></p>
      </div>
    </div>
  )
}
