import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Sparkles } from 'lucide-react'

export default function About() {
  return (
    <div>
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src="https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg" alt="About YUSMÉ" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-6xl text-cream mb-4">Our Story</h1>
            <p className="text-cream/80 text-lg">Wear Confidence. Love Yourself.</p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <h2 className="font-serif text-3xl mb-6 text-center">How YUSMÉ Began</h2>
        <div className="prose prose-lg max-w-none text-ink/70 leading-relaxed space-y-4">
          <p>YUSMÉ was created with the idea that fashion and beauty should make every person feel confident and comfortable. Every collection is designed to bring warmth, simplicity, and elegance together — pieces that fit effortlessly into everyday life while making a quiet statement.</p>
          <p>The name YUSMÉ is a blend inspired by two names close to our hearts — Youssef and Basmala. It carries a sense of care, identity, and self-love that runs through everything we make. We believe that what you wear should feel like an expression of who you are, not a costume you put on.</p>
          <p>From oversized tees to skincare essentials, each product is chosen with intention. We favor clean lines, warm tones, and materials that feel good against the skin. Our goal is simple: to help you build a wardrobe and a routine that feels genuinely <em>you</em>.</p>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Our Mission', text: 'To create fashion and beauty products that empower people to feel confident in their own skin — every single day.' },
            { icon: Eye, title: 'Our Vision', text: 'To be a brand known for warmth, simplicity, and elegance, where every product tells a story of self-love.' },
            { icon: Heart, title: 'Our Values', text: 'Quality over quantity. Comfort without compromise. Beauty that feels authentic and personal.' },
          ].map(v => (
            <div key={v.title} className="card p-8 text-center">
              <v.icon size={32} className="mx-auto text-mustard-500 mb-4" />
              <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
              <p className="text-ink/70 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Sparkles size={32} className="mx-auto text-mustard-500 mb-4" />
        <h2 className="font-serif text-3xl mb-4">Join Our Journey</h2>
        <p className="text-ink/60 mb-8">Discover pieces designed with love, made for you.</p>
        <Link to="/shop" className="btn btn-primary">Shop the Collection</Link>
      </section>
    </div>
  )
}
