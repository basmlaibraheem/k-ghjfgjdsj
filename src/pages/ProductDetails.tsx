import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, ShoppingBag, Star, Minus, Plus, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/ProductCard'
import type { Product, Review } from '../types'

export default function ProductDetails() {
  const { slug } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })

  const { addItem } = useCart()
  const { toggle, has } = useWishlist()

  useEffect(() => {
    if (!slug) return
    (async () => {
      setLoading(true)
      const { data } = await supabase.from('products').select('*, category:categories(*)').eq('slug', slug).maybeSingle()
      if (!data) { setLoading(false); return }
      setProduct(data as Product)
      setSize((data as Product).sizes[0] ?? null)
      setColor((data as Product).colors[0] ?? null)
      const imgs = [data.image_url].filter(Boolean) as string[]
      const { data: imgData } = await supabase.from('product_images').select('*').eq('product_id', data.id).order('position')
      if (imgData) imgs.push(...imgData.map(i => i.image_url))
      setImages(imgs.length ? imgs : ['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'])

      const { data: revData } = await supabase.from('reviews').select('*').eq('product_id', data.id).order('created_at', { ascending: false })
      setReviews((revData ?? []) as Review[])

      if (data.category_id) {
        const { data: rel } = await supabase.from('products').select('*, category:categories(*)').eq('category_id', data.category_id).neq('id', data.id).limit(4)
        setRelated((rel ?? []) as Product[])
      }
      setLoading(false)
    })()
  }, [slug])

  const addToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price ?? product.price,
      image_url: product.image_url,
      quantity: qty,
      size, color,
    })
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { alert('Please login to leave a review'); return }
    const { data } = await supabase.from('reviews').insert({
      product_id: product!.id,
      user_id: session.user.id,
      rating: newReview.rating,
      comment: newReview.comment,
    }).select('*').single()
    if (data) { setReviews([data as Review, ...reviews]); setNewReview({ rating: 5, comment: '' }) }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20"><div className="grid md:grid-cols-2 gap-8"><div className="aspect-[3/4] rounded-2xl skeleton" /><div className="space-y-4"><div className="h-8 w-2/3 skeleton rounded" /><div className="h-6 w-1/3 skeleton rounded" /><div className="h-24 skeleton rounded" /></div></div></div>
  if (!product) return <div className="text-center py-20 text-ink/50">Product not found.</div>

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Link to="/shop" className="flex items-center gap-1 text-ink/60 hover:text-ink mb-6 text-sm"><ChevronLeft size={16} /> Back to Shop</Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream cursor-zoom-in" onClick={() => setZoom(!zoom)}>
            <img src={images[activeImg]} alt={product.name} className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'scale-150' : ''}`} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-20 rounded-lg overflow-hidden border-2 ${activeImg === i ? 'border-mustard-400' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-serif text-4xl mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(product.rating) ? 'fill-mustard-400 text-mustard-400' : 'text-ink/20'} />)}</div>
            <span className="text-sm text-ink/50">({reviews.length} reviews)</span>
          </div>
          <div className="flex items-center gap-3 mb-6">
            {product.sale_price ? (
              <>
                <span className="text-3xl font-serif text-mustard-500">${product.sale_price}</span>
                <span className="text-xl text-graysoft line-through">${product.price}</span>
              </>
            ) : <span className="text-3xl font-serif text-ink">${product.price}</span>}
          </div>

          <p className="text-ink/70 leading-relaxed mb-6">{product.description ?? 'A beautifully crafted piece designed to bring warmth, simplicity, and elegance to your wardrobe.'}</p>

          {product.sizes.length > 0 && (
            <div className="mb-5">
              <span className="label">Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`w-12 h-12 rounded-xl border-2 font-medium ${size === s ? 'border-ink bg-ink text-cream' : 'border-ink/10'}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mb-5">
              <span className="label">Color</span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`chip border ${color === c ? 'bg-ink text-cream' : 'border-ink/10'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <span className="label">Quantity</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center"><Minus size={16} /></button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center"><Plus size={16} /></button>
              <span className="text-sm text-ink/50 ml-2">{product.stock} in stock</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={addToCart} className="btn btn-primary flex-1"><ShoppingBag size={18} /> Add to Cart</button>
            <button onClick={() => toggle(product.id)} className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center hover:bg-ink/5">
              <Heart size={20} className={has(product.id) ? 'fill-dusty-400 text-dusty-400' : 'text-ink'} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-serif text-3xl mb-6">Reviews ({reviews.length})</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-ink/50">No reviews yet. Be the first!</p>}
            {reviews.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex gap-1 mb-2">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < r.rating ? 'fill-mustard-400 text-mustard-400' : 'text-ink/20'} />)}</div>
                <p className="text-ink/70">{r.comment}</p>
                <span className="text-xs text-ink/40">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
          <form onSubmit={submitReview} className="card p-6 space-y-4">
            <h3 className="font-medium">Write a Review</h3>
            <div>
              <span className="label">Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setNewReview({ ...newReview, rating: n })}>
                    <Star size={24} className={n <= newReview.rating ? 'fill-mustard-400 text-mustard-400' : 'text-ink/20'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Comment</span>
              <textarea value={newReview.comment} onChange={e => setNewReview({ ...newReview, comment: e.target.value })} rows={4} className="input" placeholder="Share your thoughts..." />
            </div>
            <button className="btn btn-primary w-full">Submit Review</button>
          </form>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
