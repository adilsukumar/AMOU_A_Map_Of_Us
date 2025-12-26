import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import AmomLogo from '@/components/AmomLogo';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <AmomLogo variant="broken" className="w-20 h-20 mb-8 opacity-0 animate-fade-in" />
      
      <h1 
        className="text-2xl md:text-3xl font-playfair text-foreground mb-4 text-center opacity-0 animate-fade-in"
        style={{ animationDelay: '150ms' }}
      >
        This place doesn't exist yet.
      </h1>
      
      <p 
        className="text-muted-foreground font-playfair italic text-center mb-8 max-w-md opacity-0 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        You might've taken a wrong turn, but don't worry, let's get you back to AMOM!
      </p>
      
      <button
        onClick={() => navigate('/map')}
        className="amom-button opacity-0 animate-fade-in"
        style={{ animationDelay: '450ms' }}
      >
        Return to the map
      </button>
    </div>
  );
};

export default NotFound;
