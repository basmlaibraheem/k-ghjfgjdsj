import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, Heart, MapPin, LogOut, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'

export default function Profile() {
  const { session, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'orders' | 'wishlist' | 'addresses' | 'details'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', avatar_url: '' })

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    setForm({
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar_url: profile?.avatar_url ?? '',
    })
    ;(async () => {
      const { data } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      setOrders((data ?? []) as Order[])
    })()
  }, [session, profile, navigate])

  if (!session) return null

  const saveDetails = async () => {
    await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      avatar_url: form.avatar_url,
    }).eq('id', session.user.id)
    await refreshProfile()
    setEditing(false)
  }

  const statusColor: Record<string, string> = {
    Pending: 'bg-mustard-100 text-mustard-700',
    Preparing: 'bg-dusty-100 text-dusty-700',
    Shipping: 'bg-blue-100 text-blue-700',
    Delivered: 'bg-sage/30 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-mustard-400 flex items-center justify-center">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User size={28} className="text-ink" />}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-2xl">{profile?.full_name ?? 'My Account'}</h1>
          <p className="text-ink/60 text-sm">{session.user.email}</p>
        </div>
        {profile?.is_admin && <Link to="/admin" className="btn btn-outline text-sm">Admin Panel</Link>}
        <button onClick={() => signOut()} className="btn btn-ghost text-sm text-dusty-400"><LogOut size={16} /> Logout</button>
      </div>

      <div className="grid md:grid-cols-4 gap-2 mb-6">
        {[
          { id: 'orders', label: 'My Orders', icon: Package },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'addresses', label: 'Addresses', icon: MapPin },
          { id: 'details', label: 'My Details', icon: User },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`flex items-center gap-2 p-4 rounded-xl border ${tab === t.id ? 'bg-ink text-cream' : 'border-ink/10 hover:bg-cream'}`}>
            <t.icon size={18} /> <span className="text-sm font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? <p className="text-center text-ink/50 py-12">No orders yet.</p> : orders.map(o => (
            <div key={o.id} className="card p-5">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order #{o.id.slice(0, 8)}</span>
                <span className={`chip ${statusColor[o.status] ?? 'bg-cream'}`}>{o.status}</span>
              </div>
              <div className="flex justify-between text-sm text-ink/60">
                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="font-semibold text-ink">${o.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="card p-8 text-center">
          <Heart size={40} className="mx-auto text-ink/20 mb-4" />
          <Link to="/wishlist" className="text-mustard-500 font-medium">View your wishlist →</Link>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="card p-8 text-center">
          <MapPin size={40} className="mx-auto text-ink/20 mb-4" />
          <p className="text-ink/60">No saved addresses yet.</p>
        </div>
      )}

      {tab === 'details' && (
        <div className="card p-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-serif text-2xl">Personal Details</h2>
            {!editing && <button onClick={() => setEditing(true)} className="btn btn-ghost text-sm">Edit</button>}
          </div>
          {editing ? (
            <div className="space-y-4">
              <div><label className="label">Full Name</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input" /></div>
              <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" /></div>
              <div><label className="label">Avatar URL</label><input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} className="input" /></div>
              <div className="flex gap-2">
                <button onClick={saveDetails} className="btn btn-primary">Save</button>
                <button onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div><span className="text-ink/50">Name:</span> {profile?.full_name ?? '—'}</div>
              <div><span className="text-ink/50">Phone:</span> {profile?.phone ?? '—'}</div>
              <div><span className="text-ink/50">Loyalty Points:</span> <span className="flex items-center gap-1 inline-flex"><Star size={14} className="fill-mustard-400 text-mustard-400" /> {profile?.loyalty_points ?? 0}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
