import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Save, User, Dumbbell, LogOut, Home, Mail, Lock 
} from 'lucide-react';

export default function TrainerProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); // Usiamo user direttamente per fetch fresche
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  // Funzione per recuperare i dati freschi dal DB
  const fetchProfileData = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setFormData(prev => ({
        ...prev,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: user.email || '',
        password: '' // Resettiamo sempre il campo password per sicurezza
      }));
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Aggiorna i dati anagrafici nel database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Aggiorna l'Email (se modificata)
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
        alert("Richiesta cambio email inviata! Controlla la posta per confermare.");
      }

      // 3. Aggiorna la Password (se inserita)
      if (formData.password.length > 0) {
        if (formData.password.length < 6) {
          throw new Error("La password deve essere di almeno 6 caratteri.");
        }
        const { error: pwdError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (pwdError) throw pwdError;
      }

      // AGGIORNAMENTO DATI LOCALI: Ricarichiamo i dati appena salvati
      await fetchProfileData();

      alert("Profilo aggiornato con successo!");
    } catch (error: any) {
      alert("Errore durante l'aggiornamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

      <main className="max-w-3xl mx-auto px-6 pt-24 space-y-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Torna alla dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-10">
              <div className="w-20 h-20 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-200">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
                  Il Tuo Profilo
                </h2>
                <p className="text-orange-600 font-bold text-xs uppercase italic mt-1">Gestione dati e credenziali Trainer</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Nome</label>
                  <input
                    type="text" required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Cognome</label>
                  <input
                    type="text" required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-6">
                <div className="h-px bg-gray-100 w-full mb-6"></div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email di Accesso
                  </label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Nuova Password (opzionale)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] font-bold text-gray-900 outline-none focus:border-orange-600 focus:bg-white transition-all"
                    placeholder="Lascia vuoto per non cambiare"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-6 bg-[#111827] text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Salvataggio...' : 'Salva Informazioni'}
                </button>
              </div>
            </form>
          </div>
          <Dumbbell className="absolute -right-10 -bottom-10 w-48 h-48 text-gray-50 -rotate-12 pointer-events-none" />
        </div>
      </main>
    </div>
  );
}