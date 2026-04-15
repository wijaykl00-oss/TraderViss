import { ArrowLeft, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TestimonialPage() {
  const testimonials = [
    {
      name: "Budi Santoso",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      job: "Pegawai Swasta",
      message: "Awalnya iseng nyoba 200 ribu, ternyata sistem tradingnya gampang dimengerti. Saldo saya sekarang udah tembus 3 juta dalam sebulan, mantap TradeV!",
      profit: "+ Rp 2.800.000",
      time: "2 hari yang lalu"
    },
    {
      name: "Siti Rahmawati",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      job: "Ibu Rumah Tangga",
      message: "Seneng banget bisa wd (withdraw) cepet hitungan menit langsung masuk rekening. Ngebantu banget buat nambah uang belanja bulanan dari meja makan aja.",
      profit: "+ Rp 1.500.000",
      time: "5 hari yang lalu"
    },
    {
      name: "Agus Pratama",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
      job: "Mahasiswa",
      message: "Gokil parah UI nya enak banget dipandang. Pas profit langsung kelihatan grafiknya. WD pertama buat bayar uang semesteran aman sentosa bosku!",
      profit: "+ Rp 4.250.000",
      time: "1 minggu yang lalu"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600 mb-4">
            Testimoni Member TradeV
          </h1>
          <p className="text-gray-400 text-lg">
            Ratusan trader Indonesia telah mempercayakan perjalanannya bersama kami.
          </p>
        </div>

        <div className="space-y-6">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-gold-500/40 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MessageSquare size={64} className="text-gold-500" />
              </div>
              
              <div className="shrink-0 flex items-center gap-4 md:flex-col md:items-center">
                <img src={testi.avatar} alt={testi.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold-500/50 object-cover" />
                <div className="md:text-center">
                  <h3 className="font-bold text-lg">{testi.name}</h3>
                  <p className="text-xs text-gray-500">{testi.job}</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex text-gold-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testi.message}"
                </p>
                <div className="flex justify-between items-center mt-auto border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm font-bold">
                    <TrendingUp size={14} />
                    {testi.profit}
                  </div>
                  <span className="text-xs text-gray-600">{testi.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
