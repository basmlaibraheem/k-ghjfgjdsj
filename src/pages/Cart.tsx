import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Cart() {
  const { items, removeItem, updateQty, subtotal, discount, coupon, applyCoupon, removeCoupon } = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const shipping = subtotal > 100 ? 0 : 8
  const total = subtotal - discount + shipping

  const tryCoupon = async () => {
    setError('')
    const { data } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('active', true).maybeSingle()
    if (!data) { setError('Invalid coupon code'); return }
    if (data.min_order && subtotal < data.min_order) { setError(`Minimum order $${data.min_order} required`); return }
    applyCoupon(data.code, data.value, data.type)
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-ink/20 mb-6" />
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="text-ink/60 mb-8">Discover our latest collection and find something you love.</p>
        <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-serif text-4xl mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id + item.size + item.color} className="card p-4 flex gap-4">
              <Link to={`/product/${item.id}`}><img src={item.image_url ?? ''} alt={item.name} className="w-24 h-32 rounded-xl object-cover" /></Link>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.name}</h3>
                  <button onClick={() => removeItem(item.id)} className="text-ink/40 hover:text-dusty-400"><Trash2 size={18} /></button>
                </div>
                <p className="text-sm text-ink/50 mt-1">{item.size} · {item.color}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-ink/10 flex items-center justify-center"><Minus size={14} /></button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-ink/10 flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-serif text-2xl mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sage"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
            <div className="border-t border-ink/10 pt-2 flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>

          {coupon ? (
            <div className="mt-4 flex items-center justify-between bg-sage/20 px-3 py-2 rounded-xl">
              <span className="text-sm flex items-center gap-1"><Tag size={14} /> {coupon}</span>
              <button onClick={removeCoupon} className="text-dusty-400 text-sm">Remove</button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon code" className="input py-2 text-sm" />
                <button onClick={tryCoupon} className="btn btn-outline py-2 px-4 text-sm">Apply</button>
              </div>
              {error && <p className="text-dusty-400 text-xs mt-2">{error}</p>}
            </div>
          )}

          <button onClick={() => navigate('/checkout')} className="btn btn-primary w-full mt-6">Checkout</button>
          <Link to="/shop" className="btn btn-ghost w-full mt-2">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
