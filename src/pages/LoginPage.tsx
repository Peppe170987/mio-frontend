import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Dumbbell, AlertCircle, User, Briefcase, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'client' | 'trainer' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Tenta il login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        // 2. Recupera il profilo per verificare il tipo
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          throw new Error("Errore nel recupero del profilo.");
        }

        // 3. Controllo incrociato: VERIFICA TIPO UTENTE
        if (userType === 'client' && profile.user_type !== 'client') {
          await supabase.auth.signOut();
          setLoading(false); // Sblocca il pulsante
          setError("ACCESSO NEGATO: Questo account è registrato come TRAINER. Usa l'Area Trainer.");
          return;
        }

        if (userType === 'trainer' && profile.user_type !== 'trainer') {
          await supabase.auth.signOut();
          setLoading(false); // Sblocca il pulsante
          setError("ACCESSO NEGATO: Questo account è registrato come ATLETA. Usa l'Area Atleta.");
          return;
        }

        // 4. Se tutto coincide, naviga
        if (profile.user_type === 'trainer') {
          navigate('/trainer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err.message === 'Invalid login credentials') {
        setError('Email o password errati.');
      } else {
        setError(err.message);
      }
    } finally {
      // Non mettiamo setLoading(false) qui perché se il login va a buon fine, 
      // il componente si smonta durante la navigazione.
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Dumbbell className="w-10 h-10 text-[#F06A28]" />
            <span className="text-3xl font-bold text-[#111827]">
              Underdogs<span className="text-[#F06A28]">Fitness</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-[#111827] mb-4 uppercase tracking-tighter italic leading-tight">Bentornato</h1>
          <p className="text-lg text-gray-500 mb-12 font-medium italic">Seleziona il tuo portale di accesso</p>

          <div className="grid md:grid-cols-2 gap-6">
            <button onClick={() => setUserType('client')} className="group bg-white rounded-[2rem] p-8 border-2 border-orange-100 hover:border-[#F06A28] transition-all text-left flex flex-col items-start gap-4 shadow-sm shadow-orange-100/20">
              <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-[#F06A28] transition-colors">
                <User className="w-8 h-8 text-[#F06A28] group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Area Atleta</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">Accedi ai tuoi piani e monitora i progressi.</p>
              </div>
            </button>
            <button onClick={() => setUserType('trainer')} className="group bg-white rounded-[2rem] p-8 border-2 border-orange-100 hover:border-[#111827] transition-all text-left flex flex-col items-start gap-4 shadow-sm shadow-orange-100/20">
              <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-[#111827] transition-colors">
                <Briefcase className="w-8 h-8 text-[#111827] group-hover:text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Area Trainer</h2>
                <p className="text-gray-500 text-sm mt-2 font-medium">Gestisci i tuoi clienti e le loro schede.</p>
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
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Dumbbell className="w-10 h-10 text-[#F06A28]" />
            <span className="text-3xl font-bold text-[#111827]">
              Underdogs<span className="text-[#F06A28]">Fitness</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#111827] uppercase italic tracking-tighter leading-tight">
            Login <span className="text-[#F06A28]">{userType === 'trainer' ? 'Trainer' : 'Atleta'}</span>
          </h1>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-[2.5rem] border-2 border-orange-100 p-8 md:p-10 space-y-6 shadow-xl shadow-orange-100/20">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bold uppercase tracking-tight">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> 
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" 
              placeholder="Inserisci la tua email" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#F06A28] transition-all font-medium" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-[#F06A28] text-white rounded-[1.5rem] hover:bg-[#d85a1e] transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50 mt-4 uppercase tracking-tighter"
          >
            {loading ? 'Verifica in corso...' : <>ACCEDI <ChevronRight className="w-5 h-5" /></>}
          </button>

          <div className="text-center pt-4">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-tight">
              Non hai un account? <Link to="/registrati" className="text-[#F06A28] hover:underline">Registrati</Link>
            </p>
          </div>
        </form>

        <button 
          onClick={() => { setUserType(null); setError(''); }} 
          className="w-full mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#111827] transition-colors"
        >
          &larr; Torna alla selezione portale
        </button>
      </div>
    </div>
  );
}