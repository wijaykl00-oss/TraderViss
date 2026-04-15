import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { logOut, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, TrendingUp, Wallet, ArrowDownToLine, LogOut } from 'lucide-react';
import TradingView from './TradingView';
import DepositView from './DepositView';
import WithdrawView from './WithdrawView';
import DashboardHome from './DashboardHome';

export default function Dashboard({ user }: { user: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user?.uid) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    await logOut();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dashboard/trade', icon: TrendingUp, label: 'Trading' },
    { path: '/dashboard/deposit', icon: Wallet, label: 'Deposit' },
    { path: '/dashboard/withdraw', icon: ArrowDownToLine, label: 'Withdraw' },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card md:rounded-none md:border-y-0 md:border-l-0 border-r border-gold-500/20 flex flex-col z-20">
        <div className="p-6 border-b border-gold-500/10 flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold text-gold-300 gold-glow-text tracking-wider">TradeV</h1>
          <span className="text-xs text-gold-500 tracking-[0.2em] uppercase">TraderViss</span>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-menu-item justify-start gap-3 ${isActive ? '!bg-gold-500/20 !border-gold-400/50' : ''}`}
              >
                <item.icon size={18} className={isActive ? 'text-gold-300' : 'text-gold-500'} />
                <span className={`nav-menu-text ${isActive ? '!text-white gold-glow-text' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gold-500/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=ca8a04&color=fff`} alt="Profile" className="w-10 h-10 rounded-full border border-gold-500/30" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gold-500 truncate">Saldo: Rp {userData?.balance?.toLocaleString('id-ID') || 0}</p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full nav-menu-item justify-start gap-3 !border-red-500/20 hover:!bg-red-500/10 hover:!border-red-500/40"
          >
            <LogOut size={18} className="text-red-400" />
            <span className="nav-menu-text !text-red-400 group-hover:!text-red-300 group-hover:shadow-none">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-gold-500/5 blur-[150px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} userData={userData} />} />
            <Route path="/trade" element={<TradingView user={user} userData={userData} />} />
            <Route path="/deposit" element={<DepositView user={user} />} />
            <Route path="/withdraw" element={<WithdrawView user={user} userData={userData} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
