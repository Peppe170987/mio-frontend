import { MessageCircle, Bell, Zap, Clock } from 'lucide-react';

export default function TelegramSection() {
  return (
    <section id="telegram-bot" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Integrazione con Telegram Bot
            </h2>

            <p className="text-xl mb-8 opacity-90">
              Hai bisogno di aiuto durante l'allenamento? Chatta subito con il nostro bot Telegram:
              aggiornamenti, reminder e accesso rapido alle tue schede.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Primo quadratino aggiornato: Sistema Attivo 24/7 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <Clock className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Sistema Attivo 24/7</h3>
                <p className="text-sm opacity-90">Sempre a tua disposizione per ogni necessità</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <Zap className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Accesso Rapido</h3>
                <p className="text-sm opacity-90">Visualizza le tue schede ovunque</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                <MessageCircle className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Supporto Live</h3>
                <p className="text-sm opacity-90">Assistenza diretta quando serve</p>
              </div>
            </div>

            <a
              href="https://t.me/peppino17_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-medium text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Apri Telegram Bot
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}