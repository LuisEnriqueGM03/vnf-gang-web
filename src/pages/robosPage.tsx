import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

interface Robo {
  id: string;
  title: string;
  descripcion: string;
  image: string;
}

const RobosPage = () => {
  const [robos, setRobos] = useState<Robo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRobos = async () => {
      try {
        const response = await fetch('/data/robos.json');
        const data = await response.json();
        setRobos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading robos:', error);
        setLoading(false);
      }
    };

    loadRobos();
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, rgb(10, 35, 40), rgb(29, 126, 115), rgb(10, 35, 40))' }}>
      {/* Navbar */}
      <Navbar />

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ backgroundColor: '#3BB9AB' }}></div>
        <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#5FEDD8' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" style={{ backgroundColor: '#2A9D8F' }}></div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-32">
        {/* Título */}
        <div className="text-center mb-12">
          <div className="backdrop-blur-xl inline-block px-12 py-6 rounded-2xl shadow-2xl border-2" style={{ background: 'linear-gradient(to right, rgba(0, 0, 0, 0.95), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <div className="flex items-center gap-4 justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h1 className="text-4xl font-bold text-white">
                Tipos de Robos
              </h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: '#3BB9AB' }}></div>
            <p className="text-white mt-4 text-lg">Cargando robos...</p>
          </div>
        )}

        {/* Grid de Robos */}
        {!loading && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {robos.map((robo) => (
              <div
                key={robo.id}
                className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform hover:scale-105 transition-all duration-300"
                style={{ boxShadow: '0 25px 50px -12px rgba(59, 185, 171, 0.3)' }}
              >
                <div className="p-8">
                  {/* Título */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {robo.title}
                    </h2>
                    <div className="h-1 w-24 rounded-full" style={{ background: 'linear-gradient(to right, #FFD700, #B8860B)', boxShadow: '0 0 10px rgba(255,215,0,0.8)' }}></div>
                  </div>

                  {/* Descripción */}
                  <p className="text-lg text-white/90 leading-relaxed mb-6">
                    {robo.descripcion}
                  </p>

                  {/* Icon */}
                  <div className="flex justify-center mt-8">
                    <div className="backdrop-blur-md bg-white/5 rounded-2xl p-8 border border-white/10">
                      <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && robos.length === 0 && (
          <div className="text-center py-20">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-12 inline-block">
              <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-2xl text-white/80 font-semibold">No hay robos disponibles</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobosPage;
