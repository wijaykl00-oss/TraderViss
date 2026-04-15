import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Activity } from 'lucide-react';

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

export default function DashboardHome({ userData }: { userData: any }) {
  const [data, setData] = useState(generateData());
  const currentPrice = data[data.length - 1].price;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-between overflow-hidden">
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
