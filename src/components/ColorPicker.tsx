interface ColorOption {
  color: string;
  label: string;
  emoji: string;
}

const colorOptions: ColorOption[] = [
  { color: '#F9A8D4', label: 'Love', emoji: '💕' },
  { color: '#FCA5A5', label: 'Passion', emoji: '🔥' },
  { color: '#FBBF24', label: 'Joy', emoji: '☀️' },
  { color: '#A7F3D0', label: 'Peace', emoji: '🌿' },
  { color: '#93C5FD', label: 'Calm', emoji: '🌊' },
  { color: '#C4B5FD', label: 'Dream', emoji: '✨' },
  { color: '#9CA3AF', label: 'Memory', emoji: '📷' },
  { color: '#EF4444', label: 'Heartbreak', emoji: '💔' },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPicker = ({ selectedColor, onColorSelect }: ColorPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-playfair text-[#c4c9d4]">
        How does this memory feel?
      </label>
      <div className="grid grid-cols-4 gap-2">
        {colorOptions.map((option) => (
          <button
            key={option.color}
            type="button"
            onClick={() => onColorSelect(option.color)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all
                       ${selectedColor === option.color 
                         ? 'border-[#e8eaed] bg-[#353d4f]' 
                         : 'border-[#3d4555] hover:border-[#4d5565] bg-[#1e2433]'
                       }`}
          >
            <div 
              className="w-6 h-6 rounded-full shadow-lg"
              style={{ 
                backgroundColor: option.color,
                boxShadow: `0 0 12px ${option.color}80`
              }}
            />
            <span className="text-[10px] text-[#8b95a5] font-playfair truncate w-full text-center">
              {option.emoji} {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
export { colorOptions };
