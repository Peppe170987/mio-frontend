import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'client' | 'trainer';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // 1. Mentre carichiamo i dati da Supabase, fermati qui.
  // Se saltiamo questo, il profilo è null e verrai rimandato alla Home.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold text-orange-600 animate-pulse">
          Verifica autorizzazione in corso...
        </div>
      </div>
    );
  }

  // 2. Se l'utente non è loggato, mandalo al LOGIN (non alla registrazione)
  if (!user) {
    console.log("Accesso negato: utente non loggato");
    return <Navigate to="/login-cliente" replace />;
  }

  // 3. Controllo del tipo di utente
  if (requiredUserType && profile?.user_type !== requiredUserType) {
    console.error("ERRORE DI ACCESSO:", {
      richiesto: requiredUserType,
      trovato: profile?.user_type,
      email: user.email
    });
    
    // Se sei un trainer e provi a entrare in client-dashboard (o viceversa), ti rimanda alla tua dashboard corretta invece che alla home
    if (profile?.user_type === 'trainer') return <Navigate to="/trainer-dashboard" replace />;
    if (profile?.user_type === 'client') return <Navigate to="/client-dashboard" replace />;
    
    return <Navigate to="/" replace />;
  }

  // 4. Se tutto è ok, mostra la pagina
  return <>{children}</>;
}
