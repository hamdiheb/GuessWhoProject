import { useEffect, useRef, useState } from "react";

const MAX_OFFSET = 4;

function useTrackedPupil(containerRef, focused) {
  const [pupil, setPupil] = useState({ x: 0, y: focused ? 1.5 : 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    function handleMove(clientX, clientY) {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(MAX_OFFSET, (dist / 60) * MAX_OFFSET);
        const nx = (dx / dist) * reach;
        const ny = (dy / dist) * reach;
        setPupil({
          x: nx,
          y: focused ? ny * 0.5 + 1.5 : ny,
        });
      });
    }

    function onMouseMove(e) {
      handleMove(e.clientX, e.clientY);
    }
    function onTouchMove(e) {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  return pupil;
}

function Eyes({ pupil, spacing = 16 }) {
  return (
    <>
      {[-1, 1].map((side) => (
        <g key={side} className="mascot-eye">
          <ellipse
            cx={60 + side * spacing}
            cy={58}
            rx={11}
            ry={13}
            fill="#fff"
            stroke="rgba(43,34,36,0.12)"
          />
          <circle
            cx={60 + side * spacing + pupil.x}
            cy={58 + pupil.y}
            r={5}
            fill="#2b2224"
          />
          <circle
            cx={60 + side * spacing + pupil.x - 1.5}
            cy={58 + pupil.y - 1.5}
            r={1.4}
            fill="#fff"
          />
        </g>
      ))}
    </>
  );
}

function Cheeks() {
  return (
    <>
      <ellipse cx={30} cy={78} rx={7} ry={5} fill="var(--color-accent)" opacity="0.35" />
      <ellipse cx={90} cy={78} rx={7} ry={5} fill="var(--color-accent)" opacity="0.35" />
    </>
  );
}

const ANIMALS = {
  owl: {
    body: "#caa06b",
    ear: "#a97e4c",
    render: (pupil) => (
      <>
        <path d="M30 40 L20 16 L44 32 Z" fill="#a97e4c" />
        <path d="M90 40 L100 16 L76 32 Z" fill="#a97e4c" />
        <circle cx={60} cy={68} r={42} fill="#caa06b" />
        <Cheeks />
        <Eyes pupil={pupil} spacing={17} />
        <path d="M55 70 L65 70 L60 80 Z" fill="#e08a3e" />
      </>
    ),
  },
  cat: {
    body: "#b9b3c2",
    ear: "#9089a0",
    render: (pupil) => (
      <>
        <path d="M26 34 L18 8 L46 28 Z" fill="#9089a0" />
        <path d="M94 34 L102 8 L74 28 Z" fill="#9089a0" />
        <path d="M30 30 L24 14 L42 26 Z" fill="#e9b8c0" />
        <path d="M90 30 L96 14 L78 26 Z" fill="#e9b8c0" />
        <circle cx={60} cy={68} r={42} fill="#b9b3c2" />
        <Cheeks />
        <Eyes pupil={pupil} spacing={16} />
        <path d="M56 74 Q60 78 64 74" stroke="#5c5468" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M40 76 L20 72 M40 80 L18 82" stroke="#5c5468" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M80 76 L100 72 M80 80 L102 82" stroke="#5c5468" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  fox: {
    body: "#e0895a",
    ear: "#c96b3e",
    render: (pupil) => (
      <>
        <path d="M24 38 L14 8 L44 30 Z" fill="#c96b3e" />
        <path d="M96 38 L106 8 L76 30 Z" fill="#c96b3e" />
        <path d="M28 32 L22 16 L40 28 Z" fill="#fbeee6" />
        <path d="M92 32 L98 16 L80 28 Z" fill="#fbeee6" />
        <circle cx={60} cy={68} r={42} fill="#e0895a" />
        <path d="M60 60 Q45 95 60 100 Q75 95 60 60 Z" fill="#fbeee6" />
        <Cheeks />
        <Eyes pupil={pupil} spacing={17} />
        <path d="M56 82 L64 82 L60 88 Z" fill="#5c3a24" />
      </>
    ),
  },
  bear: {
    body: "#c69c73",
    ear: "#a97e52",
    render: (pupil) => (
      <>
        <circle cx={26} cy={26} r={13} fill="#a97e52" />
        <circle cx={94} cy={26} r={13} fill="#a97e52" />
        <circle cx={60} cy={68} r={42} fill="#c69c73" />
        <ellipse cx={60} cy={86} rx={20} ry={15} fill="#e8d3ba" />
        <Cheeks />
        <Eyes pupil={pupil} spacing={17} />
        <ellipse cx={60} cy={80} rx={5} ry={4} fill="#5c4630" />
      </>
    ),
  },
  bunny: {
    body: "#e7c9d1",
    ear: "#d9a3b1",
    render: (pupil) => (
      <>
        <ellipse cx={40} cy={14} rx={10} ry={26} fill="#e7c9d1" transform="rotate(-12 40 14)" />
        <ellipse cx={80} cy={14} rx={10} ry={26} fill="#e7c9d1" transform="rotate(12 80 14)" />
        <ellipse cx={40} cy={16} rx={5} ry={18} fill="#f3dde3" transform="rotate(-12 40 16)" />
        <ellipse cx={80} cy={16} rx={5} ry={18} fill="#f3dde3" transform="rotate(12 80 16)" />
        <circle cx={60} cy={68} r={42} fill="#e7c9d1" />
        <Cheeks />
        <Eyes pupil={pupil} spacing={16} />
        <path d="M57 78 Q60 82 63 78" stroke="#a45e6d" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },
};

const ANIMAL_KEYS = Object.keys(ANIMALS);

function pickAnimal(seed) {
  const hash = String(seed ?? "guest")
    .split("")
    .reduce((h, c) => h * 31 + c.charCodeAt(0), 7);
  return ANIMAL_KEYS[Math.abs(hash) % ANIMAL_KEYS.length];
}

function Mascot({ userId, focused = false, size = 88 }) {
  const containerRef = useRef(null);
  const pupil = useTrackedPupil(containerRef, focused);
  const animal = ANIMALS[pickAnimal(userId)];

  return (
    <div ref={containerRef} className="inline-block" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className={`transition-transform duration-200 ease-spring ${focused ? "mascot-alert" : ""}`}
      >
        {animal.render(pupil)}
      </svg>
    </div>
  );
}

export default Mascot;
