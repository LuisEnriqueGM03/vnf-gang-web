import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { URLS } from '../navigation/CONSTANTS';
import '../style/style.css';

const TiendasPage = () => {
  const navigate = useNavigate();

  const tiendas = [
    {
      id: 1,
      nombre: 'Pawn Shop',
      descripcion: 'Tienda de artículos legales: ropa, accesorios, tatuajes y más',
      color: 'linear-gradient(135deg, #2A9D8F, #3BB9AB)',
      colorSolido: '#2A9D8F',
      ruta: URLS.PAWN_SHOP,
      icono: 'storefront',
      iconoSecundario: 'shopping_bag'
    },
    {
      id: 2,
      nombre: 'Mercachifle',
      descripcion: 'Punto para vender objetos ilegales y materiales del mercado negro',
      color: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
      colorSolido: '#1a1a1a',
      ruta: URLS.MERCACHIFLE,
      icono: 'paid',
      iconoSecundario: 'local_shipping'
    }
  ];

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, #000000, #3d3d0a, #000000, #5c5c1a)' }}>
      <Navbar />
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ backgroundColor: '#2A9D8F' }}></div>
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ backgroundColor: '#1a1a1a' }}></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" style={{ backgroundColor: '#3BB9AB' }}></div>
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-4 py-8 pt-28">
        {/* Título */}
        <div className="text-center mb-16">
          <div className="backdrop-blur-xl inline-block px-10 py-6 rounded-3xl shadow-2xl border-2" style={{ background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(50, 50, 10, 0.9))', borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255,215,0,0.5)' }}>
            <div className="flex items-center gap-4 justify-center mb-2">
              <span className="material-symbols-outlined text-5xl text-white" style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' }}>
                store
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Tiendas</h1>
            </div>
            <p className="text-white/90 text-lg mt-1">Compra y vende artículos</p>
          </div>
        </div>

        {/* Grid de Tiendas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {tiendas.map((tienda) => (
            <div
              key={tienda.id}
              className="group backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_80px_rgba(0,0,0,0.4)] cursor-pointer relative"
              onClick={() => navigate(tienda.ruta)}
            >
              {/* Borde animado superior */}
              <div 
                className="h-1.5 w-full transition-all duration-500 group-hover:h-2"
                style={{ background: tienda.color }}
              />
              
              {/* Contenido de la tarjeta */}
              <div className="p-8 relative">
                {/* Icono de fondo decorativo */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-all duration-500">
                  <span className="material-symbols-outlined text-9xl" style={{ 
                    fontVariationSettings: '"FILL" 1, "wght" 300, "GRAD" 0, "opsz" 48',
                    color: tienda.colorSolido
                  }}>
                    {tienda.icono}
                  </span>
                </div>

                {/* Header con icono principal */}
                <div className="flex items-start gap-5 mb-6 relative z-10">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: tienda.color }}
                  >
                    <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 48' }}>
                      {tienda.icono}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-white/90 transition-colors duration-300">
                      {tienda.nombre}
                    </h3>
                    <div className="h-1 w-16 rounded-full transition-all duration-500 group-hover:w-24" style={{ background: tienda.color }}></div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-white/80 text-lg mb-6 leading-relaxed relative z-10">
                  {tienda.descripcion}
                </p>

                {/* Separador decorativo */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="material-symbols-outlined text-white/40 text-xl" style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24' }}>
                    {tienda.iconoSecundario}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Botón de entrada */}
                <button
                  className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition-all duration-500 transform group-hover:shadow-2xl relative overflow-hidden flex items-center justify-center gap-3"
                  style={{ background: tienda.color }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Entrar</span>
                    <span className="material-symbols-outlined text-2xl transform transition-transform duration-300 group-hover:translate-x-2" style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}>
                      arrow_forward
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-500"></div>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TiendasPage;
