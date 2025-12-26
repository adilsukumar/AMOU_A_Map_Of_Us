import { useEffect, useState } from 'react';

interface MapBackgroundProps {
  blurred?: boolean;
  className?: string;
}

const MapBackground = ({ blurred = true, className = '' }: MapBackgroundProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Static map image as background - resembling Google Maps style */}
      <div 
        className={`w-full h-full transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23f5f5f3' width='1920' height='1080'/%3E%3C!-- Water bodies --%3E%3Cpath d='M0 400 Q 200 380 400 420 Q 600 460 800 400 Q 1000 340 1200 380 Q 1400 420 1600 360 L 1920 380 L 1920 600 Q 1700 580 1500 620 Q 1300 660 1100 600 Q 900 540 700 580 Q 500 620 300 560 Q 100 500 0 540 Z' fill='%23aadaff' opacity='0.6'/%3E%3C!-- Parks --%3E%3Crect x='100' y='200' width='180' height='120' rx='10' fill='%23c8e6c9' opacity='0.7'/%3E%3Crect x='500' y='100' width='200' height='150' rx='10' fill='%23c8e6c9' opacity='0.6'/%3E%3Crect x='1200' y='180' width='250' height='180' rx='10' fill='%23c8e6c9' opacity='0.7'/%3E%3Crect x='1600' y='300' width='150' height='100' rx='10' fill='%23c8e6c9' opacity='0.6'/%3E%3Crect x='200' y='700' width='220' height='160' rx='10' fill='%23c8e6c9' opacity='0.7'/%3E%3Crect x='800' y='750' width='180' height='120' rx='10' fill='%23c8e6c9' opacity='0.6'/%3E%3C!-- Major roads --%3E%3Cpath d='M0 300 L 1920 280' stroke='%23ffffff' stroke-width='8' fill='none'/%3E%3Cpath d='M0 600 L 1920 620' stroke='%23ffffff' stroke-width='8' fill='none'/%3E%3Cpath d='M300 0 L 320 1080' stroke='%23ffffff' stroke-width='8' fill='none'/%3E%3Cpath d='M900 0 L 880 1080' stroke='%23ffffff' stroke-width='8' fill='none'/%3E%3Cpath d='M1500 0 L 1520 1080' stroke='%23ffffff' stroke-width='8' fill='none'/%3E%3C!-- Minor streets grid --%3E%3Cg stroke='%23e0e0e0' stroke-width='2' opacity='0.5'%3E%3Cline x1='0' y1='150' x2='1920' y2='160'/%3E%3Cline x1='0' y1='450' x2='1920' y2='440'/%3E%3Cline x1='0' y1='750' x2='1920' y2='760'/%3E%3Cline x1='0' y1='900' x2='1920' y2='890'/%3E%3Cline x1='150' y1='0' x2='140' y2='1080'/%3E%3Cline x1='450' y1='0' x2='460' y2='1080'/%3E%3Cline x1='600' y1='0' x2='590' y2='1080'/%3E%3Cline x1='750' y1='0' x2='760' y2='1080'/%3E%3Cline x1='1050' y1='0' x2='1040' y2='1080'/%3E%3Cline x1='1200' y1='0' x2='1210' y2='1080'/%3E%3Cline x1='1350' y1='0' x2='1340' y2='1080'/%3E%3Cline x1='1650' y1='0' x2='1660' y2='1080'/%3E%3Cline x1='1800' y1='0' x2='1790' y2='1080'/%3E%3C/g%3E%3C!-- Location markers --%3E%3Ccircle cx='350' cy='320' r='8' fill='%23ea4335'/%3E%3Ccircle cx='720' cy='480' r='8' fill='%23ea4335'/%3E%3Ccircle cx='1100' cy='280' r='8' fill='%23ea4335'/%3E%3Ccircle cx='1400' cy='550' r='8' fill='%23ea4335'/%3E%3Ccircle cx='550' cy='650' r='8' fill='%23ea4335'/%3E%3Ccircle cx='1600' cy='750' r='8' fill='%23ea4335'/%3E%3Ccircle cx='200' cy='850' r='8' fill='%23ea4335'/%3E%3Ccircle cx='950' cy='180' r='8' fill='%23ea4335'/%3E%3Ccircle cx='1750' cy='200' r='8' fill='%23ea4335'/%3E%3C!-- Building clusters --%3E%3Cg fill='%23f0f0f0' opacity='0.8'%3E%3Crect x='380' y='350' width='60' height='40' rx='2'/%3E%3Crect x='450' y='340' width='45' height='55' rx='2'/%3E%3Crect x='380' y='400' width='80' height='30' rx='2'/%3E%3Crect x='750' y='500' width='70' height='45' rx='2'/%3E%3Crect x='830' y='490' width='50' height='60' rx='2'/%3E%3Crect x='1120' y='300' width='55' height='50' rx='2'/%3E%3Crect x='1185' y='310' width='40' height='35' rx='2'/%3E%3C/g%3E%3C!-- Area labels (faded) --%3E%3Cg font-family='Arial, sans-serif' font-size='14' fill='%23999999' opacity='0.4'%3E%3Ctext x='150' y='250'%3EMidtown Park%3C/text%3E%3Ctext x='550' y='170'%3ECentral Gardens%3C/text%3E%3Ctext x='1240' y='250'%3ERiverside%3C/text%3E%3Ctext x='400' y='450'%3EDowntown%3C/text%3E%3Ctext x='800' y='350'%3EMain Street%3C/text%3E%3Ctext x='1100' y='480'%3EHarbor District%3C/text%3E%3Ctext x='250' y='780'%3ESouthside%3C/text%3E%3Ctext x='850' y='820'%3EWest End%3C/text%3E%3Ctext x='1500' y='650'%3ENorthgate%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: blurred ? 'blur(4px)' : 'none',
          transform: blurred ? 'scale(1.02)' : 'scale(1)',
        }}
      />
      
      {/* Light overlay for text readability */}
      {blurred && (
        <div className="absolute inset-0 bg-white/20" />
      )}
    </div>
  );
};

export default MapBackground;
