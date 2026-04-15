import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { ArrowDownToLine, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function WithdrawView({ user, userData }: { user: any, userData: any }) {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isEligible = (userData?.totalDeposited || 0) >= 30000;

  const handleWithdraw = async () => {
    const withdrawAmount = Number(amount);
    if (!isEligible) {
      alert("Anda harus melakukan deposit minimal Rp 30.000 untuk dapat melakukan penarikan.");
      return;
    }
    if (isNaN(withdrawAmount) || withdrawAmount < 50000) {
      alert("Minimal penarikan Rp 50.000");
      return;
    }
    if (withdrawAmount > userData.balance) {
      alert("Saldo tidak mencukupi");
      return;
    }
    if (!bank || !accountNumber) {
      alert("Mohon lengkapi data bank");
      return;
    }

    setLoading(true);
    try {
      // Create pending withdrawal
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'withdraw',
        amount: withdrawAmount,
        bank,
        accountNumber,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Deduct balance immediately
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-withdrawAmount)
      });

      setSuccess(true);
      setAmount('');
      setBank('');
      setAccountNumber('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Withdraw error", error);
      alert("Terjadi kesalahan saat memproses penarikan");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Penarikan Saldo</h2>

      {!isEligible && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-400 font-medium mb-1">Syarat Penarikan Belum Terpenuhi</h4>
            <p className="text-sm text-red-400/80">
              Anda harus melakukan deposit minimal Rp 30.000 untuk mengaktifkan fitur penarikan. 
              Total deposit Anda saat ini: Rp {(userData?.totalDeposited || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gold-500/10">
          <div>
            <p className="text-sm text-gray-400 mb-1">Saldo Tersedia</p>
            <p className="text-3xl font-bold text-white">Rp {userData?.balance?.toLocaleString('id-ID') || 0}</p>
          </div>
          <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center border border-gold-500/30">
            <ArrowDownToLine size={24} className="text-gold-400" />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jumlah Penarikan (Rp)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isEligible}
              className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400 disabled:opacity-50"
              placeholder="Min. 50000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Pilih Bank / E-Wallet</label>
            <select 
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              disabled={!isEligible}
              className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400 disabled:opacity-50"
            >
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="Mandiri">Mandiri</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="DANA">DANA</option>
              <option value="OVO">OVO</option>
              <option value="GoPay">GoPay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Nomor Rekening / HP</label>
            <input 
              type="text" 
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              disabled={!isEligible}
              className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400 disabled:opacity-50"
              placeholder="Masukkan nomor rekening"
            />
          </div>

          <button 
            onClick={handleWithdraw}
            disabled={loading || !isEligible || !amount || !bank || !accountNumber}
            className="w-full py-4 mt-4 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-dark-900 font-bold text-lg hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
            ) : success ? (
              <>
                <CheckCircle2 size={24} />
                Permintaan Terkirim
              </>
            ) : (
              'Tarik Saldo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
