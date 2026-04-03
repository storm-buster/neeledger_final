import React, { useState } from 'react';
import { Twitter, Github, Mail, ArrowUp } from 'lucide-react';
import { useEffect } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [compact, setCompact] = useState(false);

  // Remove any duplicate standalone "Contact Us" heading/section rendered above footer.
  useEffect(() => {
    try {
      const nodes = Array.from(document.querySelectorAll('h1,h2,h3,h4,div'));
      nodes.forEach(n => {
        const text = (n.textContent || '').trim();
        if (!text) return;
        if (text === 'Contact Us' || text.toLowerCase() === 'contact us') {
          // don't remove if it's inside our footer
          if (!n.closest('footer')) n.remove();
        }
      });
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  // track compact-footer body class so we can render a shorter footer on specific pages
  useEffect(() => {
    try {
      const check = () => setCompact(document.body.classList.contains('compact-footer'));
      check();
      const obs = new MutationObserver(() => check());
      obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => obs.disconnect();
    } catch (e) {
      // ignore in SSR
    }
  }, []);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setEmail(''), 600);
  }

  const outerPadding = compact ? 'py-3 px-3' : 'py-6 px-4';
  const innerMax = compact ? 'max-w-4xl' : 'max-w-5xl';
  const lowerTop = compact ? 'mt-3 pt-3' : 'mt-6 pt-4';

  return (
    <footer className={`readable-surface readable-surface-dark-overlay text-white ${outerPadding} border border-white/6`}>
      <div className={`${innerMax} mx-auto grid grid-cols-1 md:grid-cols-3 gap-4`}>
        <div>
          <div className="text-xl font-extrabold mb-1">NeeLedger</div>
          <p className="text-sm text-white">Secure, verifiable carbon credit management — transparent by design.</p>

          {/* Contact details (prominent, footer-only) */}
          <div className="mt-3">
            <h4 className="font-semibold text-md text-white mb-1">Contact</h4>
            <div className="text-white text-sm font-medium">spearsh29workin@gmail.com</div>
            <div className="text-white text-sm font-medium mt-1">+91 8851958484</div>
            <div className="text-white/90 text-xs mt-1">Usar College, Delhi</div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <a href="https://twitter.com" aria-label="Twitter" className="p-2 rounded hover:bg-white/6 transition">
              <Twitter className="w-5 h-5 text-white/90" />
            </a>
            <a href="https://github.com" aria-label="GitHub" className="p-2 rounded hover:bg-white/6 transition">
              <Github className="w-5 h-5 text-white/90" />
            </a>
            <a href="mailto:hello@neegledger.org" aria-label="Email" className="p-2 rounded hover:bg-white/6 transition">
              <Mail className="w-5 h-5 text-white/90" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-1.5 text-sm text-white">
              <li><a href="/projects" className="hover:underline">Projects</a></li>
              <li><a href="/verification" className="hover:underline">Verification</a></li>
              <li><a href="/xai" className="hover:underline">XAI Reports</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Resources</h4>
            <ul className="space-y-1.5 text-sm text-white">
              <li><a href="/docs" className="hover:underline">Docs</a></li>
              <li><a href="/blog" className="hover:underline">Blog</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Stay Updated</h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 items-center">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="text-sm rounded-md px-2 py-1.5 bg-white/8 border border-white/12 w-full text-white" />
              <button type="submit" className="px-3 py-1.5 bg-nee-500 rounded-md text-white text-sm">{subscribed ? 'Subscribed' : 'Subscribe'}</button>
            </form>
            <p className="text-xs text-white/70 mt-1">No spam — unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      <div className={`${innerMax} mx-auto ${lowerTop} border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-2 text-sm`}>
        <div className="text-white/90 text-sm">© {new Date().getFullYear()} NeeLedger. All rights reserved.</div>
        <div className="flex items-center gap-3 text-white/90">
          <a href="/privacy" className="hover:underline text-sm">Privacy</a>
          <a href="/terms" className="hover:underline text-sm">Terms</a>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="p-2 rounded hover:bg-white/6 transition">
            <ArrowUp className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>
    </footer>
  );
}
