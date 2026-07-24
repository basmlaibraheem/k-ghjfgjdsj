import { Link } from 'react-router-dom'
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-2xl mb-3">YUSMÉ</h3>
            <p className="text-sm text-cream/70 leading-relaxed">Wear Confidence. Love Yourself.</p>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-mustard-400">Shop</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link to="/shop" className="hover:text-cream">All Products</Link></li>
              <li><Link to="/shop?category=women" className="hover:text-cream">Women</Link></li>
              <li><Link to="/shop?category=men" className="hover:text-cream">Men</Link></li>
              <li><Link to="/shop?category=beauty" className="hover:text-cream">Beauty</Link></li>
              <li><Link to="/shop?category=skincare" className="hover:text-cream">Skincare</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-mustard-400">Company</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link to="/about" className="hover:text-cream">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-cream">Contact</Link></li>
              <li><Link to="/build-your-box" className="hover:text-cream">Build Your Box</Link></li>
              <li><Link to="/gift-cards" className="hover:text-cream">Gift Cards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-3 text-mustard-400">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" aria-label="Instagram" className="hover:text-mustard-400"><Instagram size={20} /></a>
              <a href="#" aria-label="Facebook" className="hover:text-mustard-400"><Facebook size={20} /></a>
              <a href="mailto:hello@yusme.com" aria-label="Email" className="hover:text-mustard-400"><Mail size={20} /></a>
            </div>
            <p className="text-sm text-cream/70 flex items-center gap-1"><MapPin size={14} /> Cairo, Egypt</p>
          </div>
        </div>
        <div className="border-t border-cream/10 mt-10 pt-6 text-sm text-cream/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} YUSMÉ. All rights reserved.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  )
}
