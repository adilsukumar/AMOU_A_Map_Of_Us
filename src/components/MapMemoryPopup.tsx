import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ImagePlus, X } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MEMORY_CATEGORIES } from '@/hooks/useMemories';

interface MapMemoryPopupProps {
  onSubmit: (memory: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    color: string;
    is_public: boolean;
    photo_url: string | null;
    category: string;
    created_at: string;
  }) => void;
  onClose: () => void;
  coordinates: { lat: number; lng: number };
  position: { x: number; y: number };
}

const MapMemoryPopup = ({ onSubmit, onClose, coordinates, position }: MapMemoryPopupProps) => {
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'me' | 'public'>('me');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [category, setCategory] = useState('memory');
  const [day, setDay] = useState(new Date().getDate().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isPublic, setIsPublic] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F9A8D4');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Sync visibility dropdown with isPublic toggle
  useEffect(() => {
    setVisibility(isPublic ? 'public' : 'me');
  }, [isPublic]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;
    
    // For local storage, we'll convert the image to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(photoFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    let photoUrl: string | null = null;
    if (photoFile) {
      photoUrl = await uploadPhoto();
    }
    
    // Create date from user inputs
    const customDate = new Date(
      parseInt(year) || new Date().getFullYear(),
      (parseInt(month) || new Date().getMonth() + 1) - 1, // Month is 0-indexed
      parseInt(day) || new Date().getDate()
    );
    
    onSubmit({
      title: description.slice(0, 50) || 'Memory',
      description: description,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      color: selectedColor,
      is_public: isPublic,
      photo_url: photoUrl,
      category: category,
      created_at: customDate.toISOString(),
    });
    
    setUploading(false);
  };


  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Centered Popup Container */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2a3142] border border-[#3d4555] rounded-xl p-4 w-full max-w-2xl shadow-2xl animate-fade-in pointer-events-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Memory textarea - Full width */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Your memory..."
              rows={3}
              className="w-full px-3 py-2 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                       text-[#e8eaed] font-playfair placeholder:text-[#8b95a5] text-sm
                       focus:outline-none focus:border-[#6b7a94] transition-colors resize-none"
              autoFocus
            />

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                {/* Visibility dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-3 py-2 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                             text-[#e8eaed] font-playfair text-left flex items-center justify-between text-sm
                             focus:outline-none focus:border-[#6b7a94] transition-colors"
                  >
                    <span>{visibility === 'me' ? 'For me' : 'Public'}</span>
                    <ChevronDown size={16} className={`text-[#8b95a5] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a3142] border border-[#3d4555] rounded-lg shadow-xl z-10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => { 
                          setVisibility('me'); 
                          setIsPublic(false); 
                          setShowDropdown(false); 
                        }}
                        className="w-full px-3 py-2 text-left font-playfair text-[#e8eaed] hover:bg-[#353d4f] transition-colors text-sm"
                      >
                        For me
                      </button>
                      <button
                        type="button"
                        onClick={() => { 
                          setVisibility('public'); 
                          setIsPublic(true); 
                          setShowDropdown(false); 
                        }}
                        className="w-full px-3 py-2 text-left font-playfair text-[#e8eaed] hover:bg-[#353d4f] transition-colors text-sm"
                      >
                        Public
                      </button>
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-playfair text-[#c4c9d4] mb-1">
                    Type of memory
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full px-3 py-2 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                             text-[#e8eaed] font-playfair text-left flex items-center justify-between text-sm
                             focus:outline-none focus:border-[#6b7a94] transition-colors"
                  >
                    <span>{MEMORY_CATEGORIES.find(c => c.value === category)?.label || 'Memory'}</span>
                    <ChevronDown size={16} className={`text-[#8b95a5] transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a3142] border border-[#3d4555] rounded-lg shadow-xl z-10 overflow-hidden max-h-32 overflow-y-auto">
                      {MEMORY_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => { setCategory(cat.value); setShowCategoryDropdown(false); }}
                          className={`w-full px-3 py-2 text-left font-playfair text-[#e8eaed] hover:bg-[#353d4f] transition-colors text-sm
                                    ${category === cat.value ? 'bg-[#353d4f]' : ''}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date fields */}
                <div>
                  <label className="block text-xs font-playfair text-[#c4c9d4] mb-1">
                    When did this happen?
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      placeholder="DD"
                      maxLength={2}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                               text-[#e8eaed] font-playfair text-center text-sm
                               focus:outline-none focus:border-[#6b7a94] transition-colors"
                    />
                    <input
                      type="text"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                               text-[#e8eaed] font-playfair text-center text-sm
                               focus:outline-none focus:border-[#6b7a94] transition-colors"
                    />
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="YYYY"
                      maxLength={4}
                      className="flex-1 min-w-0 px-2 py-1.5 bg-[#1e2433] border border-[#3d4555] rounded-lg 
                               text-[#e8eaed] font-playfair text-center text-sm
                               focus:outline-none focus:border-[#6b7a94] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {/* Color Picker */}
                <ColorPicker selectedColor={selectedColor} onColorSelect={setSelectedColor} />

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-playfair text-[#c4c9d4] mb-1">
                    Add a photo (optional)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  {photoPreview ? (
                    <div className="relative">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-20 object-cover rounded-lg border border-[#3d4555]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-1 right-1 p-1 bg-[#1e2433]/80 rounded-full text-[#e8eaed] hover:bg-[#2a3142]"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-[#3d4555] rounded-lg 
                               text-[#8b95a5] hover:border-[#6b7a94] hover:text-[#e8eaed] transition-colors
                               flex items-center justify-center gap-2"
                    >
                      <ImagePlus size={16} />
                      <span className="font-playfair text-xs">Choose photo</span>
                    </button>
                  )}
                </div>

                {/* Public toggle */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newIsPublic = !isPublic;
                      setIsPublic(newIsPublic);
                      setVisibility(newIsPublic ? 'public' : 'me');
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                      isPublic ? 'bg-[#6b7a94]' : 'bg-[#3d4555]'
                    }`}
                  >
                    <span 
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#e8eaed] transition-all ${
                        isPublic ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-playfair text-[#e8eaed]">
                    Public
                  </span>
                </div>
              </div>
            </div>

            {/* Submit button - Full width */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-[#e8eaed] text-[#1e2433] font-playfair font-medium rounded-lg
                       hover:bg-[#d4d7dd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? 'Uploading...' : 'Submit Memory'}
            </button>

            {/* Note */}
            <p className="text-xs text-[#8b95a5] font-playfair italic text-center">
              Note: You can edit or delete this memory anytime afterwards from your profile.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default MapMemoryPopup;
