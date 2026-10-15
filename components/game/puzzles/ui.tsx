"use client";

import { useRef } from "react";

export function Seal() {
  return <div className="seal mono">LAAG HERSTELD</div>;
}

export function Keys({
  keys,
  onKey,
  disabled,
}: {
  keys: string[];
  onKey: (key: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid-3">
      {keys.map((key) => (
        <button key={key} className="key mono" disabled={disabled} onClick={() => onKey(key)} type="button">
          {key === "⌫" ? "wissen" : key}
        </button>
      ))}
    </div>
  );
}

export function HoldButton({ label, disabled, onHold }: { label: string; disabled?: boolean; onHold: () => void }) {
  const timer = useRef(0);
  function start(event: React.PointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    const button = event.currentTarget;
    const bar = button.querySelector("i");
    const began = performance.now();
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const ratio = Math.min(1, (performance.now() - began) / 900);
      if (bar) bar.style.width = `${ratio * 100}%`;
      if (ratio >= 1) {
        window.clearInterval(timer.current);
        onHold();
      }
    }, 30);
  }
  function stop(event: React.PointerEvent<HTMLButtonElement>) {
    window.clearInterval(timer.current);
    const bar = event.currentTarget.querySelector("i");
    if (bar) bar.style.width = "0";
  }
  return (
    <button className="btn btn-mint hold" type="button" disabled={disabled} onPointerDown={start} onPointerUp={stop} onPointerLeave={stop}>
      <i />
      {label}
    </button>
  );
}

export function Shape({ name }: { name: string }) {
  return <span className={`shape ${name}`} aria-hidden />;
}
