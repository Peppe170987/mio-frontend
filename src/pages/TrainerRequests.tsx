import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Dumbbell, MessageSquare, AlertCircle, User, Calendar, CheckCircle2, Home, LogOut, ClipboardCheck, Utensils
} from 'lucide-react';

export default function TrainerRequests() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [programRequests, setProgramRequests] = useState<any[]>([]);
  const [dietRequests, setDietRequests] = useState<any[]>([]); // Stato per richieste alimentari
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data: assignments } = await supabase
        .from('trainer_client_assignments')
        .select('client_id')
        .eq('trainer_id', user.id);

      const clientIds = assignments?.map(a => a.client_id) || [];

      if (clientIds.length > 0) {
        const { data: exData, error: exError } = await supabase
          .from('exercise_change_requests')
          .select(`
            *,
            user_profiles!client_id (first_name, last_name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });

        const { data: progData, error: progError } = await supabase
          .from('program_requests')
          .select(`
            *,
            user_profiles!fk_program_client (first_name, last_name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });

        // MODIFICA: Recupero richieste alimentari
        const { data: dietData, error: dietError } = await supabase
          .from('diet_change_requests')
          .select(`
            *,
            user_profiles!client_id (first_name, last_name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });

        if (exError) console.error("Errore Esercizi:", exError);
        if (progError) console.error("Errore Schede:", progError);
        if (dietError) console.error("Errore Dieta:", dietError);

        setRequests(exData || []);
        setProgramRequests(progData || []);
        setDietRequests(dietData || []);
      }
    } catch (error: any) {
      console.error("Errore generale:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleDelete = async (id: string, table: string) => {
    if (!confirm("Segnare come completata ed eliminare la richiesta?")) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (table === 'program_requests') {
        setProgramRequests(prev => prev.filter(item => item.id !== id));
      } else if (table === 'diet_change_requests') {
        setDietRequests(prev => prev.filter(item => item.id !== id));
      } else {
        setRequests(prev => prev.filter(item => item.id !== id));
      }

    } catch (error: any) {
      alert("Errore durante l'eliminazione: " + error.message);
      fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#F06A28]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="w-8 h-8 text-orange-600" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">Underdogs</span>
              <span className="text-2xl font-black italic tracking-tighter text-orange-600 uppercase">Trainer</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/trainer-dashboard" className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                <Home className="w-6 h-6" />
            </Link>
            <button onClick={() => signOut()} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-24 space-y-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Torna alla dashboard
        </button>

        {/* SEZIONE 1: NUOVE SCHEDE */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-orange-100">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              Richieste Nuove Schede
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {programRequests.length > 0 ? (
              programRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-[2rem] p-6 border border-orange-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black uppercase italic tracking-tighter text-gray-900">
                        {req.user_profiles?.first_name} {req.user_profiles?.last_name}
                      </h4>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Obiettivo: {req.goal}</p>
                      {req.notes && <p className="text-xs text-gray-500 italic mt-1 font-medium">"{req.notes}"</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(req.id, 'program_requests')}
                    className="w-full md:w-auto px-6 py-3 bg-[#111827] text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Risolta
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-bold uppercase text-[18px] italic text-center py-4">Nessuna richiesta di nuova scheda</p>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* SEZIONE 2: CAMBIO ESERCIZIO */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-100">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              Supporto Esercizi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                          {req.user_profiles?.first_name} {req.user_profiles?.last_name}
                        </h4>
                        <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tighter flex items-center gap-1">
                          <Calendar className="w-2 h-2" /> {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-orange-600 font-black text-sm uppercase italic flex items-center gap-2">
                           <Dumbbell className="w-4 h-4" /> {req.exercise_name}
                        </p>
                        <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-blue-500" /> Motivo: {req.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(req.id, 'exercise_change_requests')}
                    className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Risolta
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-bold uppercase text-[18px] italic text-center py-4">Nessuna richiesta di cambio esercizio</p>
            )}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* MODIFICA: SEZIONE 3: CAMBIO ALIMENTO */}
        <section className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-green-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-green-100">
              <Utensils className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              Supporto Alimentare
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {dietRequests.length > 0 ? (
              dietRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                      <User className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                          {req.user_profiles?.first_name} {req.user_profiles?.last_name}
                        </h4>
                        <span className="text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tighter flex items-center gap-1">
                          <Calendar className="w-2 h-2" /> {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-green-600 font-black text-sm uppercase italic flex items-center gap-2">
                           <Utensils className="w-4 h-4" /> {req.meal_name}
                        </p>
                        <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-green-500" /> Motivo: {req.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDelete(req.id, 'diet_change_requests')}
                    className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Risolta
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-bold uppercase text-[18px] italic text-center py-4">Nessuna richiesta di cambio alimento</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}