import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import type { Product, Category } from '../types'

const categoryIcons: Record<string, string> = {
  men: 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg',
  women: 'https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg',
  beauty: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg',
  skincare: 'https://images.pexels.com/photos/3735619/pexels-photo-3735619.jpeg',
}

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ days: 5, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }).limit(8),
        supabase.from('categories').select('*').order('name'),
      ])
      setNewProducts((prods ?? []) as Product[])
      setBestSellers(((prods ?? []) as Product[]).filter(p => p.is_best_seller).slice(0, 4))
      setCategories((cats ?? []) as Category[])
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const target = new Date(); target.setDate(target.getDate() + 5)
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now()
      const days = Math.max(0, Math.floor(diff / 86400000))
      const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000))
      const minutes = Math.max(0, Math.floor((diff % 3600000) / 60000))
      const seconds = Math.max(0, Math.floor((diff % 60000) / 1000))
      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg"
          alt="YUSMÉ Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/80 via-cream/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center">
          <div className="max-w-xl animate-slide-up">
            <p className="text-mustard-500 font-medium tracking-widest text-sm mb-3">NEW COLLECTION</p>
            <h1 className="font-serif text-5xl md:text-7xl text-ink leading-tight mb-6">Discover Your Style</h1>
            <p className="text-ink/70 text-lg mb-8 max-w-md">Fashion and beauty that make every person feel confident and comfortable. Wear confidence, love yourself.</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn btn-primary">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/shop?filter=new" className="btn btn-outline">Explore Collection</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="section-title mb-10">Shop By Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
              <img
                src={cat.image_url ?? categoryIcons[cat.slug] ?? 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                <h3 className="font-serif text-2xl text-cream">{cat.name}</h3>
                <span className="text-cream/80 text-sm group-hover:text-mustard-400 transition-colors">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <h2 className="section-title text-left">New Collection</h2>
          <Link to="/shop?filter=new" className="text-mustard-500 font-medium hover:underline hidden md:block">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* BEST SELLERS */}
      <section className="bg-cream py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="section-title mb-10">Best Sellers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.length > 0 ? bestSellers.map(p => <ProductCard key={p.id} product={p} />) : newProducts.slice(4, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* FEATURED OUTFIT */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="section-title mb-10">Featured Outfit</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <img src="https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg" alt="Featured Look" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-ink/10" />
          </div>
          <div>
            <h3 className="font-serif text-3xl mb-6">The Complete Look</h3>
            <p className="text-ink/70 mb-8">Shop the full outfit in one tap. Each piece is curated to match — wear it together or style it your way.</p>
            <div className="space-y-4">
              {[
                { name: 'Oversized T-Shirt', price: 45, img: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg' },
                { name: 'Leather Bag', price: 89, img: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg' },
                { name: 'Lipstick', price: 22, img: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg' },
                { name: 'Perfume', price: 65, img: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 p-3 card">
                  <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-mustard-500 font-semibold">${item.price}</span>
                  </div>
                  <Link to="/shop" className="btn btn-ghost text-sm">Add</Link>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-6 w-full">Add Full Look to Cart</button>
          </div>
        </div>
      </section>

      {/* LIMITED OFFER */}
      <section className="bg-mustard-400 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Clock className="mx-auto mb-4 text-ink" size={32} />
          <h2 className="font-serif text-4xl text-ink mb-2">Limited Offer</h2>
          <p className="text-ink/70 mb-8">Up to 30% off selected items. Hurry, ends soon!</p>
          <div className="flex justify-center gap-4 md:gap-8 mb-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map(t => (
              <div key={t.label} className="bg-cream rounded-2xl w-20 md:w-24 py-4">
                <div className="font-serif text-3xl md:text-4xl text-ink">{String(t.value).padStart(2, '0')}</div>
                <div className="text-xs text-ink/60 uppercase tracking-wide">{t.label}</div>
              </div>
            ))}
          </div>
          <Link to="/shop" className="btn bg-ink text-cream hover:bg-ink/90">Shop the Sale</Link>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="section-title mb-10">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Salma A.', text: 'The quality is amazing! My new favorite brand. Everything fits perfectly.', img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
            { name: 'Mariam K.', text: 'YUSMÉ skincare changed my routine completely. My skin has never looked better.', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
            { name: 'Nour H.', text: 'Beautiful packaging and even better products. The mustard collection is stunning.', img: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
          ].map(r => (
            <div key={r.name} className="card p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-mustard-400 text-mustard-400" />)}
              </div>
              <p className="text-ink/70 mb-4 leading-relaxed">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <img src={r.img} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="font-medium">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-ink py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-cream mb-3">Join the YUSMÉ Family</h2>
          <p className="text-cream/70 mb-8">Subscribe for early access to new collections, exclusive offers, and beauty tips.</p>
          <form onSubmit={e => { e.preventDefault(); alert('Thank you for subscribing!') }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required placeholder="Your email address" className="input flex-1 bg-cream/10 border-cream/20 text-cream placeholder-cream/40" />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
