import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.from('messages').insert(form)
    setSent(true)
    setLoading(false)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl md:text-5xl mb-3">Get in Touch</h1>
        <p className="text-ink/60">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-mustard-100 flex items-center justify-center"><Mail size={20} className="text-mustard-600" /></div>
            <div><h3 className="font-medium">Email</h3><p className="text-ink/60 text-sm">hello@yusme.com</p></div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-dusty-100 flex items-center justify-center"><Phone size={20} className="text-dusty-600" /></div>
            <div><h3 className="font-medium">Phone</h3><p className="text-ink/60 text-sm">+20 1550517776</p></div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage/30 flex items-center justify-center"><MapPin size={20} className="text-green-700" /></div>
            <div><h3 className="font-medium">Location</h3><p className="text-ink/60 text-sm">Cairo, Egypt</p></div>
          </div>
          <div className="rounded-2xl overflow-hidden h-64 bg-cream">
            <iframe
              title="YUSMÉ Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=31.2%2C30.0%2C31.3%2C30.1&layer=mapnik"
              className="w-full h-full border-0"
            />
          </div>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-sage/30 flex items-center justify-center mx-auto mb-4"><Send size={28} className="text-green-700" /></div>
              <h2 className="font-serif text-2xl mb-2">Message Sent!</h2>
              <p className="text-ink/60 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setSent(false)} className="btn btn-outline">Send Another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="font-serif text-2xl mb-2">Send a Message</h2>
              <div><label className="label">Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" /></div>
              <div><label className="label">Email</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" /></div>
              <div><label className="label">Subject</label><input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="input" /></div>
              <div><label className="label">Message</label><textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="input" /></div>
              <button disabled={loading} className="btn btn-primary w-full">{loading ? 'Sending...' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
