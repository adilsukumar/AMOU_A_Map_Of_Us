import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Memory, MEMORY_CATEGORIES } from '@/hooks/useMemories';
import { Navigation, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateMemoryTopic } from '@/lib/memoryUtils';
import { format } from 'date-fns';

interface MapViewProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
  onMapClick: (coords: { lat: number; lng: number }, screenPos: { x: number; y: number }) => void;
  selectedMemory: Memory | null;
  isPlacementMode: boolean;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
}

// Create custom cluster icon with intensity-based colors
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 40 : count < 100 ? 50 : 60;
  const fontSize = count < 10 ? 14 : count < 100 ? 16 : 18;
  
  // Intensity-based color gradients - brighter with more memories
  let gradient, shadowColor, intensity;
  if (count < 5) {
    // Low intensity - muted colors
    gradient = 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    shadowColor = 'rgba(148, 163, 184, 0.3)';
    intensity = 'low';
  } else if (count < 15) {
    // Medium intensity - moderate brightness
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    shadowColor = 'rgba(102, 126, 234, 0.4)';
    intensity = 'medium';
  } else if (count < 30) {
    // High intensity - bright colors
    gradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    shadowColor = 'rgba(240, 147, 251, 0.5)';
    intensity = 'high';
  } else {
    // Very high intensity - most vibrant
    gradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    shadowColor = 'rgba(79, 172, 254, 0.6)';
    intensity = 'very-high';
  }
  
  return L.divIcon({
    html: `
      <div class="cluster-marker cluster-${intensity}" style="
        width: ${size}px;
        height: ${size}px;
        background: ${gradient};
        border: 3px solid rgba(255,255,255,0.8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Playfair Display', serif;
        font-weight: 600;
        color: white;
        font-size: ${fontSize}px;
        box-shadow: 0 4px 20px ${shadowColor};
        backdrop-filter: blur(8px);
        transition: all 0.3s ease;
      ">${count}</div>
    `,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};
const createCustomIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 48 : 36;
  const glowSize = isSelected ? 60 : 48;
  const svgIcon = `
    <svg width="${glowSize}" height="${glowSize}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow-${color.replace('#', '')}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="grad-${color.replace('#', '')}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.9"/>
          <stop offset="70%" style="stop-color:${color};stop-opacity:0.4"/>
          <stop offset="100%" style="stop-color:${color};stop-opacity:0"/>
        </radialGradient>
      </defs>
      <!-- Outer glow -->
      <circle cx="30" cy="30" r="24" fill="url(#grad-${color.replace('#', '')})" filter="url(#glow-${color.replace('#', '')})"/>
      <!-- Main circle -->
      <circle cx="30" cy="30" r="12" fill="${color}" filter="url(#glow-${color.replace('#', '')})"/>
      <!-- Inner highlight -->
      <circle cx="30" cy="30" r="6" fill="${color}" opacity="0.9"/>
      <circle cx="28" cy="28" r="3" fill="white" opacity="0.7"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-memory-marker',
    iconSize: [glowSize, glowSize],
    iconAnchor: [glowSize / 2, glowSize / 2],
  });
};

// Create tooltip content for a memory
const createTooltipContent = (memory: Memory): string => {
  const categoryInfo = MEMORY_CATEGORIES.find(c => c.value === memory.category);
  const categoryLabel = categoryInfo?.label || '💭 Memory';
  const displayName = memory.display_name || memory.username || 'Anonymous';
  const date = format(new Date(memory.created_at), 'MMM d, yyyy');
  const autoTopic = generateMemoryTopic(memory.description || '', memory.title);
  
  return `
    <div class="memory-tooltip">
      <div class="memory-tooltip-header">
        <span class="memory-tooltip-category">${categoryLabel}</span>
        ${memory.is_public ? '<span class="memory-tooltip-public">Public</span>' : ''}
      </div>
      <div class="memory-tooltip-title">${autoTopic}</div>
      ${memory.description ? `<div class="memory-tooltip-desc-container">
        <div class="memory-tooltip-desc">${memory.description}</div>
      </div>` : ''}
      <div class="memory-tooltip-meta">
        <span>By ${displayName}</span>
        <span>•</span>
        <span>${date}</span>
      </div>
    </div>
  `;
};

const MapView = ({ memories, onMemoryClick, onMapClick, selectedMemory, isPlacementMode, flyToLocation }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ memory: Memory; position: { x: number; y: number }; zoom: number } | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 22, // Increased for extreme detail
      maxBounds: [[-90, -180], [90, 180]], // Include Antarctica
      worldCopyJump: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 60,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      wheelDebounceTime: 50,
      zoomControl: false,
    });

    // Add zoom control in top-left with offset
    L.control.zoom({
      position: 'topleft'
    }).addTo(map);

    // Create marker cluster group
    const clusterGroup = (L as any).markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.5,
      removeOutsideVisibleBounds: true,
      animate: true,
      animateAddingMarkers: true
    });
    
    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // EXTREME DETAIL OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 22
    });

    // Ultra high-resolution satellite imagery
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>',
      maxZoom: 22
    });

    // MAXIMUM detail layer - shows every building, business, street
    const ultraDetailLayer = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap Deutschland',
      maxZoom: 22
    });

    // EXTREME POI density layer
    const maxPOILayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxZoom: 22
    });

    // Extreme building detail
    const buildingsLayer = L.tileLayer('https://{s}.tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 22,
      opacity: 0.9
    });

    // Add ultra-detailed layer as base with maximum detail
    ultraDetailLayer.addTo(map);

    // Add single clean detail overlay for maximum information
    const cleanDetailOverlay = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places_Alternate/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
      maxZoom: 22,
      opacity: 0.6
    });
    cleanDetailOverlay.addTo(map);

    // Layer control with EXTREME detail options
    const baseLayers = {
      "🏢 ULTRA Detail (Default)": ultraDetailLayer,
      "🗺️ Max POI + Continents": maxPOILayer,
      "🌍 Standard OSM": osmLayer,
      "🏗️ Buildings View": buildingsLayer,
      "🛰️ Satellite HD": satelliteLayer
    };

    const overlayLayers = {
      // Clean single layer to avoid duplicates
    };

    L.control.layers(baseLayers, overlayLayers, {
      position: 'topright',
      collapsed: true
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
      }
      map.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update click handler based on placement mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isPlacementMode) {
        const screenPos = map.latLngToContainerPoint(e.latlng);
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }, { x: screenPos.x, y: screenPos.y });
      }
    };

    map.off('click');
    map.on('click', handleClick);

    // Update cursor style
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isPlacementMode ? 'crosshair' : 'grab';
    }

    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClick, isPlacementMode]);

  // Update markers when memories change or map becomes ready
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !mapReady || !clusterGroup) return;

    // Clear existing markers from cluster group
    clusterGroup.clearLayers();
    markersRef.current.clear();

    // Add markers to cluster group
    memories.forEach((memory) => {
      const isSelected = selectedMemory?.id === memory.id;
      const color = memory.color || '#F9A8D4';
      const icon = createCustomIcon(color, isSelected);

      const marker = L.marker([memory.latitude, memory.longitude], { icon })
        .on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          // Clear any pending hover tooltip
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          setActiveTooltip(null);
          // First zoom to the memory location
          map.flyTo([memory.latitude, memory.longitude], Math.max(map.getZoom(), 14), {
            duration: 0.8,
          });
          // Then show the memory details after zoom
          setTimeout(() => {
            onMemoryClick(memory);
          }, 800);
        })
        .on('mouseover', (e: L.LeafletMouseEvent) => {
          // Clear any existing timeouts
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
          }
          
          // Set 1-second delay for hover tooltip
          hoverTimeoutRef.current = setTimeout(() => {
            const markerLatLng = L.latLng(memory.latitude, memory.longitude);
            const containerPoint = map.latLngToContainerPoint(markerLatLng);
            const currentZoom = map.getZoom();
            setActiveTooltip({
              memory,
              position: { x: containerPoint.x, y: containerPoint.y },
              zoom: currentZoom
            });
          }, 1000); // 1 second delay
        })
        .on('mouseout', () => {
          // Clear hover timeout when mouse leaves
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
          }
          // Hide tooltip after short delay
          tooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(null);
          }, 300);
        });
      
      clusterGroup.addLayer(marker);
      markersRef.current.set(memory.id, marker);
    });
  }, [memories, selectedMemory, onMemoryClick, mapReady]);

  // Center on selected memory
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedMemory) return;

    map.flyTo([selectedMemory.latitude, selectedMemory.longitude], Math.max(map.getZoom(), 10), {
      duration: 0.8,
    });
  }, [selectedMemory]);

  // Search for locations using Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=en`
      );
      const results = await response.json();
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search location');
    }
  };

  // Handle search input with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocation(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search result selection
  const handleSearchResultClick = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 15, { duration: 1.5 });
    }
    
    setSearchQuery(result.display_name);
    setShowSearchResults(false);
    toast.success(`Found: ${result.display_name}`);
  };

  // Fly to specific location (from panel click)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToLocation) return;

    map.flyTo([flyToLocation.lat, flyToLocation.lng], flyToLocation.zoom || 12, {
      duration: 1,
    });
  }, [flyToLocation]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ background: 'hsl(215, 28%, 10%)' }}
      />
      
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 right-4 z-[1001] flex justify-end">
        <div className="relative w-full max-w-sm">
          <div className="flex items-center bg-gray-200 border border-gray-300 rounded-xl shadow-lg">
            <Search className="w-5 h-5 text-gray-600 ml-4" />
            <input
              type="text"
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-transparent text-gray-800 font-playfair placeholder:text-gray-500 
                       focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors 
                           border-b border-gray-200 last:border-b-0 flex items-start gap-3"
                >
                  <Search className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 font-playfair text-sm font-medium truncate">
                      {result.name || result.display_name.split(',')[0]}
                    </div>
                    <div className="text-gray-600 font-playfair text-xs truncate">
                      {result.display_name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Locate Me Button */}
      <div className="absolute top-20 right-4 z-[1000]">
        <button
          onClick={() => {
            if (!navigator.geolocation) {
              toast.error('Geolocation is not supported by your browser');
              return;
            }
            toast.loading('Finding your location...', { id: 'locate' });
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                mapRef.current?.flyTo([latitude, longitude], 14, { duration: 1.2 });
                toast.success('Found your location!', { id: 'locate' });
              },
              (error) => {
                toast.error('Unable to get your location', { id: 'locate' });
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
          className="w-12 h-12 rounded-full bg-[#2a3142]/95 backdrop-blur-md border border-[#3d4555] 
                    shadow-lg flex items-center justify-center hover:bg-[#353d4f]/95 transition-colors cursor-pointer"
          title="Find my location"
        >
          <Navigation className="w-5 h-5 text-[#e8eaed]" />
        </button>
      </div>



      {/* 3-Second Hover Tooltip */}
      {activeTooltip && (
        <div 
          className="fixed z-[2000] pointer-events-auto"
          style={{
            left: `${activeTooltip.position.x}px`,
            top: `${activeTooltip.position.y - 320}px`, // Increased offset to show above marker
            transform: 'translateX(-50%)',
            transformOrigin: 'center bottom'
          }}
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) {
              clearTimeout(tooltipTimeoutRef.current);
            }
          }}
          onMouseLeave={() => {
            tooltipTimeoutRef.current = setTimeout(() => {
              setActiveTooltip(null);
            }, 100);
          }}
        >
          <div className="memory-tooltip-container-custom">
            <div 
              className="memory-tooltip"
              dangerouslySetInnerHTML={{ __html: createTooltipContent(activeTooltip.memory) }}
            />
          </div>
        </div>
      )}

      {/* Custom CSS for marker styling */}
      <style>{`
        .custom-memory-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: hsl(215, 28%, 10%) !important;
          font-family: 'Playfair Display', serif;
        }
        .leaflet-tile-pane {
          transition: opacity 0.15s ease-out;
        }
        .leaflet-zoom-anim .leaflet-zoom-animated {
          transition: transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) !important;
        }
        .leaflet-control-attribution {
          background: rgba(42, 49, 66, 0.9) !important;
          backdrop-filter: blur(8px);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          margin: 8px !important;
          color: #8b95a5 !important;
        }
        .leaflet-control-attribution a {
          color: #8b95a5 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin-top: 96px !important;
          margin-left: 16px !important;
          background: transparent !important;
        }
        .leaflet-control-zoom a {
          background: rgba(42, 49, 66, 0.95) !important;
          color: #e8eaed !important;
          border: 1px solid #3d4555 !important;
          border-bottom: none !important;
          width: 40px !important;
          height: 40px !important;
          line-height: 38px !important;
          font-size: 20px !important;
          font-weight: 300 !important;
          transition: all 0.15s ease;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .leaflet-control-zoom a:first-child {
          border-radius: 12px 12px 0 0 !important;
          border-bottom: none !important;
        }
        .leaflet-control-zoom a:last-child {
          border-radius: 0 0 12px 12px !important;
          border-top: 1px solid #3d4555 !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(53, 61, 79, 0.95) !important;
          color: #fff !important;
        }
        .leaflet-control-zoom a:active {
          background: rgba(64, 72, 89, 0.95) !important;
        }
        
        /* Layer Control Styles */
        .leaflet-control-layers {
          background: rgba(42, 49, 66, 0.95) !important;
          border: 1px solid #3d4555 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
          backdrop-filter: blur(12px);
          color: #e8eaed !important;
          font-family: 'Playfair Display', serif !important;
          margin-top: 16px !important;
          margin-right: 16px !important;
        }
        .leaflet-control-layers-toggle {
          background: rgba(42, 49, 66, 0.95) !important;
          border-radius: 8px !important;
          width: 36px !important;
          height: 36px !important;
        }
        .leaflet-control-layers-list {
          color: #e8eaed !important;
          font-size: 13px !important;
        }
        .leaflet-control-layers label {
          color: #e8eaed !important;
          font-family: 'Playfair Display', serif !important;
        }
        .leaflet-control-layers input[type="radio"] {
          margin-right: 8px !important;
        }
        
        /* Custom Cluster Styles with Intensity */
        .custom-cluster-icon {
          background: transparent !important;
          border: none !important;
        }
        .cluster-marker {
          transition: all 0.3s ease;
        }
        .cluster-marker:hover {
          transform: scale(1.15);
        }
        .cluster-low:hover {
          box-shadow: 0 6px 25px rgba(148, 163, 184, 0.5) !important;
        }
        .cluster-medium:hover {
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6) !important;
        }
        .cluster-high:hover {
          box-shadow: 0 6px 25px rgba(240, 147, 251, 0.7) !important;
        }
        .cluster-very-high:hover {
          box-shadow: 0 6px 25px rgba(79, 172, 254, 0.8) !important;
        }

        
        /* Memory Tooltip Styles */
        .memory-tooltip-container {
          background: rgba(42, 49, 66, 0.98) !important;
          border: 1px solid #3d4555 !important;
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
          backdrop-filter: blur(12px);
        }
        .memory-tooltip-container::before {
          border-top-color: rgba(42, 49, 66, 0.98) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #3d4555 !important;
        }
        .memory-tooltip-container-custom {
          background: rgba(42, 49, 66, 0.98);
          border: 1px solid #3d4555;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
          position: relative;
        }
        .memory-tooltip-container-custom::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid #3d4555;
          z-index: 1;
        }
        .memory-tooltip-container-custom::after {
          content: '';
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid rgba(42, 49, 66, 0.98);
          z-index: 2;
        }
        .memory-tooltip {
          padding: 28px 32px 36px 32px; /* Much more padding for bigger tooltip */
          min-width: 280px;
          max-width: 420px;
          height: 280px; /* Much taller */
          display: flex;
          flex-direction: column;
        }
        .memory-tooltip-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .memory-tooltip-category {
          font-size: 14px;
          color: #e8eaed;
          font-family: 'Playfair Display', serif;
        }
        .memory-tooltip-public {
          font-size: 10px;
          color: #8b95a5;
          background: rgba(139, 149, 165, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .memory-tooltip-title {
          font-size: 16px;
          font-weight: 600;
          color: #e8eaed;
          font-family: 'Playfair Display', serif;
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .memory-tooltip-desc-container {
          max-height: 140px; /* Even more space for description */
          overflow-y: auto;
          margin-bottom: 16px; /* More space before meta */
          padding-right: 6px;
          flex: 1; /* Take remaining space */
        }
        .memory-tooltip-desc {
          font-size: 14px;
          color: #c4c9d4;
          line-height: 1.5;
          font-family: 'Playfair Display', serif;
          word-wrap: break-word;
        }
        .memory-tooltip-desc-container::-webkit-scrollbar {
          width: 4px;
        }
        .memory-tooltip-desc-container::-webkit-scrollbar-track {
          background: rgba(139, 149, 165, 0.1);
          border-radius: 2px;
        }
        .memory-tooltip-desc-container::-webkit-scrollbar-thumb {
          background: rgba(139, 149, 165, 0.4);
          border-radius: 2px;
        }
        .memory-tooltip-desc-container::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 149, 165, 0.6);
        }
        .memory-tooltip-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: #8b95a5;
          font-family: 'Playfair Display', serif;
          margin-top: auto; /* Push to bottom */
          padding-top: 12px;
          padding-bottom: 6px;
        }
      `}</style>
    </div>
  );
};

export default MapView;
