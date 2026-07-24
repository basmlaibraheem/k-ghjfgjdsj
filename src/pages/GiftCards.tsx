import { useState } from 'react'
import { Gift, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

const amounts = [25, 50, 100, 150, 200, 250]

export default function GiftCards() {
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const { addItem } = useCart()

  const finalAmount = custom ? Number(custom) : amount

  const buy = () => {
    addItem({
      id: `giftcard-${finalAmount}`,
      name: `YUSMÉ Gift Card $${finalAmount}`,
      price: finalAmount,
      image_url: 'https://images.pexels.com/photos/264787/pexels-photo-264787.jpeg',
      quantity: 1,
      size: null, color: null,
    })
    alert(`Gift card ($${finalAmount}) added to cart!`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="text-center mb-12">
        <Gift size={40} className="mx-auto text-mustard-500 mb-4" />
        <h1 className="font-serif text-4xl md:text-5xl mb-3">Gift Cards</h1>
        <p className="text-ink/60">Give the gift of choice. Perfect for any occasion.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-mustard-400 to-dusty-300 p-8 flex flex-col justify-between">
          <div>
            <span className="font-serif text-3xl text-ink">YUSMÉ</span>
            <p className="text-ink/70 text-sm mt-1">Wear Confidence. Love Yourself.</p>
          </div>
          <div>
            <p className="text-ink/60 text-sm">Gift Card Value</p>
            <p className="font-serif text-5xl text-ink">${finalAmount}</p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl mb-4">Choose an Amount</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {amounts.map(a => (
              <button key={a} onClick={() => { setAmount(a); setCustom('') }} className={`py-3 rounded-xl border-2 font-medium ${amount === a && !custom ? 'border-mustard-400 bg-mustard-50' : 'border-ink/10'}`}>${a}</button>
            ))}
          </div>
          <div className="mb-6">
            <label className="label">Custom Amount</label>
            <input type="number" min="10" max="500" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Enter amount" className="input" />
          </div>
          <button onClick={buy} className="btn btn-primary w-full"><ShoppingBag size={18} /> Add to Cart</button>
        </div>
      </div>
    </div>
  )
}
