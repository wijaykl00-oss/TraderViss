import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { QrCode, Upload, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function DepositView({ user }: { user: any }) {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNextStep = () => {
    const depositAmount = Number(amount);
    if (!nickname.trim()) {
      alert("Masukkan nickname akun Tradev Anda");
      return;
    }
    if (isNaN(depositAmount) || depositAmount < 10000) {
      alert("Minimal deposit Rp 10.000");
      return;
    }
    setStep(2);
  };

  const handleDeposit = async () => {
    if (!proofFile) {
      alert("Harap upload foto/screenshot bukti pembayaran terlebih dahulu!");
      return;
    }

    const depositAmount = Number(amount);
    setLoading(true);
    try {
      // Demo auto-approve
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        nickname: nickname,
        type: 'deposit',
        amount: depositAmount,
        status: 'approved', 
        hasProof: true,
        createdAt: new Date().toISOString()
      });

      // Update user balance
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(depositAmount),
        totalDeposited: increment(depositAmount)
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setAmount('');
        setNickname('');
        setProofFile(null);
      }, 3000);
    } catch (error) {
      console.error("Deposit error", error);
      alert("Terjadi kesalahan saat memproses deposit");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Deposit Saldo</h2>

      {step === 1 && (
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Formulir Deposit</h3>
          
          <div className="space-y-6 max-w-sm mx-auto">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nickname Akun Tradev</label>
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-dark-900 border border-gold-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-400"
                placeholder="Contoh: BudiTrade"
              />
            </div>

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
              onClick={handleNextStep}
              disabled={!nickname || !amount}
              className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 rounded-lg text-dark-900 font-bold hover:from-gold-500 hover:to-gold-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Lanjutkan ke Pembayaran
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gold-500/20 rounded-full flex items-center justify-center mb-6 border border-gold-500/30">
            <QrCode size={32} className="text-gold-400" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Pembayaran QRIS</h3>
          <p className="text-gray-400 mb-2">Silakan transfer sebesar <strong>Rp {Number(amount).toLocaleString('id-ID')}</strong></p>
          <p className="text-sm text-gray-500 mb-8">untuk Nickname: <span className="text-gold-400">{nickname}</span></p>

          <div className="w-64 h-64 mx-auto bg-white rounded-xl p-4 mb-8 flex items-center justify-center border-4 border-gold-500/30 overflow-hidden shadow-[0_0_15px_rgba(202,138,4,0.3)]">
            <img src="/qriss/qrisss.png" alt="QRIS" className="w-full h-full object-contain" />
          </div>

          <div className="text-left space-y-6 max-w-sm mx-auto">
            {/* Upload Proof */}
            <div className="p-4 bg-dark-900 rounded-xl border border-dashed border-gold-500/50 hover:border-gold-400 transition-colors">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
                <div className="bg-gold-500/20 p-3 rounded-full mb-3 text-gold-400">
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm text-white font-medium mb-1">
                  {proofFile ? proofFile.name : 'Upload Foto Bukti Transfer'}
                </span>
                <span className="text-xs text-gray-400">
                  {proofFile ? 'Klik untuk mengganti foto' : 'Format JPG/PNG'}
                </span>
              </label>
            </div>

            <button 
              onClick={handleDeposit}
              disabled={loading || !proofFile}
              className="w-full py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : success ? (
                <>
                  <CheckCircle2 size={20} />
                  Deposit Berhasil Selesai!
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Konfirmasi Selesai
                </>
              )}
            </button>

            <button 
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Kembali ke Pilih Nominal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
