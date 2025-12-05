import { useState, useRef, useCallback, useEffect } from 'react';


export const useDrag = (initialX = 0, initialY = 0) => {
const ref = useRef(null);
const [position, setPosition] = useState({ x: initialX, y: initialY });
const dragState = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });


const handleDragStart = useCallback((e) => {
if (e.type === 'mousedown' && e.button !== 0) return;


const clientX = e.touches ? e.touches[0].clientX : e.clientX;
const clientY = e.touches ? e.touches[0].clientY : e.clientY;


dragState.current.isDragging = true;
dragState.current.startX = clientX;
dragState.current.startY = clientY;
dragState.current.initialX = position.x;
dragState.current.initialY = position.y;


if (ref.current) ref.current.style.cursor = 'grabbing';


e.preventDefault();
}, [position.x, position.y]);


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
if (ref.current) ref.current.style.cursor = 'grab';
}, []);


useEffect(() => {
document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', handleDragEnd);
document.addEventListener('touchmove', handleDrag);
document.addEventListener('touchend', handleDragEnd);


return () => {
document.removeEventListener('mousemove', handleDrag);
document.removeEventListener('mouseup', handleDragEnd);
document.removeEventListener('touchmove', handleDrag);
document.removeEventListener('touchend', handleDragEnd);
};
}, [handleDrag, handleDragEnd]);


return {
ref,
position,
handleDragStart,
dragClassName: "absolute top-1/2 left-1/2 will-change-transform -translate-x-1/2",
};
};