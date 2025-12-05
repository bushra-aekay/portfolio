import { useEffect, useState, useCallback } from 'react';


export const useParallaxEffect = (maxTilt = 8) => {
const [transformStyle, setTransformStyle] = useState({});


const handleMouseMove = useCallback((e) => {
const { innerWidth: w, innerHeight: h } = window;
const { clientX, clientY } = e;


const xPos = (clientX - w / 2) / (w / 2);
const yPos = (clientY - h / 2) / (h / 2);


setTransformStyle({
transform: `translate(${-xPos * 4}px, ${-yPos * 4}px)`
});
}, []);


useEffect(() => {
document.addEventListener('mousemove', handleMouseMove);
return () => document.removeEventListener('mousemove', handleMouseMove);
}, [handleMouseMove]);


return transformStyle;
};