import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ])
    setProducts((prods ?? []) as Product[])
    setCategories((cats ?? []) as Category[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const blank = (): Partial<Product> => ({
    name: '', slug: '', description: '', price: 0, sale_price: null,
    category_id: null, sizes: [], colors: [], stock: 0,
    image_url: '', is_featured: false, is_best_seller: false, is_new: true,
  })

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data: any = {
      name: fd.get('name'), slug: fd.get('slug') || String(fd.get('name')).toLowerCase().replace(/\s+/g, '-'),
      description: fd.get('description'), price: Number(fd.get('price')),
      sale_price: fd.get('sale_price') ? Number(fd.get('sale_price')) : null,
      category_id: fd.get('category_id') || null,
      sizes: String(fd.get('sizes')).split(',').map(s => s.trim()).filter(Boolean),
      colors: String(fd.get('colors')).split(',').map(s => s.trim()).filter(Boolean),
      stock: Number(fd.get('stock')), image_url: fd.get('image_url'),
      is_featured: fd.has('is_featured'), is_best_seller: fd.has('is_best_seller'), is_new: fd.has('is_new'),
    }
    if (editing) {
      await supabase.from('products').update(data).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(data)
    }
    setShowForm(false); setEditing(null); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Products</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn btn-primary"><Plus size={18} /> Add Product</button>
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th className="text-right">Actions</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-ink/5">
                  <td className="p-3 flex items-center gap-3">
                    <img src={p.image_url ?? ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td>{p.category?.name ?? '—'}</td>
                  <td>${p.sale_price ?? p.price}</td>
                  <td>{p.stock}</td>
                  <td className="text-right">
                    <button onClick={() => { setEditing(p); setShowForm(true) }} className="p-2 hover:bg-ink/5 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => del(p.id)} className="p-2 hover:bg-dusty-100 rounded-lg"><Trash2 size={16} className="text-dusty-400" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-cream rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4"><h2 className="font-serif text-2xl">{editing ? 'Edit' : 'Add'} Product</h2><button onClick={() => setShowForm(false)}><X size={22} /></button></div>
            <form onSubmit={save} className="space-y-3">
              <div><label className="label">Name</label><input name="name" required defaultValue={editing?.name} className="input" /></div>
              <div><label className="label">Slug (optional)</label><input name="slug" defaultValue={editing?.slug} className="input" /></div>
              <div><label className="label">Description</label><textarea name="description" rows={3} defaultValue={editing?.description ?? ''} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Price</label><input name="price" type="number" step="0.01" required defaultValue={editing?.price} className="input" /></div>
                <div><label className="label">Sale Price</label><input name="sale_price" type="number" step="0.01" defaultValue={editing?.sale_price ?? ''} className="input" /></div>
              </div>
              <div><label className="label">Category</label>
                <select name="category_id" defaultValue={editing?.category_id ?? ''} className="input">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Sizes (comma-separated)</label><input name="sizes" defaultValue={editing?.sizes?.join(', ')} className="input" /></div>
                <div><label className="label">Colors (comma-separated)</label><input name="colors" defaultValue={editing?.colors?.join(', ')} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Stock</label><input name="stock" type="number" defaultValue={editing?.stock ?? 0} className="input" /></div>
                <div><label className="label">Image URL</label><input name="image_url" defaultValue={editing?.image_url ?? ''} className="input" /></div>
              </div>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" name="is_featured" defaultChecked={editing?.is_featured} className="accent-mustard-400" /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="is_best_seller" defaultChecked={editing?.is_best_seller} className="accent-mustard-400" /> Best Seller</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="is_new" defaultChecked={editing?.is_new ?? true} className="accent-mustard-400" /> New</label>
              </div>
              <button className="btn btn-primary w-full">{editing ? 'Update' : 'Create'} Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
