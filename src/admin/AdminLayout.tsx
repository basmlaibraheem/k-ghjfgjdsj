import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Ticket, MessageSquare, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
]

export default function AdminLayout() {
  const { session, profile, isAdmin, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) navigate('/')
  }, [session, isAdmin, loading, navigate])

  if (!session || !isAdmin) return null

  const Sidebar = () => (
    <div className="space-y-1">
      {links.map(l => {
        const active = location.pathname === l.path
        return (
          <Link key={l.path} to={l.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-mustard-400 text-ink' : 'text-cream/70 hover:bg-cream/10'}`}>
            <l.icon size={18} /> {l.label}
          </Link>
        )
      })}
      <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dusty-300 hover:bg-cream/10 w-full">
        <LogOut size={18} /> Logout
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="hidden md:block w-64 bg-ink p-4 sticky top-0 h-screen overflow-y-auto">
        <Link to="/admin" className="font-serif text-2xl text-cream px-4 py-2 block mb-6">YUSMÉ Admin</Link>
        <Sidebar />
      </aside>

      <div className="flex-1">
        <header className="md:hidden bg-ink text-cream p-4 flex items-center justify-between sticky top-0 z-40">
          <span className="font-serif text-xl">YUSMÉ Admin</span>
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 bg-ink p-4 overflow-y-auto">
              <div className="flex justify-between mb-6">
                <span className="font-serif text-xl text-cream">Admin</span>
                <button onClick={() => setOpen(false)} className="text-cream"><X size={22} /></button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
