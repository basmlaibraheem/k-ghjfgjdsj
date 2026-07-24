import { useEffect, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Coupon } from '../types'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    setCoupons((data ?? []) as Coupon[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await supabase.from('coupons').insert({
      code: String(fd.get('code')).toUpperCase(),
      type: String(fd.get('type')),
      value: Number(fd.get('value')),
      min_order: Number(fd.get('min_order')) || 0,
      active: true,
    })
    setShowForm(false); load()
  }

  const toggleActive = async (c: Coupon) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id)
    setCoupons(coupons.map(x => x.id === c.id ? { ...x, active: !x.active } : x))
  }

  const del = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await supabase.from('coupons').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={18} /> Add Coupon</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex justify-between mb-2">
                <span className="font-serif text-xl">{c.code}</span>
                <button onClick={() => del(c.id)} className="text-dusty-400"><Trash2 size={16} /></button>
              </div>
              <p className="text-sm text-ink/60">{c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`}</p>
              <p className="text-xs text-ink/40 mt-1">Min order: ${c.min_order} · Used: {c.times_used}</p>
              <button onClick={() => toggleActive(c)} className={`chip mt-3 ${c.active ? 'bg-sage/30 text-green-700' : 'bg-cream text-ink/50'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-cream rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4"><h2 className="font-serif text-2xl">Add Coupon</h2><button onClick={() => setShowForm(false)}><X size={22} /></button></div>
            <form onSubmit={save} className="space-y-3">
              <div><label className="label">Code</label><input name="code" required className="input" /></div>
              <div><label className="label">Type</label>
                <select name="type" className="input"><option value="percent">Percent</option><option value="fixed">Fixed</option></select>
              </div>
              <div><label className="label">Value</label><input name="value" type="number" step="0.01" required className="input" /></div>
              <div><label className="label">Min Order</label><input name="min_order" type="number" step="0.01" defaultValue="0" className="input" /></div>
              <button className="btn btn-primary w-full">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
