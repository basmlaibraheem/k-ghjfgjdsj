import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import type { Product } from '../types'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { toggle, has } = useWishlist()

  const effectivePrice = product.sale_price ?? product.price

  const addToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image_url: product.image_url,
      quantity: 1,
      size: product.sizes[0] ?? null,
      color: product.colors[0] ?? null,
    })
  }

  return (
    <div className="card group overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image_url ?? 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {product.sale_price && (
          <span className="absolute top-3 left-3 bg-dusty-300 text-white text-xs px-2 py-1 rounded-full">Sale</span>
        )}
        {product.is_new && !product.sale_price && (
          <span className="absolute top-3 left-3 bg-sage text-ink text-xs px-2 py-1 rounded-full">New</span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggle(product.id)}
            className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
            aria-label="Wishlist"
          >
            <Heart size={16} className={has(product.id) ? 'fill-dusty-400 text-dusty-400' : 'text-ink'} />
          </button>
          <Link to={`/product/${product.slug}`} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" aria-label="Quick view">
            <Eye size={16} className="text-ink" />
          </Link>
        </div>
        <button
          onClick={addToCart}
          className="absolute bottom-0 left-0 right-0 bg-ink text-cream py-3 text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={16} /> Add to Cart
        </button>
      </div>
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="font-medium text-ink truncate">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          {product.sale_price ? (
            <>
              <span className="text-mustard-500 font-semibold">${product.sale_price}</span>
              <span className="text-graysoft line-through text-sm">${product.price}</span>
            </>
          ) : (
            <span className="text-ink font-semibold">${product.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}
