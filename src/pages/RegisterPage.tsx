import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Dumbbell, AlertCircle, CheckCircle, User, Briefcase, ChevronRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'trainer' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [fitnessGoal, setFitnessGoal] = useState('lose_fat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fitnessGoals = [
    { value: 'lose_fat', label: 'Perdere massa grassa' },
    { value: 'gain_muscle', label: 'Aumentare massa muscolare' },
    { value: 'tone', label: 'Tonificazione' },
    { value: 'endurance', label: 'Migliorare resistenza' },
    { value: 'athletic_prep', label: 'Preparazione atletica' },
    { value: 'rehabilitation', label: 'Riabilitazione funzionale' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.passwordConfirm) throw new Error('Le password non corrispondono');
      
      // MODIFICA QUI: Inviamo i dati al momento del signUp.
      // Il tuo trigger SQL 'handle_new_user' li leggerà da NEW.raw_user_meta_data
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: userType,
            phone: formData.phone
          }
        }
      });
      
      if (signUpError) throw signUpError;

      if (data.user) {
        // Non serve più chiamare .update('user_profiles') perché il trigger SQL 
        // ha già creato la riga corretta usando i metadati sopra.

        // Creazione profilo specifico nelle tabelle dedicate
        if (userType === 'client') {
          const { error: clientError } = await supabase
            .from('client_profiles')
            .upsert([{ id: data.user.id, fitness_goal: fitnessGoal }]);
          if (clientError) throw clientError;
        } else if (userType === 'trainer') {
          const { error: trainerError } = await supabase
            .from('trainer_profiles')
            .upsert([{ id: data.user.id, experience_years: 0 }]);
          if (trainerError) throw trainerError;
        }

        setSuccess(true);
        
        setTimeout(() => {
          if (userType === 'trainer') {
            navigate('/trainer-dashboard', { replace: true });
          } else {
            navigate('/client-dashboard', { replace: true });
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Registrazione fallita');
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center gap-2">
              <Dumbbell className="w-10 h-10 text-[#F06A28]" />
              <span className="text-3xl font-bold text-[#111827]">
                Underdogs<span className="text-[#F06A28]">Fitness</span>
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#111827] mb-4 uppercase tracking-tighter italic leading-tight">Unisciti a noi</h1>
          <p className="text-lg text-gray-500 mb-12 font-medium italic">Scegli come vuoi iniziare il tuo percorso</p>

          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setUserType('client')} className="group bg-white rounded-[2rem] p-8 border-2 border-orange-100 hover:border-[#F06A28] transition-all text-left flex flex-col items-start gap-4 shadow-sm">
              <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-[#F06A28] transition-colors">
                <User className="w-8 h-8 text-[#F06A28] group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Atleta</h2>
                <p className="text-gray-500 text-sm mt-2">Voglio allenarmi e trasformare il mio corpo.</p>
              </div>
            </button>
            <button onClick={() => setUserType('trainer')} className="group bg-white rounded-[2rem] p-8 border-2 border-orange-100 hover:border-[#111827] transition-all text-left flex flex-col items-start gap-4 shadow-sm">
              <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-[#111827] transition-colors">
                <Briefcase className="w-8 h-8 text-[#111827] group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Trainer</h2>
                <p className="text-gray-500 text-sm mt-2">Voglio gestire i miei atleti e le loro schede.</p>
              </div>
            </button>
          </div>
          <Link to="/" className="inline-block mt-12 text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#F06A28] transition-colors">Torna alla Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center py-16 px-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Dumbbell className="w-10 h-10 text-[#F06A28]" />
            <span className="text-3xl font-bold text-[#111827]">
              Underdogs<span className="text-[#F06A28]">Fitness</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#111827] uppercase italic tracking-tighter leading-tight">
            Nuovo Profilo <span className="text-[#F06A28]">{userType === 'trainer' ? 'Trainer' : 'Atleta'}</span>
          </h1>
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-[2.5rem] border-2 border-orange-100 p-8 md:p-12 space-y-8 shadow-sm">
          {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium"><AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}</div>}
          {success && <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium"><CheckCircle className="w-5 h-5 flex-shrink-0" /> Account creato!</div>}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nome</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" placeholder="Mario" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cognome</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" placeholder="Rossi" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" placeholder="mario@esempio.com" />
          </div>
          {userType === 'client' && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Obiettivo</label>
              <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium appearance-none">
                {fitnessGoals.map((goal) => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
              </select>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Conferma Password</label>
              <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleInputChange} required className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" />
            </div>
          </div>
          <button type="submit" disabled={loading || success} className="w-full py-5 bg-[#F06A28] text-white rounded-[1.5rem] hover:bg-[#d85a1e] transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-100 disabled:opacity-50">
            {loading ? 'Configurazione...' : <>REGISTRATI <ChevronRight className="w-5 h-5" /></>}
          </button>
        </form>
        <button onClick={() => setUserType(null)} className="w-full mt-8 text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#111827] transition-colors">
          &larr; Cambia tipo di account
        </button>
      </div>
    </div>
  );
}