import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Users, LogOut, Dumbbell, User,
  ChevronRight, PlusCircle, Search, X, Home, ClipboardList, MessageSquare
} from 'lucide-react';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  fitness_goal: string;
  active_plan_name?: string;
  email?: string;
}

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [requestCount, setRequestCount] = useState(0); // Stato per il badge

  const dataLoaded = useRef(false);

  const [stats, setStats] = useState({
    totalClients: 0,
    workoutPlans: 0,
    mealPlans: 0
  });

  const fetchData = async () => {
    if (!user || dataLoaded.current) return;
    try {
      setLoading(true);
      
      // MODIFICA: Recupero conteggio da TRE tabelle (Esercizi, Programmi e Dieta)
      const [exRes, progRes, dietRes] = await Promise.all([
        supabase.from('exercise_change_requests').select('*', { count: 'exact', head: true }),
        supabase.from('program_requests').select('*', { count: 'exact', head: true }),
        supabase.from('diet_change_requests').select('*', { count: 'exact', head: true })
      ]);
      
      // Calcolo totale includendo la nuova tabella per il punto esclamativo
      const totalRequests = (exRes.count || 0) + (progRes.count || 0) + (dietRes.count || 0);
      setRequestCount(totalRequests);

      const { data: assignments, error: assignError } = await supabase
        .from('trainer_client_assignments')
        .select('client_id')
        .eq('trainer_id', user.id)
        .eq('is_active', true);

      if (assignError) throw assignError;

      const clientIds = assignments?.map((a) => a.client_id) || [];

      if (clientIds.length === 0) {
        setClients([]);
        setStats(prev => ({ ...prev, totalClients: 0 }));
        setLoading(false);
        dataLoaded.current = true;
        return;
      }

      const { data: profilesData, error: profError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', clientIds);

      if (profError) throw profError;

      const formattedClients = await Promise.all((profilesData || []).map(async (p) => {
        const { data: goalData } = await supabase
          .from('client_profiles')
          .select('fitness_goal')
          .eq('id', p.id)
          .maybeSingle();

        const { data: planData } = await supabase
          .from('workout_plans')
          .select('name')
          .eq('client_id', p.id)
          .eq('is_active', true)
          .maybeSingle();

        return {
          id: p.id,
          first_name: p.first_name || 'Atleta',
          last_name: p.last_name || '',
          fitness_goal: goalData?.fitness_goal || 'Nessun obiettivo impostato',
          active_plan_name: planData?.name
        };
      }));

      setClients(formattedClients);

      const { count: workoutCount } = await supabase
        .from('workout_plans')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id);

      const { count: mealCount } = await supabase
        .from('diet_plans')
        .select('*', { count: 'exact', head: true })
        .eq('trainer_id', user.id);

      setStats({
        totalClients: clientIds.length,
        workoutPlans: workoutCount || 0,
        mealPlans: mealCount || 0
      });

      dataLoaded.current = true;
    } catch (error) {
      console.error('Error in Trainer Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || profile?.user_type !== 'trainer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, profile]);

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail || !user) return;
    setIsAssigning(true);

    try {
      const { data: targetUser, error: searchError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (searchError || !targetUser) {
        alert("Utente non trovato nel sistema.");
        setIsAssigning(false);
        return;
      }

      const { error: assignError } = await supabase
        .from('trainer_client_assignments')
        .insert([{ 
          trainer_id: user.id, 
          client_id: targetUser.id, 
          is_active: true 
        }]);

      if (assignError) {
        if (assignError.code === '23505') alert("L'atleta è già presente nella tua gestione.");
        else throw assignError;
        setIsAssigning(false);
        return;
      }

      const newClient: Client = {
        id: targetUser.id,
        first_name: targetUser.first_name || 'Nuovo',
        last_name: targetUser.last_name || 'Atleta',
        fitness_goal: 'Dati in caricamento...',
      };

      setClients(prev => [newClient, ...prev]);
      setStats(prev => ({ ...prev, totalClients: prev.totalClients + 1 }));
      
      setIsModalOpen(false);
      setSearchEmail('');
      
      dataLoaded.current = false;
      fetchData();

    } catch (err: any) {
      console.error("Errore salvataggio:", err);
      alert("Errore: " + err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredClients = clients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !dataLoaded.current) return (
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
            <Link to="/" className="p-2 text-gray-400 hover:text-orange-600 transition-colors"><Home className="w-6 h-6" /></Link>
            <button onClick={() => signOut()} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><LogOut className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
        <div className="bg-[#111827] rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div><p className="text-orange-500 text-[10px] font-black uppercase mb-2">Atleti</p><h3 className="text-5xl font-black italic tracking-tighter">{stats.totalClients}</h3></div>
            <div><p className="text-orange-500 text-[10px] font-black uppercase mb-2">Piani Allenamento</p><h3 className="text-5xl font-black italic tracking-tighter">{stats.workoutPlans}</h3></div>
            <div><p className="text-orange-500 text-[10px] font-black uppercase mb-2">Piani Dieta</p><h3 className="text-5xl font-black italic tracking-tighter">{stats.mealPlans}</h3></div>
          </div>
          <Users className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">Gestione Atleti</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                type="text" 
                placeholder="Cerca atleta..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-gray-50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-200 hover:bg-orange-50/30 transition-all group min-h-[250px]">
              <PlusCircle className="w-12 h-12 text-gray-200 group-hover:text-orange-600 transition-colors" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Assegna Nuovo Atleta</span>
            </button>

            {filteredClients.map((client) => (
              <div key={client.id} className="group bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-orange-600 transition-all">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter mb-1 leading-none">{client.first_name} {client.last_name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 leading-none">{client.fitness_goal}</p>
                <Link to={`/client-management/${client.id}`} className="flex items-center justify-center gap-2 w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-[11px] uppercase group-hover:bg-orange-600 transition-colors">
                  Gestisci <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/trainer-profile" className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-orange-600 transition-all group block">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Scheda Personal Trainer</h3>
            <p className="text-gray-400 font-bold text-sm mb-6">Visualizza e modifica le tue informazioni professionali e i tuoi dati personali presenti nel database.</p>
            <div className="flex items-center gap-2 text-orange-600 font-black uppercase text-[11px] tracking-widest group-hover:translate-x-2 transition-transform">
              Modifica Profilo <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:border-orange-600 transition-all group">
            <div className="relative w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7" />
              {/* BADGE CON PUNTO ESCLAMATIVO SE CI SONO RICHIESTE */}
              {requestCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[14px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  !
                </div>
              )}
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Richieste Ricevute</h3>
            <p className="text-gray-400 font-bold text-sm mb-6">Gestisci le comunicazioni e le richieste di supporto in arrivo dai tuoi atleti.</p>
            <Link to="/trainer-requests" className="flex items-center gap-2 text-blue-600 font-black uppercase text-[11px] tracking-widest group-hover:translate-x-2 transition-transform">
              Visualizza Messaggi <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"><X /></button>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-center mb-8">Assegna Atleta</h3>
            <form onSubmit={handleAssignClient} className="space-y-4">
              <input
                type="email" required placeholder="email@esempio.it" value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-600 outline-none"
              />
              <button
                type="submit" disabled={isAssigning}
                className="w-full py-5 bg-[#111827] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50"
              >
                {isAssigning ? 'Salvataggio...' : 'Conferma'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}