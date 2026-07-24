import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'

const statuses = ['Pending', 'Preparing', 'Shipping', 'Delivered', 'Cancelled']
const statusColor: Record<string, string> = {
  Pending: 'bg-mustard-100 text-mustard-700',
  Preparing: 'bg-dusty-100 text-dusty-700',
  Shipping: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-sage/30 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders((data ?? []) as Order[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Orders</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilter('all')} className={`chip ${filter === 'all' ? 'bg-ink text-cream' : 'border border-ink/10'}`}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`chip whitespace-nowrap ${filter === s ? 'bg-ink text-cream' : 'border border-ink/10'}`}>{s}</button>
        ))}
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div> : filtered.length === 0 ? (
        <p className="text-center text-ink/50 py-12">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium">#{o.id.slice(0, 8)}</span>
                  <span className={`chip ${statusColor[o.status]}`}>{o.status}</span>
                </div>
                <p className="text-sm text-ink/50">{o.full_name} · {new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className="font-semibold">${Number(o.total).toFixed(2)}</span>
              <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="input py-2 text-sm max-w-[160px]">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
