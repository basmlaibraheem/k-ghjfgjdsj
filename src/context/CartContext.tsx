import { createContext, useContext, useState, type ReactNode } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  image_url: string | null
  quantity: number
  size: string | null
  color: string | null
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  subtotal: number
  count: number
  coupon: string | null
  discount: number
  applyCoupon: (code: string, value: number, type: string) => void
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('yusme_cart') ?? '[]') } catch { return [] }
  })
  const [coupon, setCoupon] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)

  const persist = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem('yusme_cart', JSON.stringify(next))
  }

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(p => p.id === item.id && p.size === item.size && p.color === item.color)
      if (existing) {
        const next = prev.map(p => p === existing ? { ...p, quantity: p.quantity + item.quantity } : p)
        persist(next)
        return next
      }
      const next = [...prev, item]
      persist(next)
      return next
    })
  }

  const removeItem = (id: string) => {
    const next = items.filter(p => p.id !== id)
    persist(next)
  }

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return removeItem(id)
    const next = items.map(p => p.id === id ? { ...p, quantity: qty } : p)
    persist(next)
  }

  const clearCart = () => persist([])

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  const applyCoupon = (code: string, value: number, type: string) => {
    setCoupon(code)
    setDiscount(type === 'percent' ? (subtotal * value) / 100 : value)
  }

  const removeCoupon = () => { setCoupon(null); setDiscount(0) }

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      subtotal, count, coupon, discount, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
