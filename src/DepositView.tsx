import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { QrCode, Upload, CheckCircle2 } from 'lucide-react';

export default function DepositView({ user }: { user: any }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async () => {
    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount < 10000) {
      alert("Minimal deposit Rp 10.000");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would create a pending transaction and wait for admin approval.
      // For this demo, we'll auto-approve it after a short delay to simulate the flow.
      
      const txRef = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'deposit',
        amount: depositAmount,
        status: 'approved', // Auto-approve for demo
        createdAt: new Date().toISOString()
      });

      // Update user balance and total deposited
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(depositAmount),
        totalDeposited: increment(depositAmount)
      });

      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Deposit error", error);
      alert("Terjadi kesalahan saat memproses deposit");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Deposit Saldo</h2>

      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-gold-500/20 rounded-full flex items-center justify-center mb-6 border border-gold-500/30">
          <QrCode size={32} className="text-gold-400" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Scan QRIS</h3>
        <p className="text-gray-400 mb-8">Silakan scan QR code di bawah ini menggunakan aplikasi e-wallet atau m-banking Anda.</p>

        {/* QRIS Image */}
        <div className="w-64 h-64 mx-auto bg-white rounded-xl p-4 mb-8 flex items-center justify-center border-4 border-gold-500/30 overflow-hidden">
          <img src="/qriss/qrisss.png" alt="QRIS" className="w-full h-full object-contain" />
        </div>

        <div className="text-left space-y-4 max-w-sm mx-auto">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jumlah Deposit (Rp)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400"
              placeholder="Min. 10000"
            />
          </div>

          <button 
            onClick={handleDeposit}
            disabled={loading || !amount}
            className="w-full py-3 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-dark-900 font-bold hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
            ) : success ? (
              <>
                <CheckCircle2 size={20} />
                Deposit Berhasil
              </>
            ) : (
              <>
                <Upload size={20} />
                Konfirmasi Pembayaran
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
