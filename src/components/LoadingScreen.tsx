import AmomLogo from './AmomLogo';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Setting your location' }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
      <AmomLogo variant="full" className="w-20 h-20 mb-6" animate />
      <p className="text-foreground/90 text-lg font-playfair italic">
        {message}
      </p>
    </div>
  );
};

export default LoadingScreen;
