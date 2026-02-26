import { Dumbbell, Menu, X, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile } = useAuth();

  // Determina il link della dashboard in base al tipo utente
  const dashboardLink = profile?.user_type === 'trainer' ? '/trainer-dashboard' : '/client-dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO - AGGIORNATO CON LO STILE DASHBOARD */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Dumbbell className="w-8 h-8 text-orange-600" />
            <div className="flex items-center">
              <span className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">
                Underdogs
              </span>
              <span className="text-2xl font-black italic tracking-tighter text-orange-600 uppercase">
                Fitness
              </span>
            </div>
          </Link>

           {/* DESKTOP LINKS */}
<div className="hidden md:flex items-center gap-8">
<a href="/#home" className="text-gray-700 hover:text-orange-600 transition font-medium">Home</a>
<a href="/#chi-siamo" className="text-gray-700 hover:text-orange-600 transition font-medium">Chi Siamo</a>
<a href="/#funzionalita" className="text-gray-700 hover:text-orange-600 transition font-medium">Funzionalità</a>
<a href="/#contatti" className="text-gray-700 hover:text-orange-600 transition font-medium">Contatti</a>
</div>

          {/* BOTTONI DESKTOP / ICONA PROFILO */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition font-bold uppercase text-sm tracking-tight"
                >
                  Login
                </Link>
                <Link
                  to="/registrati"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold uppercase text-sm tracking-tight shadow-md"
                >
                  Registrati
                </Link>
              </>
            ) : (
              <Link to={dashboardLink} className="text-gray-700 hover:text-orange-600 transition-colors">
                <UserCircle className="w-9 h-9" />
              </Link>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MENU MOBILE */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white shadow-inner">
            <div className="flex flex-col space-y-3 px-4 pb-4">
              <a href="/#home" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-700 font-medium">Home</a>
              <a href="/#chi-siamo" onClick={() => setIsMenuOpen(false)} className="py-2 text-gray-700 font-medium">Chi Siamo</a>
              <div className="pt-4 flex flex-col gap-3">
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 text-orange-600 border border-orange-600 rounded-lg font-bold uppercase text-sm">
                      Login
                    </Link>
                    <Link to="/registrati" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 bg-orange-600 text-white rounded-lg font-bold uppercase text-sm">
                      Registrati
                    </Link>
                  </>
                ) : (
                  <Link to={dashboardLink} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full text-center py-3 bg-orange-50 text-orange-600 rounded-lg font-bold uppercase text-sm">
                    <UserCircle className="w-5 h-5" /> Area Personale
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}