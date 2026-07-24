import { useEffect, useState } from 'react'
import { Gift, Plus, Check, ShoppingBag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import type { Product, Category } from '../types'

export default function BuildYourBox() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)'),
        supabase.from('categories').select('*'),
      ])
      setProducts((prods ?? []) as Product[])
      setCategories((cats ?? []) as Category[])
    })()
  }, [])

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const total = selected.reduce((sum, id) => {
    const p = products.find(x => x.id === id)
    return sum + (p ? (p.sale_price ?? p.price) : 0)
  }, 0)

  const addToCart = () => {
    selected.forEach(id => {
      const p = products.find(x => x.id === id)
      if (p) addItem({
        id: p.id, name: p.name, price: p.sale_price ?? p.price,
        image_url: p.image_url, quantity: 1, size: p.sizes[0] ?? null, color: p.colors[0] ?? null,
      })
    })
    setSelected([])
    alert('Your gift box has been added to cart!')
  }

  const byCategory = (slug: string) => products.filter(p => p.category?.slug === slug).slice(0, 4)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="text-center mb-12">
        <Gift size={40} className="mx-auto text-mustard-500 mb-4" />
        <h1 className="font-serif text-4xl md:text-5xl mb-3">Build Your Box</h1>
        <p className="text-ink/60 max-w-xl mx-auto">Create a personalized gift box. Pick a tee, a beauty product, and a skincare item — we'll wrap it with love.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {['men', 'women', 'beauty', 'skincare'].map(slug => {
          const cat = categories.find(c => c.slug === slug)
          if (!cat) return null
          const items = byCategory(slug)
          if (items.length === 0) return null
          return (
            <div key={slug}>
              <h2 className="font-serif text-2xl mb-4">{cat.name}</h2>
              <div className="space-y-3">
                {items.map(p => (
                  <button key={p.id} onClick={() => toggle(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selected.includes(p.id) ? 'border-mustard-400 bg-mustard-50' : 'border-ink/10 hover:border-ink/20'}`}>
                    <img src={p.image_url ?? ''} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-mustard-500 text-sm">${p.sale_price ?? p.price}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selected.includes(p.id) ? 'bg-mustard-400' : 'border border-ink/20'}`}>
                      {selected.includes(p.id) ? <Check size={14} className="text-ink" /> : <Plus size={14} className="text-ink/40" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="sticky bottom-0 mt-8 card p-6 flex items-center justify-between bg-cream/95 backdrop-blur">
        <div>
          <span className="text-ink/60 text-sm">{selected.length} items selected</span>
          <p className="font-serif text-2xl">Total: ${total.toFixed(2)}</p>
        </div>
        <button onClick={addToCart} disabled={selected.length === 0} className="btn btn-primary disabled:opacity-40">
          <ShoppingBag size={18} /> Add Box to Cart
        </button>
      </div>
    </div>
  )
}
