import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Activity, Gift } from 'lucide-react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

// Generate mock real-time data
const generateData = () => {
  const data = [];
  let price = 1150000; // Base gold price in IDR/gram
  const now = new Date();
  
  for (let i = 20; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    price = price + (Math.random() - 0.5) * 5000;
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price)
    });
  }
  return data;
};

export default function DashboardHome({ user, userData }: { user: any, userData: any }) {
  const [data, setData] = useState(generateData());
  const currentPrice = data[data.length - 1].price;
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = prev[prev.length - 1].price;
        const newPrice = lastPrice + (Math.random() - 0.5) * 5000;
        
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: Math.round(newPrice)
        });
        return newData;
      });
    }, 3000); // Update every 3 seconds for "real-time" feel

    return () => clearInterval(interval);
  }, []);

  const handleClaimBonus = async () => {
    const targetUid = userData?.uid || user?.uid;
    if (!targetUid) return;
    setClaiming(true);
    try {
      const userRef = doc(db, 'users', targetUid);
      await setDoc(userRef, {
        balance: increment(200000),
        hasClaimedBonus: true
      }, { merge: true });
    } catch (error) {
      console.error("Gagal klaim bonus:", error);
      alert("Gagal mengklaim bonus, coba beberapa saat lagi.");
    } finally {
      setClaiming(false);
    }
  };

  // Show banner if userData doesn't exist (loading/error) OR explicitly hasn't claimed
  // If they have > 0 balance and true, dont show.
  const showClaimBanner = !userData || userData?.hasClaimedBonus === false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      </div>

      {showClaimBanner && (
        <div className="w-full bg-gradient-to-r from-gold-600/20 to-gold-400/10 border border-gold-500/30 rounded-xl p-6 glass-card relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold-500/20 rounded-xl border border-gold-400/30">
              <Gift size={28} className="text-gold-300" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white gold-glow-text">Hadiah Pengguna Baru</h3>
              <p className="text-gray-300 text-sm">Klaim modal trading awal Rp 200.000 sekarang juga!</p>
            </div>
          </div>
          <button 
            onClick={handleClaimBonus}
            disabled={claiming}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-400 text-dark-900 font-bold rounded-lg hover:from-gold-500 hover:to-gold-300 transition-all shadow-[0_0_15px_rgba(202,138,4,0.4)] disabled:opacity-50"
          >
            {claiming ? 'Memproses Klaim...' : 'Klaim Rp 200.000'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium whitespace-nowrap">Total Saldo</h3>
            <div className="p-2 bg-gold-500/20 rounded-lg shrink-0">
              <Wallet size={20} className="text-gold-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white truncate" title={`Rp ${userData?.balance?.toLocaleString('id-ID') || 0}`}>
            Rp {userData?.balance?.toLocaleString('id-ID') || 0}
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium whitespace-nowrap">Harga Emas Saat Ini</h3>
            <div className="p-2 bg-gold-500/20 rounded-lg shrink-0">
              <Activity size={20} className="text-gold-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-gold-300 gold-glow-text truncate">
            Rp {currentPrice.toLocaleString('id-ID')} <span className="text-sm text-gray-400 font-normal">/ gr</span>
          </p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium whitespace-nowrap">Total Deposit</h3>
            <div className="p-2 bg-gold-500/20 rounded-lg shrink-0">
              <TrendingUp size={20} className="text-gold-400" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white truncate" title={`Rp ${userData?.totalDeposited?.toLocaleString('id-ID') || 0}`}>
            Rp {userData?.totalDeposited?.toLocaleString('id-ID') || 0}
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Grafik Harga Emas (Real-time)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888' }} />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#666" 
                tick={{ fill: '#888' }}
                tickFormatter={(value) => `Rp ${(value/1000)}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#171717', borderColor: '#ca8a04', borderRadius: '8px' }}
                itemStyle={{ color: '#fde047' }}
                formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#eab308" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8, fill: '#facc15', stroke: '#0a0a0a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
