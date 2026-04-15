import { ArrowLeft, BookOpen, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Beranda
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600 mb-6">
          Pusat Edukasi & Layanan TradeV
        </h1>
        
        <p className="text-xl text-gray-400 mb-12">
          Kami menyediakan platform trading terstruktur yang diawasi dengan sistem cerdas. Pahami risiko dan jadilah trader yang lebih bijak bersama kami.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-gold-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Dasar Trading Untuk Pemula</h3>
            <p className="text-gray-400 leading-relaxed">
              Trading emas (XAU/USD) membutuhkan pemahaman mendalam terkait sentimen pasar global. Jangan gunakan seluruh modal Anda dalam satu transaksi. Manajemen risiko (Money Management) adalah kunci keselamatan dana Anda dari fluktuasi harga yang tajam.
            </p>
          </div>

          <div className="glass-card p-8">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
              <ShieldCheck size={24} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Informasi Lanjut (Layanan)</h3>
            <p className="text-gray-400 leading-relaxed">
              Semua deposit dan penarikan yang dilakukan di TradeV diproses secara otomatis melalui sistem bot mutasi rekening / pihak ketiga berbasis API dari lembaga perbankan. Saldo akan otomatis bertambah 1-5 menit setelah dana divalidasi.
            </p>
          </div>
        </div>

        <div className="glass-card p-8 bg-gold-500/5 border-gold-500/20">
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp size={32} className="text-gold-400" />
            <h2 className="text-3xl font-bold">Disclaimer Risiko</h2>
          </div>
          <p className="text-gray-400 leading-relaxed text-lg">
            "Perdagangan komoditas (emas/kripto) membawa tingkat risiko yang tinggi dan mungkin tidak cocok untuk semua investor. Kinerja masa lalu tidak menjamin hasil di masa depan. Selalu perdagangkan uang yang Anda rela jika hilang. Sumber data trading kami merujuk pada standar pasar global (seperti Bloomberg dan Reuters)."
          </p>
        </div>
      </div>
    </div>
  );
}
