import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Home, ChevronRight, Dumbbell, Scale, Plus, X, PlayCircle, Pill, CheckCircle2, RefreshCcw, TrendingDown, ClipboardCheck, Utensils, User, Mail, Lock, Save, MessageSquare, AlertCircle, Send
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  
  // STATI DATI
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [weightEntries, setWeightEntries] = useState<any[]>([]);
  const [dietItems, setDietItems] = useState<any[]>([]);

  // STATI RICHIESTA CAMBIO ESERCIZIO
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({ exercise_name: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STATI RICHIESTA NUOVA SCHEDA
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [programData, setProgramData] = useState({ goal: '', notes: '' });
  const [isSubmittingProgram, setIsSubmittingProgram] = useState(false);

  // STATI RICHIESTA CAMBIO ALIMENTARE
  const [isDietRequestModalOpen, setIsDietRequestModalOpen] = useState(false);
  const [dietRequestData, setDietRequestData] = useState({ meal_name: '', reason: '' });
  const [isSubmittingDiet, setIsSubmittingDiet] = useState(false);

  // LOGICA LOCALSTORAGE INTEGRATORI
  const [supplements, setSupplements] = useState<string[]>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`supps_${today}`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const [gymDays, setGymDays] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const dataLoaded = useRef(false);

  // LISTA INTEGRATORI
  const supplementList = [
    { id: 'creatina', label: 'Creatina', dose: '5g' },
    { id: 'omega3', label: 'Omega 3', dose: '2 caps' },
    { id: 'multivit', label: 'Multivitaminico', dose: '1 tab' },
    { id: 'proteine', label: 'Whey Protein', dose: '30g' }
  ];

  const reasons = [
    "Dolore/Fastidio articolare",
    "Macchinario non disponibile",
    "Esercizio troppo difficile tecnicamente",
    "Mancanza di stimolo/Noia",
    "Altro"
  ];

  const dietReasons = [
    "Difficoltà a reperire l'alimento",
    "Gusto sgradevole",
    "Problemi di digestione",
    "Organizzazione pasti difficile",
    "Altro"
  ];

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.user_type !== 'client') {
        navigate('/');
        return;
      }
      fetchData();
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    if (!user || dataLoaded.current) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [planRes, weightRes, logRes, daysRes, dietRes] = await Promise.all([
        supabase.from('workout_plans').select(`*, workout_exercises (*)`).eq('client_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('weight_logs').select('*').eq('client_id', user.id).order('logged_at', { ascending: true }),
        supabase.from('daily_logs').select('supplements').eq('client_id', user.id).eq('date', today).maybeSingle(),
        supabase.from('days_of_week').select('day_name').eq('client_id', user.id),
        supabase.from('diet_items').select('*').eq('client_id', user.id).order('created_at', { ascending: true })
      ]);
      
      if (planRes.data) {
        const sorted = planRes.data.workout_exercises?.sort((a: any, b: any) => a.order_index - b.order_index);
        setWorkoutPlan({ ...planRes.data, workout_exercises: sorted });
      }

      if (weightRes.data) {
        setWeightEntries(weightRes.data.map(d => ({
          ...d,
          date: new Date(d.logged_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
        })));
      }

      if (daysRes.data) {
        setGymDays(daysRes.data.map(d => d.day_name));
      }

      if (dietRes.data) {
        setDietItems(dietRes.data);
      }

      if (logRes.data?.supplements) {
        setSupplements(logRes.data.supplements);
        localStorage.setItem(`supps_${today}`, JSON.stringify(logRes.data.supplements));
      }
      
      dataLoaded.current = true;
    } catch (err) { console.error('Errore:', err); } finally { setLoading(false); }
  };

  const handleSendRequest = async () => {
    if (!user || !requestData.exercise_name || !requestData.reason) {
      alert("Compila tutti i campi");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('exercise_change_requests').insert({
        client_id: user.id,
        exercise_name: requestData.exercise_name,
        reason: requestData.reason
      });
      if (error) throw error;
      alert("Richiesta inviata al trainer!");
      setIsRequestModalOpen(false);
      setRequestData({ exercise_name: '', reason: '' });
    } catch (err: any) {
      alert("Errore: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDietRequest = async () => {
    if (!user || !dietRequestData.meal_name || !dietRequestData.reason) {
      alert("Compila tutti i campi");
      return;
    }
    setIsSubmittingDiet(true);
    try {
      const { error } = await supabase.from('diet_change_requests').insert({
        client_id: user.id,
        meal_name: dietRequestData.meal_name,
        reason: dietRequestData.reason
      });
      if (error) throw error;
      alert("Richiesta cambio alimento inviata!");
      setIsDietRequestModalOpen(false);
      setDietRequestData({ meal_name: '', reason: '' });
    } catch (err: any) {
      alert("Errore: " + err.message);
    } finally {
      setIsSubmittingDiet(false);
    }
  };

  const handleSendProgramRequest = async () => {
    if (!user || !programData.goal) {
      alert("Specifica almeno l'obiettivo principale");
      return;
    }
    setIsSubmittingProgram(true);
    try {
      const { error } = await supabase.from('program_requests').insert({
        client_id: user.id,
        goal: programData.goal,
        notes: programData.notes
      });
      if (error) throw error;
      alert("Richiesta nuova scheda inviata!");
      setIsProgramModalOpen(false);
      setProgramData({ goal: '', notes: '' });
    } catch (err: any) {
      alert("Errore: " + err.message);
    } finally {
      setIsSubmittingProgram(false);
    }
  };

  const resetWeek = async () => {
    if (!confirm("Sei sicuro di voler resettare il tracker settimanale?")) return;
    if (user) {
      const { error } = await supabase.from('days_of_week').delete().eq('client_id', user.id);
      if (!error) setGymDays([]);
    }
  };

  const toggleSupplement = async (id: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = supplements.includes(id) ? supplements.filter(s => s !== id) : [...supplements, id];
    setSupplements(updated);
    localStorage.setItem(`supps_${today}`, JSON.stringify(updated));

    await supabase.from('daily_logs').upsert({
      client_id: user.id, 
      date: today, 
      supplements: updated, 
      updated_at: new Date().toISOString()
    }, { onConflict: 'client_id, date' });
  };

  const resetSupplements = async () => {
    if (!confirm("Resettare l'integrazione di oggi?")) return;
    const today = new Date().toISOString().split('T')[0];
    setSupplements([]);
    localStorage.removeItem(`supps_${today}`);
    if (user) {
      await supabase.from('daily_logs').upsert({
        client_id: user.id, 
        date: today, 
        supplements: [], 
        updated_at: new Date().toISOString()
      }, { onConflict: 'client_id, date' });
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || !user) return;
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ client_id: user.id, weight: parseFloat(newWeight) })
      .select().single();
    if (!error && data) {
      setWeightEntries(prev => [...prev, {
        ...data, date: new Date(data.logged_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
      }]);
      setNewWeight('');
      setIsWeightModalOpen(false);
    }
  };

  const resetWeight = async () => {
    if (!confirm("Cancellare lo storico del peso?")) return;
    if (user) {
      await supabase.from('weight_logs').delete().eq('client_id', user.id);
      setWeightEntries([]);
    }
  };

  const getMonthlyReport = () => {
    if (weightEntries.length < 2) return "In attesa dati";
    const diff = weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
  };

  if ((authLoading || loading) && !dataLoaded.current) return (
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
              <span className="text-2xl font-black italic tracking-tighter text-orange-600 uppercase">Client</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 text-gray-400 hover:text-orange-600 transition-colors"><Home className="w-6 h-6" /></Link>
            <button onClick={() => signOut()} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><LogOut className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
        
        {/* TRACKER ALLENAMENTO SETTIMANALE */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Workout Tracker</h3>
              <p className="text-[9px] font-black text-orange-600 uppercase mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Basato sulle sessioni salvate
              </p>
            </div>
            <button onClick={resetWeek} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
            {daysOfWeek.map((day) => {
              const isDone = gymDays.includes(day);
              return (
                <div key={day} className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all ${isDone ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-gray-50 text-gray-400'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-2">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? 'bg-white/20' : 'bg-gray-50'}`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Integrazione Odierna</h3>
              </div>
              <button onClick={resetSupplements} className="text-[9px] font-black text-gray-300 uppercase flex items-center gap-1 hover:text-red-500">
                <RefreshCcw className="w-2 h-2" /> Reset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supplementList.map((supp) => {
                const isChecked = supplements.includes(supp.id);
                return (
                  <button key={supp.id} onClick={() => toggleSupplement(supp.id)} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isChecked ? 'bg-orange-600 border-orange-600 text-white shadow-lg scale-[1.02]' : 'bg-white border-gray-50 text-gray-400'}`}>
                    <div className="text-left">
                      <p className={`font-black uppercase italic tracking-tighter text-lg leading-none mb-1 ${isChecked ? 'text-white' : 'text-gray-900'}`}>{supp.label}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isChecked ? 'text-orange-100' : 'text-gray-400'}`}>Dose: {supp.dose}</p>
                    </div>
                    <CheckCircle2 className={`w-7 h-7 ${isChecked ? 'text-white' : 'text-gray-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900">Andamento Peso</h3>
                <button onClick={resetWeight} className="text-[9px] font-black text-gray-300 uppercase flex items-center gap-1 hover:text-red-500">
                  <RefreshCcw className="w-2 h-2" /> Reset
                </button>
              </div>
              <button onClick={() => setIsWeightModalOpen(true)} className="p-2 bg-orange-600 text-white rounded-xl">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="h-32 w-full">
              {weightEntries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightEntries}>
                    <Area type="monotone" dataKey="weight" stroke="#F06A28" strokeWidth={3} fillOpacity={0.1} fill="#F06A28" />
                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 text-[10px] font-bold uppercase">Nessun dato</div>
              )}
            </div>
            <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Bilancio Mese</p>
                <p className="text-2xl font-black text-gray-900">{getMonthlyReport()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* WORKOUT SESSION */}
        <div className="bg-[#111827] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 leading-none">
              {workoutPlan?.name || "Nessun piano attivo"}
            </h2>
            <div className="grid grid-cols-1 gap-4 max-w-4xl mt-8">
              {workoutPlan?.workout_exercises?.map((ex: any, index: number) => (
                <div key={ex.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center gap-5">
                    <span className="text-orange-600 font-black italic text-3xl opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <p className="text-xl font-black uppercase tracking-tighter">{ex.exercise_name}</p>
                      <p className="text-orange-500 font-bold text-sm uppercase">{ex.sets_reps}</p>
                    </div>
                  </div>
                  {ex.video_url && (
                    <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="bg-orange-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase">Video</a>
                  )}
                </div>
              ))}
            </div>
            {workoutPlan && (
              <div className="mt-10">
                <Link to={`/workout-plan/${workoutPlan.id}`} className="bg-white text-[#111827] px-12 py-6 rounded-2xl font-black uppercase flex items-center gap-4">
                  Inizia Sessione <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
            )}
          </div>
          <Dumbbell className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 -rotate-12" />
        </div>

        {/* PIANO ALIMENTARE */}
        <div className="bg-white rounded-[3rem] p-8 md:p-10 border border-orange-100 shadow-sm flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600">
                <Scale className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[#111827]">Piano Alimentare</h3>
                <p className="text-gray-500 font-medium italic mt-1">Dettaglio pasti personalizzati.</p>
              </div>
            </div>
            {workoutPlan?.meal_plan_url && (
              <a href={workoutPlan.meal_plan_url} target="_blank" rel="noopener noreferrer" className="bg-[#111827] text-white px-10 py-5 rounded-2xl font-black uppercase hover:bg-orange-600 transition-all">Scarica PDF</a>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 max-w-4xl">
            {dietItems.length > 0 ? dietItems.map((item: any, index: number) => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center gap-5">
                  <span className="text-orange-600 font-black italic text-3xl opacity-50">{(index + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <p className="text-xl font-black uppercase tracking-tighter text-gray-900">{item.name}</p>
                    <p className="text-orange-600 font-black text-xs uppercase italic tracking-tighter">{item.meal_name}</p>
                    <p className="text-gray-500 font-bold text-sm uppercase">{item.description || "Nessuna descrizione"}</p>
                  </div>
                </div>
                <div className="mt-2 md:mt-0 px-4 py-2 bg-white rounded-xl border border-orange-100 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-gray-400 italic">{item.meal_type || "Pasto"}</span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                <p className="text-gray-300 font-black uppercase italic text-xs tracking-widest">Nessun alimento inserito nel piano</p>
              </div>
            )}
          </div>
        </div>

        {/* PROFILO */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-orange-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Profilo Personale</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Gestisci le tue credenziali e dati</p>
              </div>
            </div>
            <Link to="/client-profile" className="w-full md:w-auto bg-[#111827] text-white px-10 py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-orange-600 transition-all">Modifica Profilo <ChevronRight className="w-5 h-5" /></Link>
          </div>
        </div>

        {/* RICHIESTA NUOVA SCHEDA (GRANDE SOTTO PROFILO) */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-orange-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-[#111827] text-white rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Richiedi Nuova Scheda</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Hai terminato il ciclo? Chiedi il nuovo piano</p>
              </div>
            </div>
            <button onClick={() => setIsProgramModalOpen(true)} className="w-full md:w-auto bg-[#F06A28] text-white px-10 py-5 rounded-2xl font-black uppercase flex items-center justify-center gap-3 hover:bg-[#111827] transition-all">Richiedi Scheda <Plus className="w-5 h-5" /></button>
          </div>
        </div>

        {/* DOPPIA RICHIESTA (50/50) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RICHIESTA CAMBIO ALIMENTARE */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-200 shadow-sm border-dashed">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Utensils className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900">Cambio Alimentare</h3>
                  <p className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">Sostituisci un alimento del piano</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDietRequestModalOpen(true)}
                className="w-full bg-[#111827] text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition-all text-sm"
              >
                Invia Richiesta <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RICHIESTA CAMBIO ESERCIZIO */}
          <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-200 shadow-sm border-dashed">
            <div className="flex flex-col h-full justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white text-orange-600 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900">Cambio Esercizio</h3>
                  <p className="text-gray-500 font-bold text-[9px] uppercase tracking-widest">Difficoltà tecnica? Chiedi una variante</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-900 transition-all text-sm shadow-lg shadow-orange-100"
              >
                Invia Richiesta <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL PESO */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-bold uppercase italic mb-8 text-center">Aggiorna Peso</h3>
            <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-full bg-gray-50 border-2 rounded-2xl px-6 py-4 text-3xl font-black mb-6 text-center" placeholder="00.0" />
            <button onClick={handleAddWeight} className="w-full bg-[#111827] text-white py-5 rounded-2xl font-black uppercase">Salva</button>
            <button onClick={() => setIsWeightModalOpen(false)} className="w-full mt-4 text-gray-400 font-bold uppercase text-xs">Annulla</button>
          </div>
        </div>
      )}

      {/* MODAL CAMBIO ESERCIZIO */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl relative">
            <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-orange-600"><X className="w-6 h-6" /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><AlertCircle className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Richiesta Cambio</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Esercizio</label>
                <select value={requestData.exercise_name} onChange={(e) => setRequestData({...requestData, exercise_name: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 appearance-none">
                  <option value="">Scegli dal tuo piano...</option>
                  {workoutPlan?.workout_exercises?.map((ex: any) => <option key={ex.id} value={ex.exercise_name}>{ex.exercise_name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Motivazione</label>
                <select value={requestData.reason} onChange={(e) => setRequestData({...requestData, reason: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 appearance-none">
                  <option value="">Perché cambiare?</option>
                  {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={handleSendRequest} disabled={isSubmitting} className="w-full py-6 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Invia al Trainer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIO ALIMENTARE */}
      {isDietRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl relative">
            <button onClick={() => setIsDietRequestModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-orange-600"><X className="w-6 h-6" /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Utensils className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Cambio Alimento</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Alimento/Pasto</label>
                <select value={dietRequestData.meal_name} onChange={(e) => setDietRequestData({...dietRequestData, meal_name: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 appearance-none">
                  <option value="">Scegli l'alimento...</option>
                  {dietItems.map((item: any) => <option key={item.id} value={item.name}>{item.name} ({item.meal_name})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Motivazione</label>
                <select value={dietRequestData.reason} onChange={(e) => setDietRequestData({...dietRequestData, reason: e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 appearance-none">
                  <option value="">Perché cambiare?</option>
                  {dietReasons.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={handleSendDietRequest} disabled={isSubmittingDiet} className="w-full py-6 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmittingDiet ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Invia Richiesta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUOVA SCHEDA */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl relative">
            <button onClick={() => setIsProgramModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-orange-600"><X className="w-6 h-6" /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><ClipboardCheck className="w-6 h-6" /></div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Richiedi Programma</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Obiettivo</label>
                <select value={programData.goal} onChange={(e) => setProgramData({...programData, goal: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 appearance-none">
                  <option value="">Seleziona obiettivo...</option>
                  <option value="Massa (Ipertrofia)">Massa (Ipertrofia)</option>
                  <option value="Definizione (Cut)">Definizione (Cut)</option>
                  <option value="Forza">Forza</option>
                  <option value="Ricomposizione">Ricomposizione</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Note extra</label>
                <textarea value={programData.notes} onChange={(e) => setProgramData({...programData, notes: e.target.value})} rows={3} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 resize-none" placeholder="Scrivi eventuali cambiamenti..." />
              </div>
              <button onClick={handleSendProgramRequest} disabled={isSubmittingProgram} className="w-full py-5 bg-[#111827] text-white rounded-[1.5rem] font-black uppercase flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmittingProgram ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Invia Richiesta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}