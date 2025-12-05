import { useRef } from "react";
import useDrag from "../hooks/useDrag";

export default function DraggableMagneticLink({ href, icon: Icon, label }) {
  const ref = useRef(null);
  const { handleMouseMove, handleMouseLeave } = useDrag(ref, 35);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col items-center justify-center p-4 rounded-2xl 
                 bg-zinc-900/40 backdrop-blur-md border border-zinc-700 
                 hover:bg-zinc-900/70 transition-all duration-300 
                 w-20 h-20 sm:w-24 sm:h-24"
    >
      <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
      <span className="text-xs mt-1 sm:text-sm">{label}</span>
    </a>
  );
}
