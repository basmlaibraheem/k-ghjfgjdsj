import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'
import type { Product, Category } from '../types'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const filter = params.get('filter') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const maxPrice = params.get('maxPrice') ?? ''
  const color = params.get('color') ?? ''
  const size = params.get('size') ?? ''

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)'),
        supabase.from('categories').select('*'),
      ])
      setProducts((prods ?? []) as Product[])
      setCategories((cats ?? []) as Category[])
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    if (category) list = list.filter(p => p.category?.slug === category)
    if (filter === 'new') list = list.filter(p => p.is_new)
    if (maxPrice) list = list.filter(p => (p.sale_price ?? p.price) <= Number(maxPrice))
    if (color) list = list.filter(p => p.colors.includes(color))
    if (size) list = list.filter(p => p.sizes.includes(size))
    switch (sort) {
      case 'price-asc': list.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price)); break
      case 'price-desc': list.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price)); break
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return list
  }, [products, q, category, filter, maxPrice, color, size, sort])

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next)
  }

  const allColors = useMemo(() => [...new Set(products.flatMap(p => p.colors))], [products])
  const allSizes = useMemo(() => [...new Set(products.flatMap(p => p.sizes))], [products])

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Category</h4>
        <div className="space-y-2">
          <button onClick={() => updateParam('category', '')} className={`block text-sm ${!category ? 'text-mustard-500 font-medium' : 'text-ink/70'}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => updateParam('category', c.slug)} className={`block text-sm ${category === c.slug ? 'text-mustard-500 font-medium' : 'text-ink/70'}`}>{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-medium mb-3">Max Price</h4>
        <input type="range" min="0" max="200" value={maxPrice || '200'} onChange={e => updateParam('maxPrice', e.target.value)} className="w-full accent-mustard-400" />
        <span className="text-sm text-ink/60">${maxPrice || '200'}</span>
      </div>
      {allColors.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Color</h4>
          <div className="flex flex-wrap gap-2">
            {allColors.map(c => (
              <button key={c} onClick={() => updateParam('color', color === c ? '' : c)} className={`chip border ${color === c ? 'bg-ink text-cream' : 'border-ink/10'}`}>{c}</button>
            ))}
          </div>
        </div>
      )}
      {allSizes.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Size</h4>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(s => (
              <button key={s} onClick={() => updateParam('size', size === s ? '' : s)} className={`chip border ${size === s ? 'bg-ink text-cream' : 'border-ink/10'}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-4xl mb-2">Shop</h1>
        <p className="text-ink/60">{filtered.length} products</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 md:hidden btn btn-outline py-2 px-4 text-sm">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input max-w-xs py-2">
          {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-60 shrink-0">
          <FilterPanel />
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-ink/50">No products found. Try adjusting your filters.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-cream p-6 overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="font-serif text-2xl">Filters</h3>
              <button onClick={() => setShowFilters(false)}><X size={22} /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  )
}
