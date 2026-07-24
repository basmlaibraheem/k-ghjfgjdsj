import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types'

export default function Wishlist() {
  const { ids } = useWishlist()
  const { session } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || ids.length === 0) { setProducts([]); setLoading(false); return }
    (async () => {
      const { data } = await supabase.from('products').select('*, category:categories(*)').in('id', ids)
      setProducts((data ?? []) as Product[])
      setLoading(false)
    })()
  }, [ids, session])

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={48} className="mx-auto text-ink/20 mb-6" />
        <h1 className="font-serif text-3xl mb-4">Login to view your wishlist</h1>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-serif text-4xl mb-8">My Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-ink/20 mb-6" />
          <p className="text-ink/60 mb-6">Your wishlist is empty.</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
