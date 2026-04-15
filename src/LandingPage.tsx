import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, signInWithGoogle } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Coins, LogIn, User as UserIcon, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup after a short delay, but only once per visit (session)
    const hasSeenPopup = sessionStorage.getItem('hasSeenBonusPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('hasSeenBonusPopup', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleNicknameAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname.length < 3) {
      setError("Nickname minimal 3 karakter");
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Convert nickname to a pseudo-email for Firebase Auth compatibility
    const fakedEmail = `${nickname.toLowerCase().replace(/[^a-z0-9]/g, '')}@tradev.app`;

    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, fakedEmail, password);
        // Save their nickname as their displayName so it appears correctly in Dashboard
        await updateProfile(res.user, { displayName: nickname });
      } else {
        await signInWithEmailAndPassword(auth, fakedEmail, password);
      }
    } catch (err: any) {
      let errorMessage = "Gagal melakukan autentikasi";
      if (err.message.includes('email-already-in-use')) errorMessage = "Nickname sudah dipakai orang lain";
      if (err.message.includes('wrong-password') || err.message.includes('invalid-credential')) errorMessage = "Nickname atau Password salah";
      if (err.message.includes('user-not-found')) errorMessage = "Akun belum terdaftar";
      if (err.message.includes('configuration-not-found')) errorMessage = "Sistem Error: Harap hubungi Admin atau pastikan Email/Password aktif di Console";
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex flex-col">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gold-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gold-300 gold-glow-text tracking-wider">TradeV</h1>
          <span className="text-xs text-gold-500 tracking-[0.2em] uppercase">TraderViss</span>
        </div>
        
        <div className="hidden md:flex gap-4">
          <Link to="/" className="nav-menu-item">
            <span className="nav-menu-text">Home</span>
          </Link>
          <Link to="/info" className="nav-menu-item">
            <span className="nav-menu-text">About</span>
          </Link>
          <Link to="/info" className="nav-menu-item">
            <span className="nav-menu-text">Services</span>
          </Link>
          <Link to="/testimonial" className="nav-menu-item">
            <span className="nav-menu-text">Testimonial</span>
          </Link>
        </div>

        <button 
          onClick={() => { setShowAuthModal(true); setIsRegister(false); }}
          className="nav-menu-item !bg-gold-500/20 !border-gold-400/50 hover:!bg-gold-400/30 flex items-center gap-2"
        >
          <LogIn size={16} className="text-gold-200" />
          <span className="nav-menu-text !text-gold-100">Sign In</span>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Master the <span className="text-gold-400 gold-glow-text">Gold Market</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Experience real-time gold trading with TradeV. Start your journey today and claim your free initial balance to practice and earn.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => { setShowAuthModal(true); setIsRegister(true); }}
              className="px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-dark-900 font-bold text-lg hover:from-gold-500 hover:to-gold-300 transition-all shadow-[0_0_20px_rgba(202,138,4,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Buat Akun Sekarang
            </button>
            <button 
              onClick={handleGoogleLogin}
              className="px-8 py-4 glass-card rounded-lg text-white font-bold text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1 border border-gold-500/30" />
              Sign in with Google
            </button>
          </div>
        </motion.div>
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-8 max-w-md w-full relative border-gold-500/30"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/50 shadow-[0_0_15px_rgba(202,138,4,0.3)]">
                    {isRegister ? <UserIcon size={24} className="text-gold-400" /> : <Lock size={24} className="text-gold-400" />}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{isRegister ? 'Buat Akun TradeV' : 'Selamat Datang Kembali'}</h3>
                <p className="text-gray-400 text-sm">
                  {isRegister ? 'Daftar untuk mulai trading' : 'Masuk ke akun Anda'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleNicknameAuth} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nickname (Tanpa Spasi)</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ''))}
                      className="w-full bg-dark-900 border border-gold-500/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="Misal: traderking99"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-dark-900 border border-gold-500/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-400 transition-colors"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-dark-900 font-bold hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 mt-2 shadow-[0_0_15px_rgba(202,138,4,0.3)]"
                >
                  {loading ? 'Memproses...' : (isRegister ? 'Daftar Sekarang' : 'Masuk')}
                </button>
              </form>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-800 text-gray-400 rounded-full border border-gray-700 backdrop-blur-sm">Atau lanjutkan dengan</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                type="button"
                className="w-full py-3 bg-white hover:bg-gray-100 rounded-lg text-gray-900 font-bold transition-all flex items-center justify-center gap-3 border border-transparent shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>

              <div className="mt-6 text-center text-sm text-gray-400">
                {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                <button 
                  onClick={() => { setIsRegister(!isRegister); setError(''); }} 
                  className="text-gold-400 hover:text-gold-300 font-bold underline decoration-gold-500/30 underline-offset-4"
                >
                  {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bonus Popup */}
      <AnimatePresence>
        {showPopup && !showAuthModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm"
          >
            <div className="glass-card p-8 max-w-md w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-300 to-gold-600"></div>
              
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <div className="w-24 h-24 mx-auto mb-6 bg-gold-500/20 rounded-full flex items-center justify-center border border-gold-400/30 shadow-[0_0_30px_rgba(202,138,4,0.3)]">
                <Coins size={48} className="text-gold-300" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to TradeV!</h3>
              <p className="text-gold-400 font-bold text-xl mb-6 gold-glow-text">
                KLAIM RP 200.000 GRATIS DI AWAL MENDAFTAR
              </p>
              
              <button 
                onClick={() => {
                  setShowPopup(false);
                  setShowAuthModal(true);
                  setIsRegister(true);
                }}
                className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(202,138,4,0.4)]"
              >
                Klaim Sekarang & Daftar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
