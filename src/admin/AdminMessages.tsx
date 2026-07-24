import { useEffect, useState } from 'react'
import { Mail, Trash2, MailOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages((data ?? []) as Message[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markRead = async (m: Message) => {
    await supabase.from('messages').update({ read: !m.read }).eq('id', m.id)
    setMessages(messages.map(x => x.id === m.id ? { ...x, read: !x.read } : x))
  }

  const del = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('messages').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Messages</h1>
      {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div> : messages.length === 0 ? (
        <p className="text-center text-ink/50 py-12">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`card p-5 ${!m.read ? 'border-l-4 border-l-mustard-400' : ''}`}>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-sm text-ink/50 ml-2">{m.email}</span>
                </div>
                <span className="text-xs text-ink/40">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              {m.subject && <p className="text-sm font-medium text-ink/70 mb-1">{m.subject}</p>}
              <p className="text-sm text-ink/60 mb-3">{m.message}</p>
              <div className="flex gap-2">
                <button onClick={() => markRead(m)} className="btn btn-ghost text-sm py-1 px-3">
                  {m.read ? <><Mail size={14} /> Mark Unread</> : <><MailOpen size={14} /> Mark Read</>}
                </button>
                <button onClick={() => del(m.id)} className="btn btn-ghost text-sm py-1 px-3 text-dusty-400"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
