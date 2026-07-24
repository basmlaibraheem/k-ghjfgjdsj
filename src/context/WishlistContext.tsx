import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

type WishlistContextType = {
  ids: string[]
  toggle: (productId: string) => Promise<void>
  has: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (!session) { setIds([]); return }
    (async () => {
      const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', session.user.id)
      setIds((data ?? []).map(r => r.product_id))
    })()
  }, [session])

  const toggle = async (productId: string) => {
    if (!session) return
    if (ids.includes(productId)) {
      await supabase.from('wishlist').delete().eq('user_id', session.user.id).eq('product_id', productId)
      setIds(ids.filter(id => id !== productId))
    } else {
      await supabase.from('wishlist').insert({ user_id: session.user.id, product_id: productId })
      setIds([...ids, productId])
    }
  }

  const has = (productId: string) => ids.includes(productId)

  return (
    <WishlistContext.Provider value={{ ids, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
