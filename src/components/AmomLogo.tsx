interface AmomLogoProps {
  variant?: 'full' | 'broken';
  className?: string;
  animate?: boolean;
}

const AmomLogo = ({ variant = 'full', className = 'w-16 h-16', animate = false }: AmomLogoProps) => {
  return (
    <div 
      className={`${className} flex items-center justify-center text-4xl ${animate ? 'animate-pulse-soft' : ''}`}
      style={{ fontSize: 'inherit' }}
    >
      🌍
    </div>
  );
};

export default AmomLogo;
