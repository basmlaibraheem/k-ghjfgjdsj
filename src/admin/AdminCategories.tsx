import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories((data ?? []) as Category[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      name: String(fd.get('name')),
      slug: String(fd.get('slug')) || String(fd.get('name')).toLowerCase().replace(/\s+/g, '-'),
      image_url: String(fd.get('image_url')) || null,
    }
    if (editing) await supabase.from('categories').update(data).eq('id', editing.id)
    else await supabase.from('categories').insert(data)
    setShowForm(false); setEditing(null); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Categories</h1>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn btn-primary"><Plus size={18} /> Add Category</button>
      </div>

      {loading ? <div className="grid md:grid-cols-3 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}</div> : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="card p-4">
              {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-24 rounded-lg object-cover mb-3" />}
              <h3 className="font-medium">{c.name}</h3>
              <p className="text-xs text-ink/40 mb-3">/{c.slug}</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(c); setShowForm(true) }} className="btn btn-ghost text-sm py-1 px-2"><Edit2 size={14} /></button>
                <button onClick={() => del(c.id)} className="btn btn-ghost text-sm py-1 px-2 text-dusty-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-cream rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4"><h2 className="font-serif text-2xl">{editing ? 'Edit' : 'Add'} Category</h2><button onClick={() => setShowForm(false)}><X size={22} /></button></div>
            <form onSubmit={save} className="space-y-3">
              <div><label className="label">Name</label><input name="name" required defaultValue={editing?.name} className="input" /></div>
              <div><label className="label">Slug (optional)</label><input name="slug" defaultValue={editing?.slug} className="input" /></div>
              <div><label className="label">Image URL</label><input name="image_url" defaultValue={editing?.image_url ?? ''} className="input" /></div>
              <button className="btn btn-primary w-full">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
