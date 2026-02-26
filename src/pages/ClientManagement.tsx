import { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { supabase } from '../lib/supabase'; 
import { useAuth } from '../context/AuthContext'; 
import {  
  ChevronLeft, Trash2, Scale,  
  Dumbbell, Apple, Upload, Activity, TrendingDown
} from 'lucide-react'; 
// Aggiunto Area e AreaChart per le animazioni e lo stile richiesto
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts'; 

export default function ClientManagement() { 
  const { clientId } = useParams(); 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 
   
  const [clientProfile, setClientProfile] = useState<any>(null); 
  const [workoutPlan, setWorkoutPlan] = useState<any>(null); 
  const [dietPlan, setDietPlan] = useState<any>(null); 
  
  const [exercises, setExercises] = useState<any[]>(() => {
    const saved = localStorage.getItem(`exercises_${clientId}`);
    return saved ? JSON.parse(saved) : [];
  }); 

  const [dietItems, setDietItems] = useState<any[]>(() => {
    const saved = localStorage.getItem(`diet_${clientId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [weightData, setWeightData] = useState<any[]>([]); 
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [uploading, setUploading] = useState(false); 
   
  const [newEx, setNewEx] = useState({ name: '', reps: '', video: '' }); 
  const [newDiet, setNewDiet] = useState({ meal: '', description: '' }); 

  // Funzione per calcolare il bilancio (Monthly Report)
  const getMonthlyReport = () => {
    if (weightData.length < 2) return "In attesa dati";
    const diff = weightData[weightData.length - 1].weight - weightData[0].weight;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`;
  };

  useEffect(() => { 
    const fetchClientData = async () => { 
      if (!clientId) return;
      try { 
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', clientId).single(); 
        if (profile) setClientProfile(profile); 

        let { data: plan } = await supabase 
          .from('workout_plans') 
          .select('*, workout_exercises(*)') 
          .eq('client_id', clientId) 
          .eq('is_active', true) 
          .maybeSingle(); 

        if (plan) { 
          setWorkoutPlan(plan); 
          const sortedEx = (plan.workout_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index); 
          setExercises(sortedEx); 
          localStorage.setItem(`exercises_${clientId}`, JSON.stringify(sortedEx));
        }

        const { data: dPlan } = await supabase
          .from('diet_plans')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_active', true)
          .maybeSingle();

        if (dPlan) {
          setDietPlan(dPlan);
          const { data: dItems } = await supabase.from('diet_items').select('*').eq('plan_id', dPlan.id);
          if (dItems) {
            setDietItems(dItems);
            localStorage.setItem(`diet_${clientId}`, JSON.stringify(dItems));
          }
        }

        const { data: weights } = await supabase.from('weight_logs').select('*').eq('client_id', clientId).order('logged_at', { ascending: true }); 
        setWeightData(weights?.map(w => ({ ...w, weight: parseFloat(w.weight), date: new Date(w.logged_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) })) || []); 

        const { data: logs } = await supabase.from('exercise_logs').select(`*, workout_exercises(exercise_name)`).eq('client_id', clientId).order('logged_at', { ascending: false }).limit(10); 
        setExerciseLogs(logs || []); 

      } catch (err) { console.error("Errore fetch:", err); } finally { setLoading(false); } 
    }; 
    fetchClientData(); 
  }, [clientId, user]); 

  const addExercise = async () => { 
    const name = newEx.name.trim();
    const reps = newEx.reps.trim();
    if (!name || !clientId) return; 

    try {
      let currentPlanId = workoutPlan?.id;
      if (!currentPlanId) {
        const { data: newPlan, error: planError } = await supabase.from('workout_plans').insert([{ client_id: clientId, trainer_id: user?.id, is_active: true, name: 'Piano Allenamento' }]).select().single();
        if (planError) throw planError;
        currentPlanId = newPlan.id;
        setWorkoutPlan(newPlan);
      }
      const { data, error } = await supabase.from('workout_exercises').insert([{ plan_id: currentPlanId, exercise_name: name, sets_reps: reps || '3x10', video_url: newEx.video.trim() || null }]).select().single();
      if (error) throw error;
      if (data) {
        const updated = [...exercises, data];
        setExercises(updated);
        localStorage.setItem(`exercises_${clientId}`, JSON.stringify(updated));
        setNewEx({ name: '', reps: '', video: '' });
      }
    } catch (err: any) { alert("Errore: " + err.message); }
  }; 

  const addDietItem = async () => { 
    const mealName = newDiet.meal.trim();
    const desc = newDiet.description.trim();
    if (!mealName || !clientId) return; 
    try {
      let currentDietPlanId = dietPlan?.id;
      if (!currentDietPlanId) {
        const { data: newDPlan, error: dPlanError } = await supabase.from('diet_plans').insert([{ client_id: clientId, trainer_id: user?.id, is_active: true, name: 'Piano Alimentare' }]).select().single();
        if (dPlanError) throw dPlanError;
        currentDietPlanId = newDPlan.id;
        setDietPlan(newDPlan);
      }
      const { data, error } = await supabase.from('diet_items').insert([{ plan_id: currentDietPlanId, client_id: clientId, meal_name: mealName, description: desc }]).select().single();
      if (error) throw error;
      if (data) {
        const updatedDiet = [...dietItems, data];
        setDietItems(updatedDiet);
        localStorage.setItem(`diet_${clientId}`, JSON.stringify(updatedDiet));
        setNewDiet({ meal: '', description: '' });
      }
    } catch (err: any) { alert("Errore: " + err.message); }
  };

  const deleteExercise = async (id: string) => { 
    const filtered = exercises.filter(ex => ex.id !== id);
    setExercises(filtered);
    localStorage.setItem(`exercises_${clientId}`, JSON.stringify(filtered));
    await supabase.from('workout_exercises').delete().eq('id', id);
  }; 

  const deleteDietItem = async (id: string) => {
    const filtered = dietItems.filter(item => item.id !== id);
    setDietItems(filtered);
    localStorage.setItem(`diet_${clientId}`, JSON.stringify(filtered));
    await supabase.from('diet_items').delete().eq('id', id);
  };

  return ( 
    <div className="min-h-screen bg-[#FDFCFB] pb-20"> 
      <nav className="bg-white border-b p-6 sticky top-0 z-40"> 
        <div className="max-w-7xl mx-auto flex items-center justify-between"> 
          <button onClick={() => navigate(-1)} className="text-gray-400 font-bold flex items-center gap-2 hover:text-orange-600"> 
            <ChevronLeft className="w-5 h-5" /> Dashboard 
          </button> 
          <h1 className="text-xl font-black uppercase italic tracking-tighter">
            {clientProfile?.first_name} {clientProfile?.last_name}
          </h1> 
          <div className="w-10"></div>
        </div> 
      </nav> 

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8"> 
        <div className="lg:col-span-2 space-y-8"> 
          <section className="bg-white rounded-[2.5rem] p-8 border shadow-sm"> 
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"> 
              <Dumbbell className="text-orange-600"/> Allenamento 
            </h2> 
            <div className="bg-[#111827] rounded-[2rem] p-6 mb-8 shadow-xl"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> 
                <input placeholder="Esercizio" value={newEx.name} onChange={e => setNewEx({...newEx, name: e.target.value})} className="bg-white/10 rounded-xl p-4 text-white font-bold outline-none" /> 
                <input placeholder="Sets x Reps" value={newEx.reps} onChange={e => setNewEx({...newEx, reps: e.target.value})} className="bg-white/10 rounded-xl p-4 text-white font-bold outline-none" /> 
              </div> 
              <button onClick={addExercise} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase hover:bg-white hover:text-orange-600 transition-all">Aggiungi Esercizio</button> 
            </div> 
            <div className="space-y-3"> 
              {exercises.map((ex, idx) => ( 
                <div key={ex.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm"> 
                  <div className="flex items-center gap-4"> 
                    <span className="text-gray-200 font-black italic text-3xl">{idx + 1}</span> 
                    <div><p className="font-black uppercase italic text-gray-900 leading-none">{ex.exercise_name}</p><p className="text-orange-600 font-black text-[11px] uppercase">{ex.sets_reps}</p></div> 
                  </div> 
                  <button onClick={() => deleteExercise(ex.id)} className="text-gray-200 hover:text-red-500"><Trash2 className="w-5 h-5"/></button> 
                </div> 
              ))} 
            </div> 
          </section> 

          <section className="bg-white rounded-[2.5rem] p-8 border shadow-sm"> 
            <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3"> 
              <Apple className="text-orange-600"/> Piano Alimentare 
            </h2> 
            <div className="bg-[#111827] rounded-[2rem] p-6 mb-8 shadow-xl"> 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> 
                <input placeholder="Pasto" value={newDiet.meal} onChange={e => setNewDiet({...newDiet, meal: e.target.value})} className="bg-white/10 rounded-xl p-4 text-white font-bold outline-none" /> 
                <input placeholder="Dettagli" value={newDiet.description} onChange={e => setNewDiet({...newDiet, description: e.target.value})} className="bg-white/10 rounded-xl p-4 text-white font-bold outline-none" /> 
              </div> 
              <button onClick={addDietItem} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase hover:bg-white hover:text-orange-600 transition-all">Salva Voce Dieta</button> 
            </div> 
            <div className="space-y-3"> 
              {dietItems.map((item, idx) => ( 
                <div key={item.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm"> 
                  <div className="flex items-center gap-4"> 
                    <span className="text-gray-200 font-black italic text-3xl">{idx + 1}</span> 
                    <div><p className="font-black uppercase italic text-gray-900 leading-none">{item.meal_name}</p><p className="text-orange-600 font-black text-[11px] uppercase">{item.description}</p></div> 
                  </div> 
                  <button onClick={() => deleteDietItem(item.id)} className="text-gray-200 hover:text-red-500"><Trash2 className="w-5 h-5"/></button> 
                </div> 
              ))} 
            </div> 
          </section> 
        </div> 

        <div className="space-y-8"> 
          {/* SEZIONE PESO AGGIORNATA CON STILE E ANIMAZIONI RICHIESTE */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-900 flex items-center gap-2">
                  <Scale className="text-orange-600 w-5 h-5"/> Andamento Peso
                </h3>
              </div>
              {/* Nessun pulsante di aggiunta o reset come richiesto */}
            </div>
            
            <div className="h-40 w-full">
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F06A28" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F06A28" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                      labelStyle={{fontWeight: 'bold', color: '#111827'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#F06A28" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                      animationBegin={200}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-300 text-[10px] font-bold uppercase">In attesa di log dall'atleta</div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Variazione Totale</p>
                <p className="text-2xl font-black text-gray-900">{getMonthlyReport()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </section>
        </div> 
      </main> 
    </div> 
  ); 
}