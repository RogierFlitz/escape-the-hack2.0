"use client";

import { useEffect, useMemo, useState } from "react";
import { colleaguePost } from "@/lib/game/footprint";
import { Pin, type Investigation } from "../Intranet";
import { socialExtras } from "./records";

type Post = {
  id: string;
  author: string;
  role: string;
  when: string;
  title: string;
  body: string;
  photo?: string;
  audience: "Openbaar" | "Intern";
  likes: number;
  comments: { author: string; text: string }[];
};

const POSTS: Post[] = [
  {
    id: "social-prep",
    author: "Nexora Technologies",
    role: "Bedrijfspagina",
    when: socialExtras[0].when,
    title: socialExtras[0].title,
    body: socialExtras[0].body,
    photo: "/news/nexora-day.jpg",
    audience: "Openbaar",
    likes: 24,
    comments: [
      { author: "Marketing", text: "Het programma delen we later." },
      { author: "Facilitair", text: "Wij zetten de koffie klaar op kantoor." },
    ],
  },
  {
    id: "news-berg",
    author: colleaguePost.author,
    role: "Receptie · Openbaar",
    when: "9 okt",
    title: colleaguePost.title,
    body: colleaguePost.body,
    photo: "/news/mountains.jpg",
    audience: "Openbaar",
    likes: 18,
    comments: [
      { author: "L. Crowe", text: "Geniet ervan." },
      { author: "J. Vale", text: "Fijne dagen." },
    ],
  },
  {
    id: "social-standup",
    author: "Mara de Vries",
    role: "Operationeel manager",
    when: "vandaag",
    title: socialExtras[2].title,
    body: socialExtras[2].body,
    audience: "Intern",
    likes: 6,
    comments: [{ author: "J. Vale", text: "Ik ben erbij." }],
  },
  {
    id: "social-lunch",
    author: "Kantine",
    role: "Facilitair",
    when: "2 d",
    title: socialExtras[1].title,
    body: socialExtras[1].body,
    audience: "Intern",
    likes: 11,
    comments: [{ author: "M. Okonkwo", text: "Soep voor mij." }],
  },
];

const FILTERS = ["Alles", "Openbaar", "Intern"] as const;

export function SocialApp({
  investigation,
  focusId,
  onPerson,
}: {
  investigation: Investigation;
  focusId?: string | null;
  onPerson: (name: string) => void;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Alles");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(focusId && POSTS.some((post) => post.id === focusId) ? focusId : null);
  useEffect(() => {
    if (focusId && POSTS.some((post) => post.id === focusId)) setOpenId(focusId);
  }, [focusId]);
  const [zoom, setZoom] = useState<string | null>(null);
  const [liked, setLiked] = useState<string[]>([]);
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () => POSTS.filter((post) => {
      const audienceOk = filter === "Alles" || post.audience === filter;
      const text = `${post.author} ${post.title} ${post.body}`.toLowerCase();
      return audienceOk && (!needle || text.includes(needle));
    }),
    [filter, needle],
  );
  const open = POSTS.find((post) => post.id === openId) ?? null;

  return (
    <div className="os-app os-social">
      <header className="os-head">
        <div>
          <p className="os-kicker">Nexora Social</p>
          <h2>{open ? open.title : "Tijdlijn"}</h2>
          <p>Collega&apos;s, de bedrijfspagina en gewone updates. Openbaar is voor iedereen te lezen.</p>
        </div>
        <label className="os-search">
          <span className="ol-sr">Zoek berichten</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek personen of berichten..." />
        </label>
      </header>
      <div className="os-social-layout">
        <aside className="os-side">
          <button type="button" className="os-pagecard" onClick={() => setOpenId("social-prep")}>
            <img src="/news/nexora-day.jpg" alt="" />
            <strong>Nexora Technologies</strong>
            <span>Bedrijfspagina</span>
          </button>
          <div className="os-chips" role="tablist" aria-label="Zichtbaarheid">
            {FILTERS.map((item) => (
              <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "on" : ""} onClick={() => { setFilter(item); setOpenId(null); }}>{item}</button>
            ))}
          </div>
        </aside>
        <div className="os-feed">
          {open ? (
            <article className="os-post">
              <button className="os-back" type="button" onClick={() => setOpenId(null)}>← Tijdlijn</button>
              <PostBody post={open} liked={liked.includes(open.id)} onLike={() => setLiked((current) => current.includes(open.id) ? current.filter((id) => id !== open.id) : [...current, open.id])} onZoom={() => open.photo && setZoom(open.photo)} onPerson={onPerson} />
              <ul className="os-comments">
                {open.comments.map((comment) => (
                  <li key={comment.author}>
                    {knownPerson(comment.author) ? <button type="button" onClick={() => onPerson(comment.author)}>{comment.author}</button> : <strong>{comment.author}</strong>}
                    <span>{comment.text}</span>
                  </li>
                ))}
              </ul>
              {open.id === "news-berg" && <p className="nx-open">{colleaguePost.cue}</p>}
              <Pin investigation={investigation} id={open.id} label="Bewaar in dossier" savedLabel="Bewaard in dossier" />
            </article>
          ) : visible.length === 0 ? <p className="os-empty">Geen berichten.</p> : visible.map((post) => (
            <article key={post.id} className="os-post">
              <PostBody post={post} liked={liked.includes(post.id)} onLike={() => setLiked((current) => current.includes(post.id) ? current.filter((id) => id !== post.id) : [...current, post.id])} onZoom={() => post.photo && setZoom(post.photo)} onPerson={onPerson} />
              <div className="os-post-actions">
                <button type="button" onClick={() => setOpenId(post.id)}>Reacties ({post.comments.length})</button>
                <button type="button" onClick={() => setOpenId(post.id)}>Openen</button>
              </div>
            </article>
          ))}
        </div>
      </div>
      {zoom && (
        <button className="os-zoom" type="button" onClick={() => setZoom(null)}>
          <img src={zoom} alt="Vergrote foto. Klik om te sluiten." />
        </button>
      )}
    </div>
  );
}

function PostBody({
  post,
  liked,
  onLike,
  onZoom,
  onPerson,
}: {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onZoom: () => void;
  onPerson: (name: string) => void;
}) {
  return (
    <>
      <header>
        {knownPerson(post.author) ? (
          <button type="button" onClick={() => onPerson(post.author)}><b>{initials(post.author)}</b><span><strong>{post.author}</strong><small>{post.role} · {post.when}</small></span></button>
        ) : (
          <span className="os-who"><b>{initials(post.author)}</b><span><strong>{post.author}</strong><small>{post.role} · {post.when}</small></span></span>
        )}
        <em className={post.audience === "Openbaar" ? "open" : ""}>{post.audience}</em>
      </header>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
      {post.photo && <button className="os-photo" type="button" onClick={onZoom}><img src={post.photo} alt="" /></button>}
      <p className="os-meta"><button type="button" aria-pressed={liked} onClick={onLike}>{liked ? "Leuk" : "Vind ik leuk"} · {post.likes + (liked ? 1 : 0)}</button><span>Delen staat uit</span></p>
    </>
  );
}

const KNOWN = new Set(["Mara de Vries", "J. Vale", "L. Crowe", "M. Okonkwo", "S. Adler", "T. Berg", "Helix Events"]);

function knownPerson(name: string) {
  return KNOWN.has(name);
}

function initials(name: string) {
  const parts = name.split(" ").filter((part) => part !== "·");
  return (parts[0]?.[0] ?? "N") + (parts[1]?.[0] ?? "");
}
