"use client";

export function EasyGuide({ guide }: { guide: { title: string; action: string; text: string; steps: string[] } }) {
  return (
    <details className="easy-guide" open>
      <summary>Meelopen · {guide.title}</summary>
      <p>{guide.text}</p>
      {guide.action ? <p><strong>{guide.action}</strong></p> : null}
      <ol>
        {guide.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
    </details>
  );
}
