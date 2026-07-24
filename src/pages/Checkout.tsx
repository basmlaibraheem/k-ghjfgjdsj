import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const { items, subtotal, discount, coupon, clearCart } = useCart()
  const shipping = subtotal > 100 ? 0 : 8
  const { session } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', address: '', city: '', phone: '', payment_method: 'cod' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const total = subtotal - discount + shipping

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { navigate('/login'); return }
    setSubmitting(true)
    const { data: order } = await supabase.from('orders').insert({
      user_id: session.user.id,
      status: 'Pending',
      subtotal, discount, shipping, total,
      full_name: form.full_name, address: form.address, city: form.city, phone: form.phone,
      payment_method: form.payment_method, coupon_code: coupon,
    }).select('*').single()

    if (order) {
      await supabase.from('order_items').insert(items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        name: i.name,
        image_url: i.image_url,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })))
      await supabase.from('profiles').update({ loyalty_points: (await supabase.from('profiles').select('loyalty_points').eq('id', session.user.id).single()).data?.loyalty_points + Math.floor(total) }).eq('id', session.user.id)
      clearCart()
      setDone(true)
    }
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle2 size={64} className="mx-auto text-sage mb-6" />
        <h1 className="font-serif text-4xl mb-3">Order Confirmed!</h1>
        <p className="text-ink/60 mb-8">Thank you for your purchase. We'll send you a confirmation email shortly.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">Continue Shopping</button>
      </div>
    )
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-serif text-4xl mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-2xl mb-4">Shipping Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input" /></div>
              <div><label className="label">Phone</label><input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" /></div>
              <div className="md:col-span-2"><label className="label">Address</label><input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input" /></div>
              <div><label className="label">City</label><input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input" /></div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-serif text-2xl mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[{ id: 'cod', label: 'Cash on Delivery' }, { id: 'card', label: 'Credit / Debit Card' }].map(p => (
                <label key={p.id} className="flex items-center gap-3 p-3 border border-ink/10 rounded-xl cursor-pointer hover:bg-cream">
                  <input type="radio" name="payment" checked={form.payment_method === p.id} onChange={() => setForm({ ...form, payment_method: p.id })} className="accent-mustard-400" />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-serif text-2xl mb-4">Your Order</h2>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map(i => (
              <div key={i.id + i.size + i.color} className="flex gap-3 text-sm">
                <img src={i.image_url ?? ''} alt="" className="w-12 h-16 rounded-lg object-cover" />
                <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-ink/50">{i.size} · {i.color} · ×{i.quantity}</p></div>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-ink/10 pt-4">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sage"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
            <div className="flex justify-between font-semibold text-lg border-t border-ink/10 pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <button disabled={submitting} className="btn btn-primary w-full mt-6">{submitting ? 'Placing Order...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  )
}
