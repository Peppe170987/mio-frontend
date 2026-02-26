import { ArrowRight, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section id="home" className="pt-24 pb-20 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-[#111827] leading-[1.1] tracking-tighter uppercase italic">
              Diventa la miglior versione di te con{' '}
              <span className="text-[#F06A28]">Underdogs Fitness</span>
            </h1>
            
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
              La piattaforma d'élite che unisce atleti e personal trainer per risultati reali, 
              piani su misura e monitoraggio costante.
            </p>
            
            {/* I pulsanti appaiono solo se l'utente NON è loggato */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/registrati"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#F06A28] text-white rounded-2xl hover:bg-[#d85a1e] transition-all font-bold text-lg shadow-xl shadow-orange-100 active:scale-95"
                >
                  Inizia Ora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login-cliente"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 border-2 border-[#111827] text-[#111827] rounded-2xl hover:bg-[#111827] hover:text-white transition-all font-bold text-lg active:scale-95"
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>

          {/* Anteprima Dashboard */}
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-100/50 rounded-[3rem] blur-2xl"></div>
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 border-2 border-orange-100">
              <div className="space-y-6">
                <div className="bg-[#F06A28] rounded-[1.5rem] p-6 text-white shadow-lg shadow-orange-200">
                  <h3 className="font-bold text-xl mb-1 italic uppercase tracking-tight">Dashboard Personale</h3>
                  <p className="text-sm opacity-90 font-medium">Gestione allenamenti e obiettivi</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-[1.5rem] p-5">
                    <div className="text-3xl font-bold text-[#111827]">74.5 kg</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Peso Monitorato</div>
                  </div>
                  <div className="bg-gray-50 rounded-[1.5rem] p-5">
                    <div className="text-3xl font-bold text-[#111827]">24</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Allenamenti</div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-100 rounded-[1.5rem] p-5 shadow-sm">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-sm font-bold text-[#111827]">Piano Settimanale</span>
                    <span className="text-sm text-[#F06A28] font-bold">5/7 giorni</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="bg-[#F06A28] h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}