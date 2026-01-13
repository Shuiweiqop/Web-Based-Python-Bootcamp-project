import React from 'react';

/**
 * AnimationStyles Component
 * Injects CSS keyframe animations for background effects
 * 
 * This component has no props and is purely for styling
 */
const AnimationStyles = () => (
  <style jsx>{`
    /* Background Scale Animation */
    @keyframes bg-scale {
      0%, 100% { 
        transform: scale(1); 
      }
      50% { 
        transform: scale(1.1); 
      }
    }
    
    /* Background Rotate Animation */
    @keyframes bg-rotate {
      0% { 
        transform: rotate(0deg) scale(1.2); 
      }
      100% { 
        transform: rotate(360deg) scale(1.2); 
      }
    }
    
    /* Background Float Animation */
    @keyframes bg-float {
      0%, 100% { 
        transform: translateY(0px); 
      }
      50% { 
        transform: translateY(-20px); 
      }
    }
    
    /* Ken Burns Effect (Cinematic Zoom) */
    @keyframes ken-burns {
      0% { 
        transform: scale(1) translate(0, 0); 
      }
      100% { 
        transform: scale(1.2) translate(-10%, -10%); 
      }
    }
    
    /* Particle Float Animation */
    @keyframes particle-float {
      0% { 
        transform: translateY(0) translateX(0); 
        opacity: 0; 
      }
      10% { 
        opacity: 1; 
      }
      90% { 
        opacity: 1; 
      }
      100% { 
        transform: translateY(-100px) translateX(20px); 
        opacity: 0; 
      }
    }
    
    /* Animation Classes */
    .animate-bg-scale { 
      animation: bg-scale ease-in-out infinite; 
    }
    
    .animate-bg-rotate { 
      animation: bg-rotate linear infinite; 
    }
    
    .animate-bg-float { 
      animation: bg-float ease-in-out infinite; 
    }
    
    .animate-ken-burns { 
      animation: ken-burns ease-out forwards; 
    }
    
    .animate-particle-float { 
      animation: particle-float linear infinite; 
    }
  `}</style>
);

export default AnimationStyles;