import { useEffect, useState } from 'react'
import { Users, ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, products: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [{ count: users }, { count: orders }, { count: products }, { data: orderData }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      const revenue = (orderData ?? []).reduce((s, o) => s + Number(o.total), 0)
      setStats({ users: users ?? 0, orders: orders ?? 0, revenue, products: products ?? 0 })
      setRecentOrders(orderData ?? [])
      setLoading(false)
    })()
  }, [])

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-dusty-100 text-dusty-600' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-mustard-100 text-mustard-600' },
    { label: 'Revenue', value: `$${stats.revenue.toFixed(0)}`, icon: DollarSign, color: 'bg-sage/30 text-green-700' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-blue-100 text-blue-600' },
  ]

  return (
    <div>
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="card p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon size={22} /></div>
            <p className="text-2xl font-serif">{loading ? '—' : c.value}</p>
            <p className="text-sm text-ink/50">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-serif text-xl mb-4 flex items-center gap-2"><TrendingUp size={20} /> Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-ink/50 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-ink/50 border-b border-ink/10">
                <th className="py-2">Order</th><th>Date</th><th>Status</th><th className="text-right">Total</th>
              </tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b border-ink/5">
                    <td className="py-3">#{o.id.slice(0, 8)}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td><span className="chip bg-mustard-100 text-mustard-700">{o.status}</span></td>
                    <td className="text-right font-semibold">${Number(o.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
