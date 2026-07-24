import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.fullName)
    if (error) setError(error)
    else navigate('/profile')
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="font-serif text-3xl text-center mb-2">Create Account</h1>
        <p className="text-center text-ink/60 mb-6">Join the YUSMÉ family</p>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Full Name</label><input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="input" /></div>
          <div><label className="label">Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
          <div><label className="label">Password</label><input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" /></div>
          {error && <p className="text-dusty-400 text-sm">{error}</p>}
          <button disabled={loading} className="btn btn-primary w-full">{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="text-center text-sm text-ink/60 mt-6">Already have an account? <Link to="/login" className="text-mustard-500 font-medium">Sign In</Link></p>
      </div>
    </div>
  )
}
