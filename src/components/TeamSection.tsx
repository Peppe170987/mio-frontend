import { Heart, Award, Users, Dumbbell } from 'lucide-react';

export default function TeamSection() {
  return (
    <section id="chi-siamo" className="py-24 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-orange-50 text-[#F06A28] text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.2em]">
            Il Nostro DNA
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#111827] uppercase tracking-tighter italic">
            Chi <span className="text-[#F06A28]">Siamo</span>
          </h2>
          <p className="text-xl text-gray-500 mt-4 max-w-3xl mx-auto font-medium italic">
            Siamo nati da un'idea semplice: fornire gli strumenti d'élite per permettere a chiunque di superare i propri limiti.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card Passione */}
          <div className="group bg-white rounded-[2.5rem] p-10 text-center border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-[1.5rem] mb-6 text-[#F06A28] group-hover:bg-[#F06A28] group-hover:text-white transition-colors">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] uppercase italic tracking-tight mb-3">Passione</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Crediamo nel potenziale inespresso di ogni individuo e nella forza della determinazione pura.
            </p>
          </div>

          {/* Card Esperienza */}
          <div className="group bg-white rounded-[2.5rem] p-10 text-center border-2 border-[#111827] shadow-sm hover:shadow-xl hover:shadow-gray-200 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-[1.5rem] mb-6 text-[#111827] group-hover:bg-[#111827] group-hover:text-white transition-colors">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] uppercase italic tracking-tight mb-3">Esperienza</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Oltre 20 anni nel coaching professionale, trasformando vite attraverso la scienza del movimento.
            </p>
          </div>

          {/* Card Community */}
          <div className="group bg-white rounded-[2.5rem] p-10 text-center border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-[1.5rem] mb-6 text-[#F06A28] group-hover:bg-[#F06A28] group-hover:text-white transition-colors">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] uppercase italic tracking-tight mb-3">Community</h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Un ecosistema di atleti e trainer d'élite uniti dall'ossessione per il miglioramento costante.
            </p>
          </div>
        </div>

        {/* Manifesto Team */}
        <div className="relative overflow-hidden bg-[#111827] rounded-[3rem] p-12 md:p-16 text-white shadow-2xl shadow-gray-300 border-4 border-gray-800">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-[#F06A28] rounded-[2rem] flex items-center justify-center rotate-3 shadow-xl">
                <Dumbbell className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="md:w-3/4 text-center md:text-left">
              <h3 className="text-3xl font-bold uppercase italic tracking-tighter mb-6">
                Il Team <span className="text-[#F06A28]">Underdogs Fitness</span>
              </h3>
              <p className="text-lg text-gray-300 font-medium italic leading-relaxed mb-6">
                Siamo professionisti che hanno trasformato l'esperienza sul campo in una piattaforma rivoluzionaria. 
                Il nostro obiettivo è rendere l'allenamento d'élite accessibile, creando un ponte tecnologico tra 
                atleti e i migliori personal trainer qualificati.
              </p>
              <div className="inline-block py-2 px-4 bg-orange-50/10 rounded-lg">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#F06A28]">
                  Insieme verso la tua miglior versione.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}