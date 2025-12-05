import React from 'react';


export default function AmbientBackground({ theme }) {
return (
<div
className="absolute inset-0 blur-[90px] opacity-40 transition-all duration-700"
style={{
background: `radial-gradient(circle at 20% 30%, ${theme.ambientStart}, ${theme.ambientEnd})`
}}
/>
);
}