import { useNavigate } from 'react-router-dom';
import MapBackground from '@/components/MapBackground';

const Index = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate('/map');
  };

  return (
    <div className="relative h-full w-full overflow-hidden landing-page">
      {/* Blurred map background */}
      <MapBackground blurred />
      
      {/* Radial gradient overlay for center focus */}
      <div className="absolute inset-0 landing-overlay" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <h1 
          className="mb-3 text-5xl md:text-6xl lg:text-7xl font-playfair font-normal text-landing-dark tracking-tight opacity-0 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          A Map Of Memories
        </h1>
        
        <p 
          className="mb-8 text-lg md:text-xl font-playfair italic text-landing-muted opacity-0 animate-fade-in"
          style={{ animationDelay: '250ms' }}
        >
          Just someone who remembered something.
        </p>
        
        {/* What it is section */}
        <div 
          className="mb-8 max-w-md opacity-0 animate-fade-in"
          style={{ animationDelay: '350ms' }}
        >
          <ul className="text-sm md:text-base font-playfair text-landing-dark space-y-1 text-center">
            <li>• Pin memories to places that matter</li>
            <li>• Create your personal map of moments</li>
            <li>• Share stories through locations</li>
            <li>• Explore the world through memories</li>
          </ul>
        </div>
        
        <button
          onClick={handleExplore}
          className="amom-button-landing opacity-0 animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          Explore AMOM
        </button>
      </div>
    </div>
  );
};

export default Index;
