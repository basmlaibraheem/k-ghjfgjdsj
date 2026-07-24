import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Women', path: '/shop?category=women' },
  { label: 'Men', path: '/shop?category=men' },
  { label: 'Beauty', path: '/shop?category=beauty' },
  { label: 'Skincare', path: '/shop?category=skincare' },
  { label: 'New Collection', path: '/shop?filter=new' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { count } = useCart()
  const { session } = useAuth()
  const navigate = useNavigate()

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/shop?q=${encodeURIComponent(search.trim())}`)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-ink/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button className="md:hidden p-2" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>

          <Link to="/" className="font-serif text-2xl md:text-3xl font-semibold tracking-wide text-ink">
            YUSMÉ
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(l => <Link key={l.path} to={l.path} className="hover:text-mustard-500 transition-colors">{l.label}</Link>)}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <form onSubmit={submitSearch} className="hidden md:flex items-center">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                className="w-32 lg:w-40 px-3 py-1.5 text-sm border-b border-ink/20 bg-transparent focus:outline-none focus:border-mustard-400 transition-colors"
              />
            </form>
            <Link to="/wishlist" className="hover:text-mustard-500 transition-colors" aria-label="Wishlist"><Heart size={20} /></Link>
            <Link to="/cart" className="relative hover:text-mustard-500 transition-colors" aria-label="Cart">
              <ShoppingBag size={20} />
              {count > 0 && <span className="absolute -top-2 -right-2 bg-mustard-400 text-ink text-xs rounded-full w-4 h-4 flex items-center justify-center">{count}</span>}
            </Link>
            <Link to={session ? '/profile' : '/login'} className="hover:text-mustard-500 transition-colors" aria-label="Profile"><User size={20} /></Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-cream p-6 animate-slide-down overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-2xl font-semibold">YUSMÉ</span>
              <button onClick={() => setOpen(false)}><X size={22} /></button>
            </div>
            <form onSubmit={submitSearch} className="mb-6">
              <div className="flex items-center border border-ink/10 rounded-xl px-3">
                <Search size={18} className="text-graysoft" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="w-full px-2 py-2 bg-transparent focus:outline-none" />
              </div>
            </form>
            <nav className="flex flex-col gap-4">
              {navLinks.map(l => <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className="text-lg hover:text-mustard-500">{l.label}</Link>)}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
