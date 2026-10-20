"use client";

import { useEffect, useRef } from "react";
import { playIncoming } from "./audio";

export function MissionSting({
  title,
  subtitle,
  audio,
  onDone,
}: {
  title: string;
  subtitle: string;
  audio: boolean;
  onDone: () => void;
}) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (audio) playIncoming();
    const timer = window.setTimeout(() => done.current(), 2400);
    return () => window.clearTimeout(timer);
  }, [audio, title]);
  return (
    <button className="sting" type="button" onClick={onDone}>
      <p className="kicker">Volgende missie</p>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </button>
  );
}
