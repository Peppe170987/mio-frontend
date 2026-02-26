import { Mail, Phone, MapPin, Dumbbell, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contatti" className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-8 h-8 text-orange-600" />
              <span className="text-xl font-bold text-white">UnderdogsFitness</span>
            </div>
            <p className="text-gray-400">
              La piattaforma che unisce atleti e personal trainer per raggiungere risultati straordinari.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contatti</h3>
            <div className="space-y-3">
              <a href="mailto:supporto@underdogsfitness.it" className="flex items-center gap-2 hover:text-orange-500 transition">
                <Mail className="w-4 h-4" />
                giuseppefabw@gmail.com
              </a>
              <a href="tel:+393401234567" className="flex items-center gap-2 hover:text-orange-500 transition">
                <Phone className="w-4 h-4" />
                +39 3773818883
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Via Giulio Petroni 41<br />70124 Bari, Italia</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Link Utili</h3>
            <div className="space-y-2">
              <a href="#chi-siamo" className="block hover:text-orange-500 transition">Chi Siamo</a>
              <a href="#termini" className="block hover:text-orange-500 transition">Termini e Condizioni</a>
              <a href="#faq" className="block hover:text-orange-500 transition">FAQ</a>
              <a href="#supporto" className="block hover:text-orange-500 transition">Contatta il Supporto</a>
              <a href="#privacy" className="block hover:text-orange-500 transition">Privacy Policy</a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Per Professionisti</h3>
            { /*<a 
              href="https://t.me/peppino17_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram Bot 
           </a > */}
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} UnderdogsFitness. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}