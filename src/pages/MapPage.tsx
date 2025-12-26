import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import AmomLogo from '@/components/AmomLogo';
import MapView from '@/components/MapView';
import MemoryCard from '@/components/MemoryCard';
import MapMemoryPopup from '@/components/MapMemoryPopup';
import MemoriesPanel from '@/components/MemoriesPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useMemories, Memory } from '@/hooks/useMemories';
import { LogOut, MapPin, User, List } from 'lucide-react';

const MapPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(false);
  const [isMemoriesPanelOpen, setIsMemoriesPanelOpen] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [popupData, setPopupData] = useState<{
    coords: { lat: number; lng: number };
    position: { x: number; y: number };
  } | null>(null);
  
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { memories, loading: memoriesLoading, createMemory, deleteMemory, updateMemory } = useMemories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (coords: { lat: number; lng: number }, screenPos: { x: number; y: number }) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setPopupData({ coords, position: screenPos });
    setIsPlacementMode(false);
    setSelectedMemory(null);
  };

  const handleCreateMemory = async (memoryData: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    color: string;
    is_public: boolean;
    photo_url: string | null;
    category: string;
    created_at: string;
  }) => {
    await createMemory(memoryData);
    setPopupData(null);
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
    setSelectedMemory(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const togglePlacementMode = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsPlacementMode(!isPlacementMode);
    setPopupData(null);
    setSelectedMemory(null);
  };

  if (isLoading || authLoading) {
    return <LoadingScreen message="Setting your location" />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map View */}
      <div className="absolute inset-0">
        <MapView
          memories={memories}
          onMemoryClick={setSelectedMemory}
          onMapClick={handleMapClick}
          selectedMemory={selectedMemory}
          isPlacementMode={isPlacementMode}
          flyToLocation={flyToLocation}
        />
      </div>

      {/* Top Bar - Clean header with logo and actions */}
      <div className="absolute top-4 left-4 right-4 z-[1001] flex justify-between items-start pointer-events-none">
        {/* Logo */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-2.5 bg-[#2a3142]/95 backdrop-blur-md rounded-xl 
                   border border-[#3d4555] shadow-lg hover:bg-[#353d4f] transition-all pointer-events-auto"
        >
          <AmomLogo variant="full" className="w-7 h-7" />
          <span className="text-[#e8eaed] text-sm font-playfair tracking-wide">
            AMOM
          </span>
        </button>

        {/* Right side actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3142]/95 backdrop-blur-md 
                       border border-[#3d4555] rounded-xl text-[#e8eaed] font-playfair 
                       text-sm hover:bg-[#353d4f] shadow-lg transition-all"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#2a3142]/95 backdrop-blur-md 
                       border border-[#3d4555] rounded-xl text-[#e8eaed] font-playfair 
                       text-sm hover:bg-[#353d4f] shadow-lg transition-all"
            >
              <User size={16} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Controls - Organized in a clean bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#2a3142]/95 backdrop-blur-md rounded-2xl 
                      border border-[#3d4555] shadow-xl pointer-events-auto">
          
          {/* Add Memory Button */}
          <button
            onClick={togglePlacementMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-playfair text-sm transition-all
                       ${isPlacementMode 
                         ? 'bg-rose-500 text-white' 
                         : 'bg-[#353d4f] text-[#e8eaed] hover:bg-[#404859]'
                       }`}
            title={isPlacementMode ? 'Cancel' : 'Add memory'}
          >
            <MapPin size={18} className={isPlacementMode ? 'animate-pulse' : ''} />
            <span>{isPlacementMode ? 'Cancel' : 'Add Memory'}</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-[#3d4555]" />

          {/* Memories Button */}
          {user && (
            <button
              onClick={() => setIsMemoriesPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#353d4f] 
                       text-[#e8eaed] hover:bg-[#404859] font-playfair text-sm transition-all"
            >
              <List size={18} />
              <span>{memories.length} {memories.length === 1 ? 'Memory' : 'Memories'}</span>
            </button>
          )}
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-[#8b95a5]/60 mt-3 font-playfair">
          {isPlacementMode 
            ? 'Click anywhere on the map to place your memory'
            : 'Drag to explore • Scroll to zoom'
          }
        </p>
      </div>

      {/* Memory Card */}
      {selectedMemory && (
        <MemoryCard
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onDelete={(id) => {
            const confirmed = window.confirm('Are you sure you want to delete this memory?');
            if (confirmed) handleDeleteMemory(id);
          }}
          onUpdate={async (id, updates) => {
            await updateMemory(id, updates);
            const updated = memories.find(m => m.id === id);
            if (updated) setSelectedMemory({ ...updated, ...updates });
          }}
        />
      )}

      {/* Memory Popup */}
      {popupData && (
        <MapMemoryPopup
          onSubmit={handleCreateMemory}
          onClose={() => setPopupData(null)}
          coordinates={popupData.coords}
          position={popupData.position}
        />
      )}

      {/* Memories Panel */}
      <MemoriesPanel
        memories={memories}
        isOpen={isMemoriesPanelOpen}
        onClose={() => setIsMemoriesPanelOpen(false)}
        onMemoryClick={(memory) => {
          setSelectedMemory(memory);
          setFlyToLocation({ lat: memory.latitude, lng: memory.longitude, zoom: 14 });
        }}
        onDeleteMemory={handleDeleteMemory}
        onUpdateMemory={async (id, updates) => {
          await updateMemory(id, updates);
        }}
      />
    </div>
  );
};

export default MapPage;
