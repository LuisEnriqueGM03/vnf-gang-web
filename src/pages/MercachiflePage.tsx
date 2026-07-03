import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../style/style.css';

interface Item {
  id: string;
  name: string;
  descripcion: string;
  precio: number;
  max: number;
  image: string;
  tipo: string;
  categoria?: string;
  comercio?: string;
  ilegal?: boolean;
}

const MercachiflePage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedComercio, setSelectedComercio] = useState<string>('Venta');

  const categories = ['Todos', 'Peluqueria', 'Tatuajeria', 'Tienda', 'Digital', 'Basura', 'Tienda Ropa'];

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch('/data/items.json');
        const data = await response.json();
        // Filtrar solo items ilegales
        const illegalItems = data.filter((item: Item) => item.ilegal === true);
        setItems(illegalItems);
        setLoading(false);
      } catch (error) {
        console.error('Error loading items:', error);
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(to bottom right, rgb(10, 10, 10), rgb(30, 30, 30), rgb(10, 10, 10))' }}>
      {/* Navbar */}
      <Navbar />

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" style={{ backgroundColor: '#1A1A1A' }}></div>
        <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#2A2A2A' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" style={{ backgroundColor: '#0A0A0A' }}></div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-24 sm:pt-32">
        {/* Título */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="backdrop-blur-xl inline-block px-6 sm:px-12 py-4 sm:py-6 rounded-2xl shadow-2xl border border-white/10" style={{ background: 'linear-gradient(to right, rgba(20, 20, 20, 0.95), rgba(40, 40, 40, 0.95))' }}>
            <div className="flex items-center gap-3 sm:gap-4 justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">
                Mercachifle
              </h1>
            </div>
          </div>
        </div>

        {/* Botones Venta/Compra */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => {
                setSelectedComercio('Venta');
                setSelectedCategory('Todos');
              }}
              className={`backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.02] ${
                selectedComercio === 'Venta'
                  ? 'bg-white/20'
                  : 'bg-white/10'
              }`}
              style={{ 
                boxShadow: selectedComercio === 'Venta' 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.3)' 
              }}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg sm:text-2xl font-bold text-white">Venta</span>
              </div>
            </button>
            
            <button
              onClick={() => {
                setSelectedComercio('Compra');
                setSelectedCategory('Todos');
              }}
              className={`backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6 transition-all duration-300 transform hover:scale-[1.02] ${
                selectedComercio === 'Compra'
                  ? 'bg-white/20'
                  : 'bg-white/10'
              }`}
              style={{ 
                boxShadow: selectedComercio === 'Compra' 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.3)' 
              }}
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-lg sm:text-2xl font-bold text-white">Compra</span>
              </div>
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 sm:pl-14 pr-12 sm:pr-4 py-3 sm:py-4 rounded-xl text-white text-sm sm:text-base placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
                  fontSize: '16px'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros por Categoría */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/10 overflow-hidden" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-base sm:text-xl font-semibold text-white">Filtrar por Tipo</h3>
            </div>
            <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-4 sm:pb-6 px-4 pr-8 sm:px-6 scrollbar-hide sm:flex-wrap" style={{ WebkitOverflowScrolling: 'touch' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                    selectedCategory === category
                      ? 'text-white shadow-xl'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{
                    background: selectedCategory === category
                      ? 'linear-gradient(to right, #1A1A1A, #2A2A2A)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: selectedCategory === category
                      ? '0 10px 30px -10px rgba(0, 0, 0, 0.6)'
                      : 'none'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" style={{ borderColor: '#2A2A2A' }}></div>
            <p className="text-white mt-4 text-lg">Cargando items...</p>
          </div>
        )}

        {/* Lista de Items */}
        {!loading && (
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {items
              .filter((item) => {
                const search = searchTerm.toLowerCase();
                const matchesSearch = (
                  item.name.toLowerCase().includes(search) ||
                  item.descripcion.toLowerCase().includes(search) ||
                  item.tipo.toLowerCase().includes(search)
                );
                const matchesCategory = selectedCategory === 'Todos' || item.tipo === selectedCategory;
                const matchesComercio = item.comercio === selectedComercio;
                return matchesSearch && matchesCategory && matchesComercio;
              })
              .map((item) => (
              <div
                key={item.id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Imagen */}
                  <div className="md:w-1/3 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-6 sm:p-8">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 sm:h-64 object-contain rounded-lg drop-shadow-2xl"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 sm:h-64 flex items-center justify-center">
                        <svg className="w-24 h-24 sm:w-32 sm:h-32 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Datos */}
                  <div className="md:w-2/3 w-full p-5 sm:p-8 flex flex-col justify-center">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Nombre del Item */}
                      <div>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                          {item.name}
                        </h2>
                        <div className="h-1 w-16 sm:w-24 rounded-full" style={{ background: 'linear-gradient(to right, #1A1A1A, #3A3A3A)' }}></div>
                      </div>

                      {/* Descripción */}
                      <div>
                        <p className="text-base sm:text-xl text-white leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>

                      {/* Información en Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4">
                        {/* Precio */}
                        <div className="backdrop-blur-md bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">{selectedComercio === 'Venta' ? 'Venta' : 'Compra'}</span>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-white">${item.precio.toLocaleString()}</p>
                        </div>

                        {/* Cantidad Máxima */}
                        <div className="backdrop-blur-md bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">Max</span>
                          </div>
                          <p className="text-xl sm:text-3xl font-bold text-white">{item.max === 0 ? '∞' : item.max}</p>
                          <p className="text-xs sm:text-sm font-semibold text-white/70">Por Reinicio</p>
                        </div>

                        {/* Tipo */}
                        <div className="backdrop-blur-md bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 col-span-2 md:col-span-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">{selectedComercio === 'Compra' ? 'Tipo' : 'Tipo Robo'}</span>
                          </div>
                          <p className="text-lg sm:text-2xl font-bold text-white">{item.tipo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* No Results Message */}
            {items.filter((item) => {
              const search = searchTerm.toLowerCase();
              const matchesSearch = (
                item.name.toLowerCase().includes(search) ||
                item.descripcion.toLowerCase().includes(search) ||
                item.tipo.toLowerCase().includes(search)
              );
              const matchesCategory = selectedCategory === 'Todos' || item.tipo === selectedCategory;
              const matchesComercio = item.comercio === selectedComercio;
              return matchesSearch && matchesCategory && matchesComercio;
            }).length === 0 && (searchTerm || selectedCategory !== 'Todos') && (
              <div className="text-center py-20">
                <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-12 inline-block">
                  <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-2xl text-white/80 font-semibold mb-2">No se encontraron resultados</p>
                  <p className="text-lg text-white/60">Intenta con otros términos de búsqueda</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-2xl text-gray-400">No hay items disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MercachiflePage;
