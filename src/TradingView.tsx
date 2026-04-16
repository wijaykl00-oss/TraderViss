import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

// Generate mock real-time data
const generateData = () => {
  const data = [];
  let price = 1150000;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2000);
    price = price + (Math.random() - 0.5) * 2000;
    data.push({ time: time.toLocaleTimeString([], { second: '2-digit' }), price: Math.round(price) });
  }
  return data;
};

export default function TradingView({ user, userData }: { user: any, userData: any }) {
  const [data, setData] = useState(generateData());
  const [amount, setAmount] = useState<string>('10000');
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderTab, setOrderTab] = useState<'buy' | 'sell'>('buy');
  const currentPrice = data[data.length - 1].price;

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = prev[prev.length - 1].price;
        const newPrice = lastPrice + (Math.random() - 0.5) * 3000;
        newData.push({
          time: new Date().toLocaleTimeString([], { second: '2-digit' }),
          price: Math.round(newPrice)
        });
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort locally to prevent requiring a Firestore composite index
      tradeData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTrades(tradeData);
    });
    return () => unsubscribe();
  }, [user]);

  // Calculate floating profit with 500x leverage for excitement
  const getLiveProfit = (trade: any) => {
    if (trade.status === 'closed') return trade.profit;
    const isBuy = trade.type === 'buy';
    const diff = isBuy ? currentPrice - trade.entryPrice : trade.entryPrice - currentPrice;
    const percentage = diff / trade.entryPrice;
    let profit = Math.round(trade.amount * percentage * 500); 
    if (profit < -trade.amount) {
      profit = -trade.amount;
    }
    return profit;
  };

  const handleCloseTrade = async (trade: any, manageLoading = true) => {
    if (manageLoading) setLoading(true);
    const profitAmount = getLiveProfit(trade);
    try {
      await updateDoc(doc(db, 'trades', trade.id), {
        status: 'closed',
        exitPrice: currentPrice,
        profit: profitAmount,
        closedAt: new Date().toISOString()
      });

      // Update user balance
      const returnBalance = trade.amount + profitAmount;
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(returnBalance)
      });
    } catch (error) {
      console.error("Error closing trade", error);
    }
    if (manageLoading) setLoading(false);
  };

  const handleSellAll = async () => {
    const openTrades = trades.filter(t => t.status === 'open');
    if (openTrades.length === 0) {
      alert("Tidak ada saldo di trading untuk ditarik.");
      return;
    }
    
    setLoading(true);
    try {
      for (const trade of openTrades) {
        await handleCloseTrade(trade, false);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    const tradeAmount = Number(amount);
    if (isNaN(tradeAmount) || tradeAmount < 10000) {
      alert("Minimal trading Rp 10.000");
      return;
    }
    if (tradeAmount > userData.balance) {
      alert("Saldo tidak mencukupi");
      return;
    }

    setLoading(true);
    try {
      // Deduct balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-tradeAmount)
      });

      // Create trade
      await addDoc(collection(db, 'trades'), {
        userId: user.uid,
        type,
        amount: tradeAmount,
        entryPrice: currentPrice,
        status: 'open',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Trade error", error);
      alert("Terjadi kesalahan");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Live Trading (Spot)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-300">XAU/IDR Real-time</h3>
            <div className="text-2xl font-bold text-gold-300 gold-glow-text">
              Rp {currentPrice.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="time" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} stroke="#666" tick={{ fill: '#888', fontSize: 12 }} orientation="right" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#ca8a04' }}
                  itemStyle={{ color: '#fde047' }}
                />
                <Line type="monotone" dataKey="price" stroke="#eab308" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trading Controls */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex border-b border-gold-500/20 mb-6">
            <button 
              onClick={() => setOrderTab('buy')}
              className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${orderTab === 'buy' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Beli (Buy)
            </button>
            <button 
              onClick={() => setOrderTab('sell')}
              className={`flex-1 py-3 text-center text-sm font-bold transition-colors ${orderTab === 'sell' ? 'text-red-400 border-b-2 border-red-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Jual (Sell)
            </button>
          </div>

          <div className="mb-6 p-4 bg-dark-900 rounded-lg border border-gold-500/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">Saldo Utama (IDR)</p>
              <p className="text-lg font-bold text-white">Rp {userData?.balance?.toLocaleString('id-ID') || 0}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gold-500/10">
              <p className="text-sm text-gray-400">Aset Trading (XAU)</p>
              <p className="text-lg font-bold text-gold-300">
                Rp {trades.filter(t => t.status === 'open').reduce((sum, t) => sum + t.amount + getLiveProfit(t), 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {orderTab === 'buy' ? (
            <>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Jumlah Beli (Rp)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400"
                    placeholder="Min. 10000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setAmount((userData?.balance || 0).toString())}
                    className="py-2 text-xs bg-dark-900 border border-gold-500/30 rounded text-gray-300 hover:text-gold-300"
                  >
                    MAX
                  </button>
                  <button 
                    onClick={() => setAmount('50000')}
                    className="py-2 text-xs bg-dark-900 border border-gold-500/30 rounded text-gray-300 hover:text-gold-300"
                  >
                    50.000
                  </button>
                </div>
              </div>
              <button 
                onClick={() => handleTrade('buy')}
                disabled={loading}
                className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg font-bold hover:bg-green-500/30 transition-colors flex flex-col items-center justify-center gap-1 mt-auto"
              >
                <TrendingUp size={20} />
                BUY XAU
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4 mb-8 text-center py-4 text-gray-400 text-sm">
                <p>Tarik seluruh dana Anda dari pasar trading (Jual XAU).</p>
                <p>Harga penjualan akan menyesuaikan dengan grafik secara real-time.</p>
              </div>
              <button 
                onClick={handleSellAll}
                disabled={loading || trades.filter(t => t.status === 'open').length === 0}
                className="w-full py-4 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-bold hover:bg-red-500/30 transition-colors flex flex-col items-center justify-center gap-1 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingDown size={20} />
                SELL SEMUA XAU
              </button>
            </>
          )}
        </div>
      </div>

      {/* Trade History */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Riwayat Trading</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gold-500/20 text-gray-400 text-sm">
                <th className="pb-3 font-medium">Waktu</th>
                <th className="pb-3 font-medium">Tipe</th>
                <th className="pb-3 font-medium">Investasi</th>
                <th className="pb-3 font-medium">Entry</th>
                <th className="pb-3 font-medium">Exit</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Belum ada riwayat trading</td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gold-500/10 text-sm">
                    <td className="py-4 text-gray-300">
                      {new Date(trade.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-white">Rp {trade.amount.toLocaleString('id-ID')}</td>
                    <td className="py-4 text-gray-300">Rp {trade.entryPrice.toLocaleString('id-ID')}</td>
                    <td className="py-4 text-gray-300">
                      {trade.exitPrice ? `Rp ${trade.exitPrice.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-4">
                      {trade.status === 'open' ? (
                        <button 
                          onClick={() => handleCloseTrade(trade)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 font-bold border border-red-500/50 rounded hover:bg-red-500/40 transition-colors text-xs flex items-center gap-1"
                        >
                          Tutup (Sell)
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <CheckCircle2 size={12} /> Selesai
                        </span>
                      )}
                    </td>
                    <td className={`py-4 text-right font-bold ${getLiveProfit(trade) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {getLiveProfit(trade) > 0 ? '+' : ''}Rp {getLiveProfit(trade).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
