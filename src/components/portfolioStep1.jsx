import React, { useEffect, useState } from "react";

/**
 * Portfolio - Step 2
 * - Centered floating window (modal-like) with medium blur overlay
 * - Card grid (desktop icons)
 * - Hover preview (simple) and click-to-open full window
 * - ESC + click-outside to close
 *
 * NOTE: This is a single-file, runnable scaffold you can drop into a React + Tailwind app.
 * Later we'll split into smaller files following the agreed folder structure.
 */

const mockData = {
  tech: {
    projects: [
      { id: "pm1", name: "ToneMatch - AI Marketing Tool" },
      { id: "pm2", name: "StudentConnect - Cloud Social Media" },
    ],
    courses: [
      { id: "c1", name: "AI Engineering Course", platform: "Coursera", status: "Completed" },
    ],
  },
  design: {
    projects: [{ id: "d1", name: "Redesign App X" }],
    courses: [],
  },
};

const CARDS = [
  { id: "about", label: "About Bushra", icon: "👤" },
  { id: "tech", label: "Tech", icon: "</>" },
  { id: "design", label: "Design", icon: "✒️" },
  { id: "psych", label: "Psychology", icon: "🔍" },
  { id: "ent", label: "Entrepreneurship", icon: "📎" },
  { id: "content", label: "Content & Socials", icon: "✏️" },
  { id: "contact", label: "Contact", icon: "🔗" },
];

export default function PortfolioStep2() {
  const [openPanel, setOpenPanel] = useState(null); // id of opened card
  const [previewPanel, setPreviewPanel] = useState(null); // hovered preview

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpenPanel(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-100 antialiased">
      {/* Header */}
      <header className="py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold">B</div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-widest">Hey I’m</h2>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-2 tracking-wider">BUSHRA</h1>
          <p className="text-sm text-gray-400">Designer • Developer • Curious mind</p>
        </div>
      </header>

      {/* Desktop card grid */}
      <main className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {CARDS.map((c) => (
            <Card
              key={c.id}
              card={c}
              onHover={() => setPreviewPanel(c.id)}
              onLeave={() => setPreviewPanel((p) => (p === c.id ? null : p))}
              onClick={() => setOpenPanel(c.id)}
            />
          ))}
        </div>
      </main>

      {/* Area where the floating window appears (centered) */}
      {/* Overlay + Window */}
      { (openPanel || previewPanel) && (
        <WindowOverlay
          isOpen={!!openPanel}
          onClickOutside={() => setOpenPanel(null)}
          blurStrength="medium"
        >
          <WindowContainer
            isPreview={!!previewPanel && !openPanel}
            isOpen={!!openPanel}
            onClose={() => setOpenPanel(null)}
            panelId={openPanel || previewPanel}
            content={getPanelContent(openPanel || previewPanel)}
          />
        </WindowOverlay>
      )}

      <footer className="mt-20 text-center text-xs text-gray-600 pb-12">
        © {new Date().getFullYear()} BUSHRA — portfolio in progress
      </footer>
    </div>
  );
}

/* -------------------- Components -------------------- */
/* -------------------- Card (small change: stopPropagation on click) -------------------- */
function Card({ card, onHover, onLeave, onClick }) {
  return (
    <button
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      onClick={(e) => {
        e.stopPropagation(); // prevent any bubbling that might trigger overlay
        onClick();
      }}
      className="relative bg-[#111111] rounded-xl p-5 flex flex-col justify-between items-start shadow-lg hover:scale-[1.02] transition-transform focus:outline-none focus:ring-4 focus:ring-[#6b21a8]/30"
      aria-label={card.label}
    >
      <span className="absolute top-3 right-3 bg-[#111827] rounded-full w-7 h-7 flex items-center justify-center text-sm border border-gray-800">
        <span className="text-[#f59e0b]">+</span>
      </span>

      <div className="text-4xl mb-4">{card.icon}</div>

      <div className="mt-auto">
        <div className="text-lg font-semibold text-[#c4b5fd]">{card.label}</div>
      </div>
    </button>
  );
}

/* -------------------- WindowOverlay (key fix: pointer-events depending on isOpen) -------------------- */
function WindowOverlay({ children, isOpen, onClickOutside, blurStrength = "medium" }) {
  // medium blur -> backdrop-blur-md
  const blurClass =
    blurStrength === "soft" ? "backdrop-blur-sm" : blurStrength === "strong" ? "backdrop-blur-2xl" : "backdrop-blur-md";

  // When previewing only (isOpen === false) we don't want the overlay to capture pointer events.
  // but we still render the preview visually.
  const overlayPointerClass = isOpen ? "pointer-events-auto" : "pointer-events-none";
  const backdropOpacity = isOpen ? "opacity-100" : "opacity-60";

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${blurClass} ${overlayPointerClass}`}>
      {/* semi-transparent layer - only clickable when panel is truly open */}
      <div
        // only accept clicks when isOpen === true
        className={`absolute inset-0 bg-black/55 ${backdropOpacity} transition-opacity ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        onClick={() => {
          if (isOpen && onClickOutside) onClickOutside();
        }}
        aria-hidden
      />

      {/* wrapper: center the content. If we're only previewing, make the wrapper non-interactive so cards remain interactive */}
      <div className={`relative z-50 w-full max-w-4xl px-4 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        {children}
      </div>
    </div>
  );
}

/* -------------------- WindowContainer (preview should be non-interactive) -------------------- */
function WindowContainer({ isOpen, isPreview, onClose, panelId, content }) {
  // isPreview -> smaller, subtle preview; isOpen -> full window
  const base = "bg-[#0f1720]/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-800 overflow-hidden";
  const previewStyles = "transform scale-95 opacity-80";
  const openStyles = "transform scale-100 opacity-100";

  // When previewing we don't want internal interactions (pointer-events-none) so the underlying cards keep hover/click.
  const interactiveClass = isOpen ? "pointer-events-auto" : "pointer-events-none";

  useEffect(() => {
    // nothing special here for now
  }, [isOpen]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`mx-auto transition-all duration-300 ${base} ${isPreview && !isOpen ? previewStyles : openStyles} ${interactiveClass}`}
      style={{ maxHeight: "80vh" }}
    >
      {/* Window header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="ml-3 text-sm text-gray-300 font-medium">{panelId ? capitalize(panelId) : "Window"}</div>
        </div>

        <div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-sm text-gray-300 hover:bg-white/5"
            aria-label="Close window"
          >
            ⨉
          </button>
        </div>
      </div>

      {/* Window body */}
      <div className="p-6 bg-[#071018]">{content}</div>
    </div>
  );
}

/* -------------------- Window content helpers -------------------- */

function getPanelContent(id) {
  if (!id) return <EmptyPanel />;
  if (id === "tech") return <TechPanel />;
  if (id === "design") return <SimplePanel title="Design" data={mockData.design} />;
  if (id === "about") return <SimplePanel title="About Bushra" data={{}} />;
  return <SimplePanel title={capitalize(id)} data={{}} />;
}

function EmptyPanel() {
  return <div className="text-gray-400">Hover a card to preview or click to open.</div>;
}

function SimplePanel({ title }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-sm text-gray-400">Content coming soon.</p>
    </div>
  );
}

function TechPanel() {
  const [tab, setTab] = useState("projects");
  const data = mockData.tech;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-gray-800 pb-3 mb-4">
        <Tab label="Projects" active={tab === "projects"} onClick={() => setTab("projects")} />
        <Tab label="Courses" active={tab === "courses"} onClick={() => setTab("courses")} />
      </div>

      {tab === "projects" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.projects.map((p) => (
            <div key={p.id} className="p-4 bg-[#0b1720] rounded-lg border border-gray-800">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-400 mt-2">Click to open folder view (next step)</div>
            </div>
          ))}
        </div>
      )}

      {tab === "courses" && (
        <div>
          {data.courses.map((c) => (
            <div key={c.id} className="p-3 bg-[#0b1720] rounded-lg border border-gray-800 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.platform} • {c.status}</div>
                </div>
                <div className="text-sm text-green-300">{c.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-md text-sm ${active ? "bg-white/5 text-white" : "text-gray-400"}`}>
      {label}
    </button>
  );
}

/* -------------------- Helpers -------------------- */

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
