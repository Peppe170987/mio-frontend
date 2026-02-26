import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, PlayCircle, Save, Loader2, Calendar } from 'lucide-react';

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exercises, setExercises] = useState<any[]>([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Stato per la data della sessione (inizialmente vuota per obbligare la scelta)
  const [sessionDate, setSessionDate] = useState('');
  
  // Stato per memorizzare i carichi inseriti dall'utente
  const [logs, setLogs] = useState<Record<string, { weight: string, reps: string }>>({});

  useEffect(() => {
    const fetchWorkout = async () => {
      const { data } = await supabase
        .from('workout_plans')
        .select('name, workout_exercises(*)')
        .eq('id', id)
        .single();
      
      if (data) {
        setPlanName(data.name);
        setExercises(data.workout_exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || []);
      }
      setLoading(false);
    };
    fetchWorkout();
  }, [id]);

  const handleInputChange = (exId: string, field: 'weight' | 'reps', value: string) => {
    setLogs(prev => ({
      ...prev,
      [exId]: {
        ...prev[exId],
        [field]: value
      }
    }));
  };

  const saveSession = async () => {
    if (!user) return;

    // 1. Obbligo inserimento data
    if (!sessionDate) {
      alert("Devi selezionare la data dell'allenamento prima di salvare.");
      return;
    }

    // 2. Obbligo completamento di TUTTI i campi per ogni esercizio
    const allFieldsFilled = exercises.every(ex => 
      logs[ex.id]?.weight && 
      logs[ex.id]?.reps && 
      logs[ex.id].weight.trim() !== '' && 
      logs[ex.id].reps.trim() !== ''
    );

    if (!allFieldsFilled) {
      alert("Compila tutti i campi (Peso e Ripetizioni) per ogni esercizio prima di salvare.");
      return;
    }

    setSaving(true);
    
    try {
      const timestamp = `${sessionDate}T${new Date().toLocaleTimeString('it-IT', { hour12: false })}`;
      
      // Calcolo del nome del giorno (Lun, Mar, ecc.)
      const dateObj = new Date(sessionDate);
      const dayNameShort = dateObj.toLocaleDateString('it-IT', { weekday: 'short' });
      const formattedDay = dayNameShort.charAt(0).toUpperCase() + dayNameShort.slice(1, 3);

      // Prepariamo i log degli esercizi
      const logsToSave = Object.entries(logs).map(([exId, data]) => ({
        client_id: user.id,
        exercise_id: exId,
        weight: parseFloat(data.weight) || 0,
        reps_actual: parseInt(data.reps) || 0,
        logged_at: timestamp
      }));

      // Esecuzione salvataggi in parallelo
      await Promise.all([
        // Salvataggio log esercizi
        supabase.from('exercise_logs').insert(logsToSave),
        // Salvataggio nella nuova tabella days_of_week
        supabase.from('days_of_week').upsert({
          client_id: user.id,
          day_name: formattedDay,
          last_trained_at: timestamp
        }, { onConflict: 'client_id, day_name' })
      ]);

      alert("Allenamento salvato con successo!");
      navigate('/client-dashboard');
    } catch (err: any) {
      alert("Errore nel salvataggio: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic">CARICAMENTO...</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <nav className="bg-white border-b p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-black uppercase italic">
          <button onClick={() => navigate(-1)} className="text-gray-400 flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" /> Esci
          </button>
          <h1 className="tracking-tighter text-lg">{planName}</h1>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        
        {/* SELEZIONE GIORNO SESSIONE */}
        <div className="bg-orange-600 rounded-[2rem] p-6 text-white shadow-lg shadow-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5" />
            <h3 className="font-black uppercase italic tracking-tighter">Data Allenamento *</h3>
          </div>
          <input 
            type="date" 
            required
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className={`w-full bg-white/20 border-2 rounded-xl p-4 font-bold text-white outline-none focus:border-white transition-colors ${!sessionDate ? 'border-dashed border-white/50' : 'border-white/30'}`}
            style={{ colorScheme: 'dark' }}
          />
          <p className="text-[10px] font-bold uppercase mt-3 opacity-80">
            {!sessionDate ? "⚠️ Seleziona una data per procedere" : `Giorno selezionato per il tracker: ${new Date(sessionDate).toLocaleDateString('it-IT', { weekday: 'long' })}`}
          </p>
        </div>

        {exercises.map((ex, idx) => (
          <div key={ex.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-orange-600 font-black italic text-xs uppercase tracking-widest">Esercizio {idx + 1}</span>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">{ex.exercise_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <div className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black uppercase text-gray-500">Target</div>
                   <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{ex.sets_reps}</p>
                </div>
              </div>
              {ex.video_url && (
                <a href={ex.video_url} target="_blank" rel="noreferrer" className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all">
                  <PlayCircle className="w-6 h-6" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 italic">Carico (kg)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={logs[ex.id]?.weight || ''}
                  onChange={(e) => handleInputChange(ex.id, 'weight', e.target.value)}
                  className="w-full bg-gray-50 p-4 rounded-xl border-2 border-transparent font-black text-lg focus:border-orange-600 focus:bg-white outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2 italic">Ripetizioni</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={logs[ex.id]?.reps || ''}
                  onChange={(e) => handleInputChange(ex.id, 'reps', e.target.value)}
                  className="w-full bg-gray-50 p-4 rounded-xl border-2 border-transparent font-black text-lg focus:border-orange-600 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button 
            onClick={saveSession}
            disabled={saving}
            className="w-full bg-[#111827] text-white py-6 rounded-[2rem] font-black uppercase tracking-tighter shadow-xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
            <span className="text-lg">{saving ? 'Salvataggio in corso...' : 'Termina e Salva Sessione'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}