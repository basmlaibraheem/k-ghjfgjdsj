export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  image_url: string | null
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  sale_price: number | null
  category_id: string | null
  sizes: string[]
  colors: string[]
  stock: number
  image_url: string | null
  rating: number
  is_featured: boolean
  is_best_seller: boolean
  is_new: boolean
  created_at: string
  category?: Category
}

export type ProductImage = {
  id: string
  product_id: string
  image_url: string
  position: number
}

export type Order = {
  id: string
  user_id: string
  status: string
  total: number
  subtotal: number
  discount: number
  shipping: number
  full_name: string | null
  address: string | null
  city: string | null
  phone: string | null
  payment_method: string | null
  coupon_code: string | null
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  name: string
  image_url: string | null
  price: number
  quantity: number
  size: string | null
  color: string | null
}

export type Review = {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
}

export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  product?: Product
}

export type Coupon = {
  id: string
  code: string
  type: string
  value: number
  min_order: number
  expires_at: string | null
  usage_limit: number | null
  times_used: number
  active: boolean
}

export type Message = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  is_admin: boolean
  loyalty_points: number
}
