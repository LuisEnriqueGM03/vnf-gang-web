import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import MapSidebar from '../components/MapSidebarComponent';
import MapInfoPopup from '../components/MapInfoPopup';
import MapWarningPopup from '../components/MapWarningPopup';
import CyberpunkContextMenu from '../components/CyberpunkContextMenu';
import CyberpunkForm from '../components/CyberpunkForm';
import { getCategoryColor, getMarkerIconSvg, getSelectedMarkerIconSvg } from '../utils/mapIcons';
import '../style/style.css';

interface Category {
  name: string;
  icon: string;
  type: string;
  enabled: boolean;
  parent?: string;
}

const MapaPage = () => {
  const [showButtons, setShowButtons] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Context Menu State
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locationsData, setLocationsData] = useState<any[]>([]); // New state for raw locations
  const [mapType, setMapType] = useState<string>('Atlas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentInfoWindow, setCurrentInfoWindow] = useState<any>(null);
  const [showMapInfoPopup, setShowMapInfoPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(true);
  const [locationPopupData, setLocationPopupData] = useState<{
    title: string;
    notes?: string;
    image?: string;
    type?: string;
    id?: string;
  }>({ title: '' });
  const [formData, setFormData] = useState({
    title: '',
    type: 'Chester',
    notes: '',
    image: ''
  });

  // Estados para zonas
  const [zoneDrawingMode, setZoneDrawingMode] = useState<'polygon' | 'circle' | null>(null);
  const [zonePoints, setZonePoints] = useState<any[]>([]);
  const [tempPolygon, setTempPolygon] = useState<any>(null);
  const [circleCenter, setCircleCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [circleRadius, setCircleRadius] = useState(500);
  const [tempCircle, setTempCircle] = useState<any>(null);
  const [zoneName, setZoneName] = useState('');
  const [zoneColor, setZoneColor] = useState('#FF0000');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [sepas, setSepas] = useState<string[]>([]);
  const [currentSepa, setCurrentSepa] = useState('');
  const zoneOverlaysRef = useRef<any[]>([]);


  // Cargar categorías, locations y zones
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catResponse, locResponse, zonesResponse] = await Promise.all([
          fetch('/data/categories.json'),
          fetch('/data/locations.json'),
          fetch('/data/zones.json')
        ]);

        const catData = await catResponse.json();
        const locData = await locResponse.json();
        const zonesData = await zonesResponse.json();

        setCategories(catData);

        // Convertir zonas en ubicaciones con tipo "Zonas"
        const zoneLocations = zonesData.map((zone: any) => ({
          id: zone.id,
          type: 'Zonas',
          title: zone.name || 'ZONA',
          notes: zone.strains?.length ? zone.strains.join(', ') : '',
          order: 99,
          lat: zone.center?.lat || zone.coordinates?.[0]?.lat || 0,
          lng: zone.center?.lng || zone.coordinates?.[0]?.lng || 0,
          image: '',
        }));

        setLocationsData([...locData, ...zoneLocations]);

        // Establecer la primera categoría como default
        if (catData.length > 0) {
          setFormData(prev => ({ ...prev, type: catData[0].name }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Expose SVG generators to window for legacy app.js
  useEffect(() => {
    (window as any).getMarkerIconSvg = getMarkerIconSvg;
    (window as any).getSelectedMarkerIconSvg = getSelectedMarkerIconSvg;
  }, []);

  useEffect(() => {
    // Variable para rastrear si el componente está montado
    let isMounted = true;

    // Cargar scripts en secuencia estricta (sin async para garantizar orden)
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        // Evitar cargar duplicados
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          console.log(`⏭️ Script ya cargado: ${src}`);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        // NO usar async para garantizar ejecución en orden
        script.onload = () => {
          if (isMounted) {
            console.log(`✅ Loaded: ${src}`);
            resolve();
          }
        };
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(script);
      });

    const initializeMap = async () => {
      try {
        // Verificar si ya se inicializó antes
        if ((window as any).mapInitialized) {
          console.log('⏭️ Mapa ya inicializado, reutilizando...');
          return;
        }

        console.log('🚀 Starting map initialization...');

        // 1. Cargar librerías legacy en orden
        await loadScript('/utils/mapa/libs/jquery-min.js');
        await loadScript('/utils/mapa/libs/underscore-min.js');
        await loadScript('/utils/mapa/libs/backbone-min.js');
        await loadScript('/utils/mapa/libs/handlebars.js');

        // 2. Cargar Google Maps y esperar a que esté listo
        await loadScript('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false');

        // Verificar que Google Maps está disponible
        if (typeof google === 'undefined') {
          throw new Error('Google Maps no se cargó correctamente');
        }
        console.log('✅ Google Maps disponible');

        // 3. Cargar app.js DESPUÉS de confirmar que todo está listo
        await loadScript('/utils/mapa/app.js');

        // Marcar como inicializado
        (window as any).mapInitialized = true;

        console.log('✅ Mapa inicializado correctamente');
      } catch (error) {
        console.error('❌ Error loading map scripts:', error);
      }
    };

    initializeMap();

    return () => {
      // Marcar componente como desmontado
      isMounted = false;
    };
  }, []);

  // Ocultar modal de error de Google Maps
  useEffect(() => {
    const hideGoogleMapsError = () => {
      // Buscar y ocultar el modal de error
      const errorModals = document.querySelectorAll('div[style*="z-index"]');
      errorModals.forEach((modal) => {
        const modalElement = modal as HTMLElement;
        const text = modalElement.textContent || '';
        if (text.includes('Google Maps') || text.includes('correctamente') || text.includes('Aceptar')) {
          modalElement.style.display = 'none';
          modalElement.style.visibility = 'hidden';
          modalElement.remove();
        }
      });
    };

    // Ejecutar inmediatamente
    hideGoogleMapsError();

    // Observar cambios en el DOM para eliminar el modal si aparece
    const observer = new MutationObserver(() => {
      hideGoogleMapsError();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Ejecutar periódicamente como respaldo
    const interval = setInterval(hideGoogleMapsError, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Detectar click derecho en el mapa usando el evento de Google Maps
  useEffect(() => {
    let listener: any = null;
    let clickListener: any = null;

    const setupMapListener = () => {
      const map = (window as any).map;
      const google = (window as any).google;

      if (!map || !google) {
        // Esperar a que el mapa se cargue
        setTimeout(setupMapListener, 500);
        return;
      }

      console.log('🗺️ Configurando listener de mapa...');

      // Agregar listener para capturar el evento del click derecho
      listener = google.maps.event.addListener(map, 'rightclick', (e: any) => {
        // Si estamos dibujando zona, ignorar click derecho o usarlo para cancelar/terminar si se desea
        if ((window as any).isDrawingZone) return;

        console.log('🖱️ Click derecho detectado!', e.latLng);

        if (!e.latLng) return;

        // Limpiar marcadores anteriores (solo permitir uno)
        const locs = (window as any).locs;
        if (locs && locs.length > 0) {
          console.log('🧹 Limpiando marcadores anteriores:', locs.length);
          locs.forEach((marker: any) => marker.setMap(null));
          locs.length = 0;
        }

        // Capturar coordenadas del click
        const coords = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        console.log('📍 Coordenadas capturadas:', coords);
        setClickCoords(coords);

        // Crear marcador temporal visual
        const marker = new google.maps.Marker({
          map: map,
          draggable: true,
          position: e.latLng,
          animation: google.maps.Animation.DROP
        });

        // Agregar al array de locs
        if (!locs) {
          (window as any).locs = [];
        }
        (window as any).locs.push(marker);
        setTempMarker(marker);

        // Mostrar Context Menu en la posición del mouse
        if (e.domEvent) {
          e.domEvent.preventDefault();
          setContextMenuPos({ x: e.domEvent.clientX, y: e.domEvent.clientY });
          setShowContextMenu(true);
        }
      });

      // Listener para clicks generales (cerrar menú)
      google.maps.event.addListener(map, 'click', (e: any) => {
        setShowContextMenu(false);

        if ((window as any).isDrawingZone && e.latLng) {
          console.log('✏️ Click izquierdo para zona', e.latLng);
          const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          const event = new CustomEvent('mapClick', { detail: newPoint });
          window.dispatchEvent(event);
        }
      });

    };

    setupMapListener();

    return () => {
      if (listener && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(listener);
      }
      if (clickListener && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(clickListener);
      }
    };
  }, []);

  // Sincronizar estado de dibujo con window para el listener
  useEffect(() => {
    (window as any).isDrawingZone = zoneDrawingMode !== null;
  }, [zoneDrawingMode]);

  // Manejar clicks del mapa para dibujar
  useEffect(() => {
    const handleMapClick = (e: any) => {
      if (!zoneDrawingMode) return;

      const map = (window as any).map;
      const google = (window as any).google;
      if (!map || !google) return;

      if (zoneDrawingMode === 'polygon') {
        const newPoint = e.detail;
        const newPoints = [...zonePoints, newPoint];
        setZonePoints(newPoints);

        if (tempPolygon) {
          tempPolygon.setPath(newPoints);
        } else {
          const polygon = new google.maps.Polygon({
            paths: newPoints,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            editable: true
          });
          setTempPolygon(polygon);
        }
      } else if (zoneDrawingMode === 'circle' && !circleCenter) {
        const center = e.detail;
        setCircleCenter(center);

        const circle = new google.maps.Circle({
          center: center,
          radius: circleRadius,
          strokeColor: '#22d3ee',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#22d3ee',
          fillOpacity: 0.25,
          map: map,
          editable: true
        });
        setTempCircle(circle);
      }
    };

    window.addEventListener('mapClick', handleMapClick);
    return () => window.removeEventListener('mapClick', handleMapClick);
  }, [zoneDrawingMode, zonePoints, tempPolygon, circleCenter, circleRadius]);

  const handleStartDrawingZone = (mode: 'polygon' | 'circle') => {
    setZoneDrawingMode(mode);
    setZonePoints([]);
    setTempPolygon(null);
    setCircleCenter(null);
    setCircleRadius(500);
    setTempCircle(null);
    setShowButtons(false);
  };

  const handleCancelDrawingZone = () => {
    setZoneDrawingMode(null);
    if (tempPolygon) tempPolygon.setMap(null);
    if (tempCircle) tempCircle.setMap(null);
    setTempPolygon(null);
    setTempCircle(null);
    setZonePoints([]);
    setCircleCenter(null);
  };

  const handleUndoLastPoint = () => {
    if (zonePoints.length > 0) {
      const newPoints = zonePoints.slice(0, -1);
      setZonePoints(newPoints);
      if (tempPolygon) tempPolygon.setPath(newPoints);
    }
  };

  const handleFinishDrawingZone = () => {
    if (zoneDrawingMode === 'polygon') {
      if (zonePoints.length < 3) {
        alert('Necesitas al menos 3 puntos para crear una zona.');
        return;
      }
    } else if (zoneDrawingMode === 'circle') {
      if (!circleCenter) {
        alert('Haz clic en el mapa para colocar el centro del círculo.');
        return;
      }
    }
    setZoneDrawingMode(null);
    setShowZoneModal(true);
  };

  const handleAddSepa = () => {
    if (currentSepa.trim()) {
      setSepas([...sepas, currentSepa.trim()]);
      setCurrentSepa('');
    }
  };

  const handleRemoveSepa = (index: number) => {
    const newSepas = sepas.filter((_, i) => i !== index);
    setSepas(newSepas);
  };

  const handleSaveZoneSubmit = async (data: any) => {
    const baseZone = {
      id: generateRandomId(),
      name: data.title,
      color: data.color || '#6413dd',
      strains: data.strains || [],
    };

    const newZone = circleCenter
      ? { ...baseZone, center: circleCenter, radius: circleRadius }
      : { ...baseZone, coordinates: zonePoints };

    const jsonString = JSON.stringify(newZone, null, 2);

    try {
      await navigator.clipboard.writeText(jsonString);
      alert('✅ JSON de Zona copiado al portapapeles!\n\nEnvíalo a Goddark83.');
    } catch (err) {
      console.error('Error al copiar:', err);
      prompt('Copia este JSON:', jsonString);
    }

    // Limpiar
    if (tempPolygon) tempPolygon.setMap(null);
    if (tempCircle) tempCircle.setMap(null);
    setTempPolygon(null);
    setTempCircle(null);
    setZonePoints([]);
    setCircleCenter(null);
    setCircleRadius(500);
    setZoneDrawingMode(null);
    setZoneName('');
    setSepas([]);
    setCurrentSepa('');
    setShowZoneModal(false);
  };

  const handleEditPointSubmit = async (data: any) => {
    const jsonString = JSON.stringify({ ...editingPoint, ...data }, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('? JSON de punto actualizado copiado al portapapeles!');
    } catch (err) {
      prompt('Copia este JSON:', jsonString);
    }
    setEditingPoint(null);
  };

  const handleEditZoneSubmit = async (data: any) => {
    if (!editingZone) return;
    const updatedZone = {
      ...editingZone,
      name: data.title,
      color: data.color || editingZone.color,
      strains: data.strains || editingZone.strains,
    };
    const jsonString = JSON.stringify(updatedZone, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      alert('? JSON de zona actualizada copiado al portapapeles!');
    } catch (err) {
      prompt('Copia este JSON:', jsonString);
    }
    setEditingZone(null);
  };

  // Renderizar zonas desde zones.json y manejar clics en ellas
  useEffect(() => {
    const renderZones = async () => {
      const map = (window as any).map;
      const google = (window as any).google;
      if (!map || !google) {
        setTimeout(renderZones, 500);
        return;
      }

      try {
        const res = await fetch('/data/zones.json');
        const zones = await res.json();
        const overlays: any[] = [];

        zones.forEach((zone: any) => {
          let overlay: any;

          if (zone.coordinates) {
            overlay = new google.maps.Polygon({
              paths: zone.coordinates,
              strokeColor: zone.color || '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: zone.color || '#FF0000',
              fillOpacity: 0.25,
              map: map,
            });
          } else if (zone.center) {
            overlay = new google.maps.Circle({
              center: zone.center,
              radius: zone.radius || 500,
              strokeColor: zone.color || '#22d3ee',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: zone.color || '#22d3ee',
              fillOpacity: 0.25,
              map: map,
            });
          }

          if (overlay) {
            overlay.addListener('click', () => {
              setLocationPopupData({
                title: zone.name || 'ZONA',
                notes: zone.strains?.length ? `STRAINS: ${zone.strains.join(', ')}` : '',
                image: '',
                type: 'Zona',
                id: zone.id,
              });
              setShowMapInfoPopup(true);
            });
            overlay.addListener('rightclick', () => {
              setEditingZone(zone);
            });
            overlays.push(overlay);
          }
        });

        zoneOverlaysRef.current.forEach((o: any) => o.setMap(null));
        zoneOverlaysRef.current = overlays;
      } catch (error) {
        console.error('Error loading zones:', error);
      }
    };

    let cancelled = false;
    renderZones().then(() => {
      if (cancelled) {
        zoneOverlaysRef.current.forEach((o: any) => o.setMap(null));
        zoneOverlaysRef.current = [];
      }
    });

    return () => {
      cancelled = true;
      zoneOverlaysRef.current.forEach((o: any) => o.setMap(null));
      zoneOverlaysRef.current = [];
    };
  }, []); // Only run once, maps and zones load async

  // Interceptar clics en marcadores para mostrar popup móvil
  useEffect(() => {
    const setupLocationClickListener = () => {
      const Vent = (window as any).Vent;

      if (!Vent) {
        console.log('⏳ Esperando Vent...');
        setTimeout(setupLocationClickListener, 500);
        return;
      }

      console.log('📍 Configurando listener para clics en ubicaciones...');

      // Interceptar el evento location:clicked de Backbone
      const handleLocationClick = (location: any) => {
        const isMobile = window.innerWidth <= 768;

        try {
          const title = location.get('title') || '';
          const notes = location.get('notes') || '';
          const image = location.get('image') || '';
          const type = location.get('type') || '';

          // Prevenir que se abra el InfoWindow de Google Maps legacy
          const mapView = (window as any).mapView;
          if (mapView && mapView.currentInfoWindow) {
            mapView.currentInfoWindow.close();
          }

          setLocationPopupData({ title, notes, image, type, id: location.get('id') });

          // Abrir popup responsive
          setShowMapInfoPopup(true);

          // Pan map to location
          const marker = location.get('marker');
          if (marker && (window as any).map) {
            (window as any).map.panTo(marker.getPosition());
          }

        } catch (error) {
          console.error('? Error al procesar location:', error);
        }
      };

      Vent.on('location:clicked', handleLocationClick);

      const handleLocationRightClick = (location: any) => {
        try {
          const title = location.get('title') || '';
          const notes = location.get('notes') || '';
          const image = location.get('image') || '';
          const type = location.get('type') || '';
          setEditingPoint({ title, notes, image, type });
        } catch (error) {
          console.error('Error al preparar edicion:', error);
        }
      };
      Vent.on('location:rightclicked', handleLocationRightClick);

      console.log('? Listener configurado exitosamente');
    };

    setupLocationClickListener();

    return () => {
      const Vent = (window as any).Vent;
      if (Vent) {
        Vent.off('location:clicked');
        console.log('🧹 Listener removido');
      }
    };
  }, []);

  const handleCreatePoint = () => {
    // Mostrar formulario y ocultar botones
    setShowButtons(false);
    setShowForm(true);
  };

  const handleMapTypeChange = (type: string) => {
    const map = (window as any).map;
    if (map) {
      map.setMapTypeId(type);
      setMapType(type);
      console.log('🗺️ Tipo de mapa cambiado a:', type);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term) {
      setSearchResults([]);
      return;
    }

    // Buscar en las ubicaciones
    const locations = (window as any).locations;
    if (locations && locations.models) {
      const results = locations.models
        .filter((model: any) => {
          const title = model.get('title') || '';
          return title.toLowerCase().includes(term.toLowerCase());
        })
        .map((model: any) => ({
          id: model.get('id') || model.cid,
          title: model.get('title'),
          type: model.get('type')
        }))
        .slice(0, 5); // Limitar a 5 resultados

      setSearchResults(results);
      console.log('🔍 Resultados encontrados:', results.length);
    }
  };

  const handleSearchResultClick = (locationId: string) => {
    console.log('🔍 Click en resultado de búsqueda:', locationId);
    const locations = (window as any).locations;
    const google = (window as any).google;
    const isMobile = window.innerWidth <= 768;

    if (locations && google) {
      let location = locations.get(locationId);

      // Si no se encuentra por id, buscar por cid
      if (!location) {
        location = locations.find((model: any) => model.cid === locationId);
      }

      if (location && (window as any).map) {
        const title = location.get('title');
        const notes = location.get('notes') || '';
        const image = location.get('image') || '';
        const type = location.get('type') || '';

        console.log(`✅ Navegando a: ${title} y abriendo popup`);

        // Hacer zoom y centrar
        const marker = location.get('marker');
        if (marker) {
          const map = (window as any).map;
          map.panTo(marker.getPosition());
          map.setZoom(5);

          // Cerrar popup anterior si existe
          if (currentInfoWindow) {
            currentInfoWindow.close();
            console.log('🔴 Popup anterior cerrado');
          }

          // Mostrar popup personalizado
          setLocationPopupData({ title, notes, image, type, id: location.get('id') });
          setShowMapInfoPopup(true);
          console.log('📍 Mostrando MapInfoPopup');
        }

        // Limpiar búsqueda después de seleccionar
        setSearchTerm('');
        setSearchResults([]);
      } else {
        console.error('❌ No se encontró la ubicación:', locationId);
      }
    }
  };

  const handleLocationSelect = (location: any) => {
    // Trigger from Sidebar

    // 1. Update Popup State directly (fastest feedback)
    setLocationPopupData({
      title: location.title,
      notes: location.notes,
      image: location.image,
      type: location.type,
      id: location.id,
    });
    setShowMapInfoPopup(true);

    // 2. Pan Map
    if (location.lat && location.lng && (window as any).map) {
      const latLng = new (window as any).google.maps.LatLng(location.lat, location.lng);
      (window as any).map.panTo(latLng);
      (window as any).map.setZoom(6);
    }

    // 3. Try to sync with legacy system (optional but good for consistency)
    const locations = (window as any).locations;
    if (locations) {
      const model = locations.get(location.id) || locations.find((l: any) => l.get('title') === location.title);
      if (model) {
        const Vent = (window as any).Vent;
        if (Vent) Vent.trigger('location:clicked', model);
      }
    }
  };

  const handleCancel = () => {
    // Eliminar el marcador temporal
    if (tempMarker) {
      tempMarker.setMap(null);
      const locs = (window as any).locs;
      if (locs) {
        const index = locs.indexOf(tempMarker);
        if (index > -1) {
          locs.splice(index, 1);
        }
      }
      setTempMarker(null);
    }

    // Cerrar botones y formulario
    setShowButtons(false);
    setShowForm(false);

    // Resetear formulario
    setFormData({
      title: '',
      type: 'Chester',
      notes: '',
      image: ''
    });
    setClickCoords(null);
  };

  // Función para generar ID aleatorio de 5 caracteres
  const generateRandomId = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const handleCreatePointSubmit = async (data: any) => {
    if (!clickCoords) return;

    // Obtener locations actuales para calcular order
    const response = await fetch('/data/locations.json');
    const locations = await response.json();

    // Calcular nuevo order
    const maxOrder = Math.max(...locations.map((l: any) => l.order || 0), 0);
    const newOrder = maxOrder + 1;

    // Generar ID aleatorio de 5 caracteres
    const randomId = generateRandomId();

    // Crear nuevo punto con ID aleatorio
    const newLocation = {
      id: randomId,
      type: data.type || "",
      title: data.title || "",
      notes: data.notes || "",
      order: newOrder,
      lat: parseFloat(clickCoords.lat.toFixed(6)),
      lng: parseFloat(clickCoords.lng.toFixed(6)),
      image: data.image || ""
    };

    // Convertir a JSON formateado
    const jsonString = JSON.stringify(newLocation, null, 2);

    // Copiar al portapapeles
    try {
      await navigator.clipboard.writeText(jsonString);

      // Mostrar mensaje de éxito
      alert('✅ JSON copiado al portapapeles!\n\nMandar a Goddark83 para que haga los cambios en la base de datos.');

      // Eliminar el marcador temporal
      if (tempMarker) {
        tempMarker.setMap(null);
        const locs = (window as any).locs;
        if (locs) {
          const index = locs.indexOf(tempMarker);
          if (index > -1) {
            locs.splice(index, 1);
          }
        }
        setTempMarker(null);
      }

      // Cerrar botones y formulario
      setShowButtons(false);
      setShowForm(false);

      setClickCoords(null);

    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback: mostrar el JSON en un prompt
      prompt('Copia este JSON:', jsonString);
    }
  };

  // Zoom Controls
  const handleZoomIn = () => {
    const map = (window as any).map;
    if (map) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    const map = (window as any).map;
    if (map) map.setZoom(map.getZoom() - 1);
  };

  // Context Menu Handlers
  const handleOpenCreatePoint = () => {
    setShowContextMenu(false);
    setShowForm(true);
    setFormData(prev => ({ ...prev, type: 'Chester', title: '', notes: '', image: '' }));
  };

  const handleOpenCreateZone = () => {
    setShowContextMenu(false);
    handleStartDrawingZone('polygon');
  };

  const handleOpenCreateCircleZone = () => {
    setShowContextMenu(false);
    handleStartDrawingZone('circle');
  };

  const handleToggleCategory = (categoryName: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.name === categoryName) {
        return { ...cat, enabled: !cat.enabled };
      }
      return cat;
    });
    setCategories(updatedCategories);

    // Trigger legacy event
    const category = updatedCategories.find(c => c.name === categoryName);
    if (category) {
      const Vent = (window as any).Vent;
      const locations = (window as any).locations;

      if (Vent && locations) {
        const models = locations.where({ type: categoryName });
        if (category.enabled) {
          Vent.trigger('locations:visible', models);
        } else {
          Vent.trigger('locations:invisible', models);
        }
      }
    }
  };

  return (
    <div className="mapa-page relative">
      {/* Navbar */}
      <Navbar />

      {/* MapSidebar - Contiene buscador, categorías, botón recargar y tipos de mapa */}
      <MapSidebar
        searchTerm={searchTerm}
        searchResults={searchResults}
        mapType={mapType}
        onSearch={handleSearch}
        onSearchResultClick={handleSearchResultClick}
        onMapTypeChange={handleMapTypeChange}
        onReload={() => window.location.reload()}
        categories={categories}
        locations={locationsData}
        onToggleCategory={handleToggleCategory}
        onLocationSelect={handleLocationSelect}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Map Info Popup - Responsive (móvil y desktop) */}
      <MapInfoPopup
        isOpen={showMapInfoPopup}
        onClose={() => {
          setShowMapInfoPopup(false);
          // Restaurar icono del marcador seleccionado
          const locs = (window as any).locations;
          if (locs) {
            locs.each((loc: any) => {
              const marker = loc.get('marker');
              if (marker) {
                const type = loc.get('type');
                const zoom = (window as any).map?.getZoom() || 4;
                const size = zoom >= 7 ? 32 : 64;
                const anchor = zoom >= 7 ? 16 : 32;
                marker.setIcon({
                  url: getMarkerIconSvg(type),
                  scaledSize: new (window as any).google.maps.Size(size, size),
                  anchor: new (window as any).google.maps.Point(anchor, anchor)
                });
              }
            });
          }
        }}
        title={locationPopupData.title}
        notes={locationPopupData.notes}
        image={locationPopupData.image}
        type={locationPopupData.type}
        id={locationPopupData.id}
      />

      {/* Warning Popup - Mensaje al entrar */}
      {showWarningPopup && (
        <MapWarningPopup
          isOpen={showWarningPopup}
          onClose={() => setShowWarningPopup(false)}
        />
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <CyberpunkContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setShowContextMenu(false)}
          onCreatePoint={handleOpenCreatePoint}
          onCreateZone={handleOpenCreateZone}
          onCreateCircleZone={handleOpenCreateCircleZone}
        />
      )}

      {/* Formulario Cyberpunk para crear nuevo punto */}
      {showForm && (
        <CyberpunkForm
          initialData={formData}
          onSubmit={handleCreatePointSubmit}
          onCancel={handleCancel}
          isZone={false}
          currentLocation={clickCoords || undefined}
        />
      )}

      {/* Formulario Cyberpunk para guardar zona */}
      {showZoneModal && (
        <CyberpunkForm
          initialData={{ title: '', type: 'Hazard', notes: '', image: '' }}
          onSubmit={handleSaveZoneSubmit}
          onCancel={() => setShowZoneModal(false)}
          isZone={true}
        />
      )}

      {/* Formulario para editar punto existente */}
      {editingPoint && (
        <CyberpunkForm
          initialData={{
            title: editingPoint.title || '',
            type: editingPoint.type || '',
            notes: editingPoint.notes || '',
            image: editingPoint.image || '',
          }}
          onSubmit={handleEditPointSubmit}
          onCancel={() => setEditingPoint(null)}
          isZone={false}
          isEditing={true}
        />
      )}

      {/* Formulario para editar zona existente */}
      {editingZone && (
        <CyberpunkForm
          initialData={{
            title: editingZone.name || '',
            type: 'Hazard',
            notes: '',
            image: '',
          }}
          onSubmit={handleEditZoneSubmit}
          onCancel={() => setEditingZone(null)}
          isZone={true}
          isEditing={true}
          initialStrains={editingZone.strains || []}
          initialColor={editingZone.color || '#6413dd'}
        />
      )}

      {/* Drawing Controls (Cyberpunk Style) */}
      {zoneDrawingMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9000] flex gap-2">
          {zoneDrawingMode === 'polygon' && (
            <>
              <div className="px-4 py-2 bg-black/80 border border-[#a855f7] text-[#a855f7] font-['Share_Tech_Mono'] flex items-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                POLÍGONO · PUNTOS: {zonePoints.length}
              </div>
              <button
                onClick={handleUndoLastPoint}
                className="px-4 py-2 bg-black/80 border border-yellow-500 text-yellow-500 font-['Orbitron'] hover:bg-yellow-500/20 transition-all uppercase text-sm"
              >
                DESHACER
              </button>
            </>
          )}
          {zoneDrawingMode === 'circle' && (
            <>
              <div className="px-4 py-2 bg-black/80 border border-[#22d3ee] text-[#22d3ee] font-['Share_Tech_Mono'] flex items-center shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                CÍRCULO {circleCenter ? `· RADIO: ${circleRadius}m` : '· SELECCIONA CENTRO'}
              </div>
              {circleCenter && (
                <div className="flex items-center gap-1 px-2 bg-black/80 border border-[#22d3ee]">
                  <span className="text-[10px] text-[#22d3ee] font-['Share_Tech_Mono']">RADIO</span>
                  <input
                    type="range"
                    min={100}
                    max={100000}
                    step={100}
                    value={circleRadius}
                    onChange={(e) => {
                      const r = Number(e.target.value);
                      setCircleRadius(r);
                      if (tempCircle) tempCircle.setRadius(r);
                    }}
                    className="w-24 h-1 accent-[#22d3ee]"
                  />
                  <span className="text-xs text-white font-['Share_Tech_Mono'] w-12 text-right">{circleRadius}m</span>
                </div>
              )}
            </>
          )}
          <button
            onClick={handleFinishDrawingZone}
            className="px-4 py-2 bg-black/80 border border-[#FFD700] text-[#FFD700] font-['Orbitron'] hover:bg-[#FFD700]/20 transition-all uppercase text-sm shadow-[0_0_10px_rgba(255,215,0,0.2)]"
          >
            TERMINAR
          </button>
          <button
            onClick={handleCancelDrawingZone}
            className="px-4 py-2 bg-black/80 border border-red-500 text-red-500 font-['Orbitron'] hover:bg-red-500/20 transition-all uppercase text-sm"
          >
            CANCELAR
          </button>
        </div>
      )}

      <div id="map" className="w-full h-screen" style={{ background: '#2596be' }}></div>
      <div id="tour-info"></div>

      {/* Handlebars Templates - Required for legacy app.js */}
      <script type="text/x-handlebars-template" id="categoriesTemplate">
        {`{{#each categories}}
			<section class="type">
				<h3>Ubicaciones</h3>
				<ul>
					{{#each types}}
						<li>
							<label>
								<input type="checkbox" {{#if enabled}}checked{{/if}} value="{{name}}"> 
								<img src="{{icon}}" style="width: 40px; height: 40px;"> 
								{{name}}
							</label> 
							<a href="#" class="details" data-name="{{name}}">▶</a>
						</li>
					{{/each}}
				</ul>
			</section>
		{{/each}}`}
      </script>

      <script type="text/x-handlebars-template" id="categoryDetailsTemplate">
        {`<section class="type">
			<h3>
				<a href="#" class="back details">◀</a> 
				{{type.name}}
			</h3>
			<ul>
				{{#each locations}}
					<li data-id="{{#if id}}{{id}}{{else}}{{cid}}{{/if}}" style="cursor: pointer;">
						<label style="cursor: pointer;">{{title}}</label>
					</li>
				{{/each}}
			</ul>
		</section>`}
      </script>

      <script type="text/x-handlebars-template" id="markerPopupTemplate2">
        {`<div id="info-window" class="modern-popup">
			<div class="popup-container">
				<!-- Header con gradiente -->
				<div class="popup-header">
					<h3 class="popup-title">{{title}}</h3>
				</div>
                
                <!-- Imagen principal -->
				{{#if image}}
					<div class="popup-image-container">
						<img src="{{image}}" class="popup-main-image" alt="{{title}}">
						<div class="image-overlay"></div>
					</div>
				{{/if}}

				<!-- Contenido -->
				<div class="popup-content">
					{{#if notes}}
					<div class="popup-description">
						<p class="description-text">{{notes}}</p>
					</div>
				{{/if}}
				</div>
			</div>
		</div>`}
      </script>

      <div id="typeDetails" className="types"></div>
      <div id="types" className="types"></div>
    </div>
  );
};

export default MapaPage;
