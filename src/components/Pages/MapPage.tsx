import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { useDocumentActions } from '../../hooks/useDocumentActions';
import satsData from '../../data/customerSatellites.json';
import { projectsApi } from '../../api';

type Item = {
  id: string;
  name?: string;
  coordinates: { lat: number; lng: number };
  country?: string;
  acva?: string;
  agencyName?: string;
  contact?: { email: string; phone: string };
};

export default function MapPage() {
  const [projects, setProjects] = useState<Item[]>([]);
  const [acvas, setAcvas] = useState<Item[]>([]);
  const [satellites, setSatellites] = useState<any[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const { handleViewDocument } = useDocumentActions();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // Load projects via centralized projectsApi
      try {
        const loadedProjects = await projectsApi.getProjects();
        const mappedProjects = loadedProjects.map(p => {
          let coords = { lat: 20.5937, lng: 78.9629 }; // Default India center
          if (p.metadata?.coordinates?.lat && p.metadata?.coordinates?.lng) {
            coords = { lat: Number(p.metadata.coordinates.lat), lng: Number(p.metadata.coordinates.lng) };
          } else if (typeof p.coordinates === 'object' && p.coordinates?.lat && p.coordinates?.lng) {
            coords = { lat: Number(p.coordinates.lat), lng: Number(p.coordinates.lng) };
          } else if (typeof p.coordinates === 'string') {
            const parts = p.coordinates.split(',');
            if (parts.length === 2) {
              coords = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
            }
          } else if (p.latitude && p.longitude) {
            coords = { lat: Number(p.latitude), lng: Number(p.longitude) };
          }
          return {
            id: p.id,
            name: p.name || p.metadata?.ownership || p.id,
            coordinates: coords,
            country: p.country || p.state_name || 'India'
          };
        });
        setProjects(mappedProjects);
        if (mappedProjects.length > 0) {
          setSelected(mappedProjects[0]);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
      }

      // No ACVAs from Supabase yet - set empty
      setAcvas([]);

      // Satellites from local data
      const list = satsData.customer_satellites || [];
      const countryLookup: Record<string, { lat: number; lng: number }> = {
        'India': { lat: 20.5937, lng: 78.9629 }
      };

      const withCoords = list.map((s: any) => {
        const coords = countryLookup[s.country] || { lat: 0, lng: 0 };
        return { ...s, coordinates: coords };
      });
      setSatellites(withCoords);
    };
    load();
    // initialize leaflet map once data loads
    let mounted = true;
    (async () => {
      try {
        await loadLeaflet();
        if (!mounted) return;
        const L = (window as any).L;
        if (!mapRef.current) {
          mapRef.current = L.map('nee-map', { center: [20.5937, 78.9629], zoom: 5, maxBounds: L.latLngBounds([[8.4, 68.7], [37.6, 97.25]]) });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapRef.current);
          // create cluster group (load markercluster assets first)
          try {
            await loadMarkerCluster();
            const mc = (window as any).L.markerClusterGroup;
            if (mc) {
              clusterRef.current = mc();
              mapRef.current.addLayer(clusterRef.current);
            }
          } catch (err) {
            // markercluster may not be available; ignore
          }
        }
      } catch (e) {
        console.warn('Leaflet failed to load', e);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // update markers when datasets change
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;
    // clear old markers
    try {
      if (clusterRef.current) {
        clusterRef.current.clearLayers();
      }
    } catch (e) {
      // ignore
    }
    markersRef.current.forEach((m: any) => m.remove());
    markersRef.current = [];

    const createDivIcon = (color: string, label?: string) => {
      return L.divIcon({
        html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;box-shadow:0 0 0 2px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:600">${label || ''}</div>`,
        className: '',
        iconSize: [18, 18]
      });
    };

    const addMarkerToMap = (lat: number, lng: number, title: string, content: string, icon: any) => {
      const marker = L.marker([lat, lng], { icon }).bindPopup(`<strong>${title}</strong><br/>${content}`);
      markersRef.current.push(marker);
      if (clusterRef.current && typeof clusterRef.current.addLayer === 'function') {
        clusterRef.current.addLayer(marker);
      } else {
        marker.addTo(mapRef.current);
      }
      return marker;
    };

    const projIcon = createDivIcon('#0ea5a4', 'P');
    const acvaIcon = createDivIcon('#7c3aed', 'A');
    const satIcon = createDivIcon('#ef4444', 'S');

    projects.forEach((p) => addMarkerToMap(p.coordinates.lat, p.coordinates.lng, p.name || p.id, p.country || '', projIcon));
    acvas.forEach((a) => addMarkerToMap(a.coordinates.lat, a.coordinates.lng, a.agencyName || a.id, a.country || '', acvaIcon));
    satellites.forEach((s) => {
      if (s.coordinates && s.coordinates.lat !== 0) {
        addMarkerToMap(s.coordinates.lat, s.coordinates.lng, s.id, s.country || '', satIcon);
      }
    });

    if (selected && selected.coordinates) {
      mapRef.current.setView([selected.coordinates.lat, selected.coordinates.lng], 6);
    } else if (mapCenter) {
      mapRef.current.setView([mapCenter.lat, mapCenter.lng], 6);
    }
  }, [projects, acvas, satellites, selected, mapCenter]);

  return (
    <div className="p-6 min-h-screen readable-surface">
      <div className="mb-6 flex items-center gap-4">
        <div className="hidden sm:block">
          <Suspense fallback={null}>
            <LazyThreeHero />
          </Suspense>
        </div>
        <div>
          <h1 className="text-gradient-heading text-2xl font-extrabold hero-readable-text">Map — Projects & ACVAs</h1>
          <p className="text-gray-700 dark:text-gray-300">Select a project or ACVA to center the map and view details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Projects</h3>
            {projects.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className={`w-full text-left p-2 rounded hover:bg-nee-50 dark:hover:bg-gray-700 ${selected?.id === p.id ? 'bg-nee-50 dark:bg-gray-700 border border-nee-200 dark:border-gray-600' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-nee-800 dark:text-gray-100">{p.name || p.id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{p.country}</div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{p.coordinates.lat.toFixed(2)}, {p.coordinates.lng.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">ACVAs</h3>
            {acvas.map((a) => (
              <button key={a.id} onClick={() => setSelected(a)} className={`w-full text-left p-2 rounded hover:bg-nee-50 dark:hover:bg-gray-700 ${selected?.id === a.id ? 'bg-nee-50 dark:bg-gray-700 border border-nee-200 dark:border-gray-600' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-nee-800 dark:text-gray-100">{a.agencyName || a.id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{a.country}</div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{a.coordinates.lat.toFixed(2)}, {a.coordinates.lng.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Satellites</h3>
            {satellites.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded hover:bg-nee-50 dark:hover:bg-gray-700">
                <div>
                      <div className="text-sm font-medium text-nee-800 dark:text-gray-100">{s.id}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{s.country}</div>
                </div>
                <div className="flex items-center gap-2">
                      <button onClick={() => handleViewDocument(`Satellite: ${s.id}`, `ID: ${s.id}\nCountry: ${s.country}\nLaunch Date: ${s.launch_date}\nMass: ${s.mass}\nLauncher: ${s.launcher}`)} className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 text-sm">Details</button>
                      <button onClick={() => { setMapCenter(s.coordinates); setSelected({ id: s.id, name: s.id, coordinates: s.coordinates }); }} className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 text-sm">View on Map</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-4 h-[70vh] backdrop-blur-sm">
            <div id="nee-map" className="w-full h-full rounded" style={{ minHeight: '420px' }} />
          </div>
        </div>
      </div>

    </div>
  );
}

// Leaflet loader & map initialization
function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).L) return resolve();
    // CSS
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    // Script
    const sId = 'leaflet-js';
    if (document.getElementById(sId)) return resolve();
    const script = document.createElement('script');
    script.id = sId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load leaflet'));
    document.body.appendChild(script);
  });
}

// Lazy load small three hero to keep main bundle light
const LazyThreeHero = lazy(() => import('@/components/ui-bits/ThreeHero'));

// Load markercluster assets (optional) - returns a promise that resolves when loaded or immediately if already present
function loadMarkerCluster(): Promise<void> {
  return new Promise((resolve) => {
    const cssId = 'leaflet-markercluster-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
      document.head.appendChild(link);
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css';
      document.head.appendChild(link2);
    }
    const sId = 'leaflet-markercluster-js';
    if ((window as any).L && (window as any).L.markerClusterGroup) return resolve();
    if (document.getElementById(sId)) return resolve();
    const script = document.createElement('script');
    script.id = sId;
    script.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}
