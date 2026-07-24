import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setUsers((data ?? []) as Profile[])
      setLoading(false)
    })()
  }, [])

  const toggleAdmin = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', id)
    setUsers(users.map(u => u.id === id ? { ...u, is_admin: !current } : u))
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Users</h1>
      {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-ink/50 border-b border-ink/10">
              <th className="p-3">Name</th><th>Role</th><th>Loyalty Points</th><th className="text-right">Action</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-ink/5">
                  <td className="p-3 font-medium">{u.full_name ?? '—'}</td>
                  <td>{u.is_admin ? <span className="chip bg-mustard-100 text-mustard-700">Admin</span> : <span className="chip bg-cream">Customer</span>}</td>
                  <td>{u.loyalty_points}</td>
                  <td className="text-right">
                    <button onClick={() => toggleAdmin(u.id, u.is_admin)} className="btn btn-ghost text-sm py-1 px-3">
                      {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
