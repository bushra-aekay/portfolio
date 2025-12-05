import { useRef } from "react";
import useDrag from "../hooks/useDrag";

export default function NameDraggable({ name }) {
  const ref = useRef(null);
  const { handleMouseMove, handleMouseLeave } = useDrag(ref, 50);

  return (
    <h1
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide 
                 cursor-pointer drop-shadow-lg"
    >
      {name}
    </h1>
  );
}
