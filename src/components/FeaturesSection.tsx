import { CheckCircle, Users, Dumbbell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesSection() {
  return (
    <section id="funzionalita" className="py-24 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-orange-50 text-[#F06A28] text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.2em]">
            I Nostri Servizi
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#111827] uppercase tracking-tighter italic">
            Due Profili, Un Unico <span className="text-[#F06A28]">Obiettivo</span>
          </h2>
          <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto font-medium">
            Sia che tu stia guidando una squadra o trasformando il tuo corpo, abbiamo gli strumenti d'élite per te.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Card Trainer */}
          <div className="bg-white rounded-[2.5rem] p-10 border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all flex flex-col">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-[#111827] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#111827] uppercase italic tracking-tight">Profilo Trainer</h3>
                <p className="text-[#F06A28] font-bold text-xs uppercase tracking-widest">Management & Performance</p>
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Gestione avanzata schede allenamento" />
              <FeatureItem text="Database esercizi personalizzabile" />
              <FeatureItem text="Monitoraggio real-time feedback atleti" />
              <FeatureItem text="Analisi progressi e statistiche" />
              <FeatureItem text="Assegnazione piani alimentari" />
            </div>

            <Link
              to="/registrati"
              className="inline-flex items-center gap-2 px-8 py-5 bg-[#111827] text-white rounded-2xl hover:bg-[#F06A28] transition-all font-bold w-full justify-center shadow-lg shadow-gray-200"
            >
              DIVENTA UN COACH UNDERDOGS
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Card Atleta */}
          <div className="bg-white rounded-[2.5rem] p-10 border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all flex flex-col">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-[#F06A28] rounded-2xl flex items-center justify-center shadow-lg">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#111827] uppercase italic tracking-tight">Profilo Atleta</h3>
                <p className="text-[#F06A28] font-bold text-xs uppercase tracking-widest">Training & Results</p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Focus disponibili:</h4>
              <div className="flex flex-wrap gap-2">
                {['Massa Grassa', 'Massa Muscolare', 'Tonificazione', 'Resistenza', 'Preparazione Atletica'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-orange-50 text-[#F06A28] border border-orange-100 rounded-lg text-[10px] font-black uppercase italic">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <FeatureItem text="Visione scheda tecnica personalizzata" />
              <FeatureItem text="Sistema di invio feedback rapido" />
              <FeatureItem text="Piani alimentari dinamici" />
              <FeatureItem text="Storico statistiche peso personale" />
              <FeatureItem text="Tracking obiettivi settimanali" />
            </div>

            <Link
              to="/registrati"
              className="inline-flex items-center gap-2 px-8 py-5 bg-[#F06A28] text-white rounded-2xl hover:bg-[#d85a1e] transition-all font-bold w-full justify-center shadow-lg shadow-orange-100"
            >
              INIZIA IL TUO PERCORSO
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="flex-shrink-0 w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
        <CheckCircle className="w-3.5 h-3.5 text-[#F06A28]" />
      </div>
      <span className="text-[#111827] font-medium text-sm group-hover:translate-x-1 transition-transform">{text}</span>
    </div>
  );
}