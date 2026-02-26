import { Users, Target, TrendingUp } from 'lucide-react';

export default function StatsSection() {
  return (
    <section className="py-24 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-orange-50 text-[#F06A28] text-[10px] font-black rounded-full mb-4 uppercase tracking-[0.2em]">
            Dati e Performance
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-[#111827] uppercase tracking-tighter italic">
            Il Fitness in <span className="text-[#F06A28]">Italia</span>
          </h2>
          <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto font-medium italic">
            I numeri parlano chiaro: l'approccio scientifico e personalizzato è l'unica via per il successo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Card 1 */}
          <div className="group text-center p-10 bg-white rounded-[2.5rem] border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-[1.5rem] mb-6 text-[#F06A28] group-hover:bg-[#F06A28] group-hover:text-white transition-colors">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-5xl font-bold text-[#111827] mb-2 tracking-tighter">6M+</div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
              Italiani in palestra
            </p>
          </div>

          {/* Card 2 */}
          <div className="group text-center p-10 bg-white rounded-[2.5rem] border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-[1.5rem] mb-6 text-[#F06A28] group-hover:bg-[#F06A28] group-hover:text-white transition-colors">
              <Target className="w-8 h-8" />
            </div>
            <div className="text-5xl font-bold text-[#111827] mb-2 tracking-tighter">30%</div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
              Senza un piano mirato
            </p>
          </div>

          {/* Card 3 */}
          <div className="group text-center p-10 bg-white rounded-[2.5rem] border-2 border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-[1.5rem] mb-6 text-[#F06A28] group-hover:bg-[#F06A28] group-hover:text-white transition-colors">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="text-5xl font-bold text-[#111827] mb-2 tracking-tighter">3x</div>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
              Risultati più veloci con i nostri metodi
            </p>
          </div>
        </div>

        {/* Citazione in stile Banner Dashboard */}
        <div className="relative overflow-hidden py-16 px-8 bg-[#F06A28] rounded-[3rem] text-white shadow-2xl shadow-orange-200 border-4 border-orange-400/20">
          <div className="relative z-10 text-center">
            <blockquote className="text-3xl md:text-5xl font-bold uppercase italic tracking-tighter leading-tight">
              "Non aspettare il momento perfetto.<br />Costruiscilo ora."
            </blockquote>
          </div>
          {/* Decorazione astratta sullo sfondo */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}