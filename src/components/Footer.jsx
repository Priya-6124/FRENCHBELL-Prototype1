import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin, Phone, Mail, Clock, ExternalLink, Heart, ShieldCheck
} from 'lucide-react';
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from './BrandIcons';

export default function Footer({ onNavigate }) {
  const { settings } = useApp();

  const cafeName = settings?.cafe_name || 'FrenchBell Cafe';
  const cafeAddress = settings?.cafe_address || 'K. Narayanpura, Bengaluru – 560077, Karnataka';
  const cafePhone = settings?.cafe_phone || '+91 98765 43210';
  const cafeEmail = settings?.cafe_email || 'hello@frenchbellcafe.com';
  const cafeHours = settings?.cafe_hours || '11:00 AM – 11:30 PM';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/frenchbellcafe';
  const facebookUrl = settings?.facebook_url || 'https://facebook.com/frenchbellcafe';
  const whatsappNumber = settings?.whatsapp_number || '+919876543210';
  const cleanWaNumber = whatsappNumber.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${cleanWaNumber}?text=Hello%20FrenchBell%20Cafe!`;
  const mapUrl = settings?.map_url || "https://maps.app.goo.gl/w4z22NYUUiSxUxiJ6";
  const mapEmbedUrl = settings?.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.6346914561876!2d77.6416629!3d13.0600021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1700505cef43%3A0xc792bc75b8cb8b90!2sFrench%20Bell%2C%20Kristu%20Jayanti%20College!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin";
  const directionsUrl = mapUrl;

  return (
    <footer className="bg-french-dark text-french-cream pt-16 pb-10 border-t border-french-gold/25 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 border-b border-french-gold/20">

          {/* Col 1: Cafe Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-french-gold p-0.5 bg-french-dark gold-glow">
                <img src="/assets/logo.jfif" alt={cafeName} className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl text-french-cream tracking-wide">
                  FRENCHBELL
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-french-gold font-bold">
                  CAFE • BENGALURU
                </span>
              </div>
            </div>

            <p className="text-xs text-french-cream/80 leading-relaxed max-w-sm font-normal">
              Your favorite local cafe for loaded fries, crispy zinger burgers, steamed & fried momos, gourmet rolls, strips, and platters. Prepared fresh to order.
            </p>

            {/* Actual Social App Icons */}
            <div className="pt-1 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-french-gold/90 block">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform shadow-md rounded-xl overflow-hidden"
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-9 h-9" />
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform shadow-md rounded-xl overflow-hidden"
                  title="Chat with us on WhatsApp"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-9 h-9" />
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-110 transition-transform shadow-md rounded-xl overflow-hidden"
                  title="Follow us on Facebook"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-9 h-9" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) - Strictly useful links, no Home/Menu/About */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-french-gold">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-french-cream/80 font-medium">
              <li>
                <a href="#contact-info" className="hover:text-french-gold transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#privacy-policy" onClick={(e) => e.preventDefault()} className="hover:text-french-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms-conditions" onClick={(e) => e.preventDefault()} className="hover:text-french-gold transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#refund-policy" onClick={(e) => e.preventDefault()} className="hover:text-french-gold transition-colors">
                  Refund & Cancellation Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details (3 cols) */}
          <div id="contact-info" className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-french-gold">
              Contact & Hours
            </h4>
            <div className="space-y-2.5 text-xs text-french-cream/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-french-gold shrink-0 mt-0.5" />
                <span>{cafeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-french-gold shrink-0" />
                <span>{cafeHours}</span>
              </div>
              <div className="flex items-center gap-2.5 font-mono">
                <Phone className="w-4 h-4 text-french-gold shrink-0" />
                <span>{cafePhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-french-gold shrink-0" />
                <span>{cafeEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Interactive Cafe Map (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            <h4 className="font-serif font-bold text-sm uppercase tracking-wider text-french-gold">
              Find Our Cafe
            </h4>
            <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-french-gold/30 shadow-md group">
              <iframe
                title="FrenchBell Cafe Location Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="filter contrast-95 opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-french-gold hover:underline mt-1"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-french-cream/60 gap-4">
          <p>&copy; 2026 {cafeName}. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for food lovers in Bengaluru</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
