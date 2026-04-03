import { useEffect, useRef } from 'react';

interface ProjectMapProps {
  coordinates?: string; // "lat,lng" format
  location?: string;
}

export default function ProjectMap({ coordinates, location }: ProjectMapProps) {
  const mapContainerId = useRef(`project-map-${Math.random().toString(36).substr(2, 9)}`);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      // Parse coordinates
      let lat = 20.5937; // Default to India center
      let lng = 78.9629;
      
      if (coordinates) {
        const parts = coordinates.split(',');
        if (parts.length === 2) {
          const parsedLat = parseFloat(parts[0].trim());
          const parsedLng = parseFloat(parts[1].trim());
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            lat = parsedLat;
            lng = parsedLng;
          }
        }
      }

      try {
        await loadLeaflet();
        if (!mounted) return;

        const L = (window as any).L;
        if (!L) return;

        // Wait for DOM element to be ready
        const container = document.getElementById(mapContainerId.current);
        if (!container) return;

        // Clean up any existing map instance
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Create new map
        mapRef.current = L.map(mapContainerId.current, {
          center: [lat, lng],
          zoom: 10,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);

        // Add marker for project location
        const marker = L.marker([lat, lng]).addTo(mapRef.current);
        marker.bindPopup(`<strong>${location || 'Project Location'}</strong><br/>Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`).openPopup();

      } catch (e) {
        console.warn('Failed to initialize map:', e);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initMap, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapRef.current = null;
      }
    };
  }, [coordinates, location]);

  return (
    <div 
      id={mapContainerId.current} 
      className="w-full h-full rounded" 
      style={{ minHeight: '350px' }} 
    />
  );
}

// Leaflet loader
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
    if (document.getElementById(sId)) {
      // Script exists, wait for L to be available
      const checkL = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkL);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkL);
        resolve();
      }, 3000);
      return;
    }
    
    const script = document.createElement('script');
    script.id = sId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load leaflet'));
    document.body.appendChild(script);
  });
}
