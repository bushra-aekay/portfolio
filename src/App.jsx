import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, Instagram, FileText, Rss, Youtube, Sun, Moon } from 'lucide-react';

// --- Configuration ---
const LINKS = [
  { icon: FileText, href: "/path/to/your/resume.pdf", label: "Resume" },
  { icon: Rss, href: "https://medium.com/@yourusername", label: "Medium" },
  { icon: Youtube, href: "https://youtube.com/@yourusername", label: "YouTube" },
  { icon: Github, href: "https://github.com/yourusername", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/yourusername", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/yourusername", label: "Instagram" },
  { icon: Mail, href: "mailto:your.email@example.com", label: "Email" },
];

// Define the accent color (Violet/Purple accent, #8b5cf6)
const ACCENT_COLOR = '#8b5cf6'; 

// Define theme colors for sharp contrast - minimalist & clean
const THEMES = {
  dark: {
    bg: '#0f0f0f', // Pure dark with hint of depth
    text: '#ffffff',
    ambientStart: 'rgba(139, 92, 246, 0.15)', // Subtle accent
    ambientEnd: 'rgba(15, 15, 15, 1)',
    footerColor: '#ffffff66', // Reduced opacity for subtlety
    iconBg: 'rgba(255, 255, 255, 0.05)', // Very subtle icon background
  },
  light: {
    bg: '#fafafa', // Almost white with warmth
    text: '#1a1a1a',
    ambientStart: 'rgba(139, 92, 246, 0.08)', // Even more subtle
    ambientEnd: 'rgba(250, 250, 250, 1)',
    footerColor: '#99999966', // Neutral gray
    iconBg: 'rgba(0, 0, 0, 0.04)', // Very subtle icon background
  }
};

// --- Custom Hooks ---

/**
 * Hook to make an element draggable by updating its position state (x, y).
 * Only allows dragging when explicitly clicked (mousedown/touchstart on the element).
 */
const useDrag = (initialX = 0, initialY = 0) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragState = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const [isDragDisabled, setIsDragDisabled] = useState(false);

  const handleDragStart = useCallback((e) => {
    // Prevent dragging if explicitly disabled for this element
    if (isDragDisabled) return;
    if (e.type === 'mousedown' && e.button !== 0) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragState.current.isDragging = true;
    dragState.current.startX = clientX;
    dragState.current.startY = clientY;
    dragState.current.initialX = position.x;
    dragState.current.initialY = position.y;

    if (ref.current) {
      ref.current.style.cursor = 'grabbing';
      ref.current.classList.add('select-none');
    }
    // preventDefault may be blocked for passive listeners (mobile); only call when cancelable
    if (e.cancelable) {
      e.preventDefault();
    }
  }, [position.x, position.y, isDragDisabled]);

  const handleDrag = useCallback((e) => {
    if (!dragState.current.isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;

    setPosition({
      x: dragState.current.initialX + dx,
      y: dragState.current.initialY + dy,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragState.current.isDragging = false;
    if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.classList.remove('select-none');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    // make touchmove non-passive so preventDefault can be used safely during touch drags
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag, { passive: false });
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDrag, handleDragEnd]);

  return {
    ref,
    position,
    handleDragStart,
    setIsDragDisabled, // Expose this to allow disabling drag for child elements
    // Base class for absolute positioning from the center of the main container
    // Use relative/inline-block so elements participate in normal flow (better for responsive layouts)
    dragClassName: "relative inline-block will-change-transform",
  };
};


/**
 * Hook to apply a subtle parallax effect based on mouse movement relative to the viewport center.
 */
const useParallaxEffect = (maxTilt = 8) => {
  const [transformStyle, setTransformStyle] = useState({});

  const handleMouseMove = useCallback((e) => {
    const { innerWidth: w, innerHeight: h } = window;
    const { clientX, clientY } = e;

    const xPos = (clientX - w / 2) / (w / 2);
    const yPos = (clientY - h / 2) / (h / 2);

    const translateX = -xPos * maxTilt * 0.4;
    const translateY = -yPos * maxTilt * 0.4;
    const rotateX = yPos * maxTilt * 0.2;
    const rotateY = -xPos * maxTilt * 0.2;

    setTransformStyle({
      transform: `translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    });
  }, [maxTilt]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return transformStyle;
};

// --- Components ---

/**
 * Component that combines Dragging, Magnetic Hover, and Tooltips for an individual icon.
 */
const DraggableMagneticLink = ({ icon: Icon, href, label, initialX, initialY, theme }) => {
  // 1. Dragging Setup - but we'll prevent drag on the child link
  const { ref: dragRef, position: dragPosition, handleDragStart, setIsDragDisabled, dragClassName } = useDrag(initialX, initialY);
  
  // 2. Magnetic Hover Setup
  const [magneticPosition, setMagneticPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!elementRef.current) return;
    const { left, top, width, height } = elementRef.current.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setMagneticPosition({ x: x * 0.25, y: y * 0.25 }); // Reduced attraction for subtlety
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMagneticPosition({ x: 0, y: 0 });
  }, []);

  // 3. Tooltip Setup
  const [showTooltip, setShowTooltip] = useState(false);

  // Combine initial offset, drag translation, and magnetic micro-translation
  const combinedTransform = `
    translate3d(${dragPosition.x}px, ${dragPosition.y}px, 0) 
    translate(${magneticPosition.x}px, ${magneticPosition.y}px)
  `;
  
  // Tooltip colors adapt dynamically - more subtle
  const tooltipBg = theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)';
  const tooltipText = theme === 'dark' ? '#ffffff' : '#1a1a1a';
  const tooltipArrowColor = theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)';

  return (
    <div
      ref={dragRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className={`${dragClassName} cursor-grab active:cursor-grabbing transition-all duration-300 ease-out-expo`}
      style={{
        transform: combinedTransform,
        // prevent the browser from handling touch gestures (like scroll) while interacting with the element
        touchAction: 'none',
      }}
    >
      <div 
        ref={elementRef}
        onMouseEnter={() => {
          setShowTooltip(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setShowTooltip(false);
          setIsHovered(false);
          handleMouseLeave();
        }}
        onMouseMove={handleMouseMove}
      >
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-2.5 md:p-3 transition-all duration-300 block"
          style={{ 
            color: ACCENT_COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Minimalist: no filled circle, transparent background and no border
            backgroundColor: 'transparent',
            transform: isHovered ? 'scale(1.12)' : 'scale(1)',
            boxShadow: isHovered ? `0 6px 18px ${ACCENT_COLOR}15` : 'none',
            border: 'none',
            padding: 10,
            borderRadius: 8,
          }}
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tooltip implementation: Shows from bottom with subtle animation */}
          {showTooltip && (
            <div 
              className="absolute whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md top-full left-1/2 transform -translate-x-1/2 shadow-md mt-3 animate-fadeIn backdrop-blur-sm"
              style={{ 
                zIndex: 50,
                backgroundColor: tooltipBg,
                color: tooltipText,
                fontSize: '12px',
                letterSpacing: '0.3px',
              }}
            >
              {label}
              {/* Tooltip arrow element pointing upward */}
              <div 
                style={{
                  position: 'absolute',
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `4px solid ${tooltipArrowColor}`,
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          )}
          <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
};

/**
 * Main application component.
 */
const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const parallaxStyle = useParallaxEffect(10);
  
  // Drag hook for the name
  // Adjusted initialY to align with icons
  const { ref: nameDragRef, position: namePosition, handleDragStart: handleNameDragStart, dragClassName: nameDragClass } = useDrag(0, 0);

  // Smooth fade-in effect on load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Track mouse position for smart interactions
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Calculate initial X offsets for the 7 icons - better spacing
  const initialIconPositions = LINKS.map((_, index) => {
    const centerIndex = (LINKS.length - 1) / 2;
    const offsetFromCenter = index - centerIndex;
    // Improved spacing: 65px for desktop, slightly tighter on mobile
    const spacing = 65; 
    const initialX = offsetFromCenter * spacing;
    // Position icons just under the name (small positive Y offset)
    const initialY = 20; 
    return { initialX, initialY };
  });

  const currentTheme = THEMES[theme];
  const oppositeTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden transition-colors duration-500"
      style={{ 
        backgroundColor: currentTheme.bg, 
        color: currentTheme.text,
        fontFamily: "'Syne', sans-serif",
      }}
    >
      <style>{`
        /* Global Styles & Animations */
        * {
          font-family: 'Syne', sans-serif;
        }
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .ambient-gradient {
          background: radial-gradient(circle at 10% 20%, ${currentTheme.ambientStart}, rgba(0, 0, 0, 0), ${currentTheme.ambientEnd});
          animation: gradientShift 40s ease infinite alternate;
          filter: blur(80px);
        }
        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .ease-out-expo {
            transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s forwards;
        }
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 0 0 ${ACCENT_COLOR}00; }
            50% { box-shadow: 0 0 0 8px ${ACCENT_COLOR}15; }
        }
        .pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        /* Subtle glowing animation for the name */
        @keyframes nameGlow {
          0% { text-shadow: 0 4px 18px rgba(139,92,246,0.07); }
          50% { text-shadow: 0 8px 28px rgba(139,92,246,0.10); }
          100% { text-shadow: 0 4px 18px rgba(139,92,246,0.07); }
        }
        .glow-name {
          animation: nameGlow 3.5s linear infinite;
        }
      `}</style>

      {/* Ambient Background Motion */}
      <div 
        className="ambient-gradient absolute inset-0 opacity-30 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 10% 20%, ${currentTheme.ambientStart}, transparent 50%, ${currentTheme.ambientEnd})`
        }}
      />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 left-6 p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-md"
        style={{ 
          color: currentTheme.text, 
          zIndex: 50,
          borderColor: currentTheme.text + '30',
          backgroundColor: currentTheme.iconBg,
        }}
        aria-label={`Switch to ${oppositeTheme} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 transition-transform duration-500 hover:rotate-90" strokeWidth={2} />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-500 hover:-rotate-90" strokeWidth={2} />
        )}
      </button>

      {/* Main Content: Centered container */}
      <main className="absolute inset-0 flex flex-col items-center justify-center">
        
        {/* Name: Draggable with smooth interactions */}
        <div
          ref={nameDragRef}
          onMouseDown={handleNameDragStart}
          onTouchStart={handleNameDragStart}
          className={`${nameDragClass} transition-opacity duration-1000 ease-out-expo group`}
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: `translate3d(${namePosition.x}px, ${namePosition.y}px, 0) ${parallaxStyle.transform || ''}`,
            cursor: 'grab',
            willChange: 'transform',
            marginBottom: '6px',
          }}
        >
          <h1
            className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter cursor-default select-none uppercase transition-all duration-300 glow-name"
            style={{ 
              textShadow: theme === 'dark' 
                ? `0 2px 8px rgba(0, 0, 0, 0.3)`
                : `0 2px 8px rgba(0, 0, 0, 0.1)`,
              color: currentTheme.text,
              letterSpacing: '0.02em',
              margin: '0',
              whiteSpace: 'nowrap',
            }}
          >
            Bushra
          </h1>
          {/* subtitle removed as requested */}
        </div>

        {/* Social Icons: Positioned right under the name (flow layout) */}
        <div className="w-full px-6 sm:px-0">
          <div className="grid grid-cols-4 gap-4 sm:flex sm:items-center sm:justify-center mt-6 pointer-events-auto">
            {LINKS.map((link, index) => (
              <DraggableMagneticLink
                key={link.label}
                icon={link.icon}
                href={link.href}
                label={link.label}
                // In flow/grid layout we don't want preset offsets that scatter icons on small screens
                initialX={0}
                initialY={0}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer removed for minimal layout */}
    </div>
  );
};

export default App;
