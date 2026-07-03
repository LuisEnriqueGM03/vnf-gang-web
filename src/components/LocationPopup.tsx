import { useEffect } from 'react';

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  notes?: string;
  image?: string;
  type?: string;
}

const LocationPopup = ({ isOpen, onClose, title, notes, image, type }: LocationPopupProps) => {
  // Prevenir scroll del body cuando el popup está abierto
  useEffect(() => {
    console.log('🎨 LocationPopup - isOpen changed:', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      console.log('🔒 Body scroll bloqueado');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  console.log('🎨 LocationPopup render:', { isOpen, title, notes, image, type });

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fadeIn md:hidden"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="fixed inset-x-4 bottom-8 z-[10000] md:hidden animate-slideUp max-h-[75vh] flex items-end">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-h-[75vh] overflow-y-auto scrollbar-popup"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Header */}
          <div
            className="relative p-5 overflow-hidden"
            style={{
              background: 'linear-gradient(to right, rgba(10, 35, 40, 0.95), rgba(29, 126, 115, 0.95), rgba(10, 35, 40, 0.95))'
            }}
          >
            {/* Decoración de fondo animada */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
            </div>

            {/* Contenido del header */}
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {type && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                      {type}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg leading-tight">
                  {title}
                </h2>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 flex-shrink-0"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Imagen */}
          {image && (
            <div className="relative overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          {/* Contenido */}
          <div className="p-5 space-y-3">
            {notes && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1.5">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                      {notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!notes && !image && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No hay información adicional disponible</p>
              </div>
            )}
          </div>

          {/* Footer con botón */}
          <div className="p-5 pt-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-98"
              style={{
                background: 'linear-gradient(to right, rgba(10, 35, 40, 0.95), rgba(29, 126, 115, 0.95), rgba(10, 35, 40, 0.95))',
                boxShadow: '0 10px 30px rgba(29, 126, 115, 0.3)'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationPopup;
