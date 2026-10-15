import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire("C:/Users/rogie/AppData/Local/Temp/mara-tts/package.json");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ffmpeg = "C:/Users/rogie/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe";
const ffprobe = ffmpeg.replace("ffmpeg.exe", "ffprobe.exe");
const work = path.join(root, "scripts", ".intro");
const lines = [
  "Goedemorgen en welkom bij Nexora Technologies.",
  "Mijn naam is Mara de Vries en ik ben operationeel manager.",
  "Fijn dat jullie zo snel beschikbaar waren.",
  "Ik zal meteen ter zake komen.",
  "Gisteren ontvingen wij een verontrustend bericht van een externe partij. Zij beschikten over informatie waarvan wij dachten dat deze uitsluitend binnen onze organisatie bekend was.",
  "Hoe die informatie daar terecht is gekomen, weten we niet.",
  "Misschien is er ergens iets onbedoeld gedeeld. Misschien is er meer aan de hand.",
  "Daarom hebben wij jullie ingeschakeld.",
  "Jullie krijgen toegang tot onze interne werkomgeving. Hier vinden jullie onze e-mails, documenten, agenda's, medewerkersinformatie en leveranciersgegevens.",
  "Ik wil dat jullie onderzoeken wat er precies is gebeurd.",
  "Bekijk de informatie, leg verbanden en controleer alles wat jullie verdacht vinden.",
  "Verzamel bewijsmateriaal en trek niet te snel conclusies.",
  "En nog iets: ga zorgvuldig om met onverwachte berichten of bestanden. We weten op dit moment niet of onze omgeving volledig veilig is.",
  "Ik reken op jullie.",
  "Succes.",
];

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let error = "";
    child.stderr.on("data", (chunk) => { error += chunk; });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(error.slice(-1200) || `${bin} exited ${code}`))));
  });
}

function probe(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.on("close", (code) => (code === 0 ? resolve(Number(out)) : reject(new Error(out))));
  });
}

const tts = new MsEdgeTTS();
await tts.setMetadata("nl-NL-FennaNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {});
await mkdir(work, { recursive: true });
const parts = [];
for (let i = 0; i < lines.length; i += 1) {
  const saved = await tts.toFile(work, lines[i], { rate: "+8%" });
  const named = path.join(work, `line-${i}.mp3`);
  await run(ffmpeg, ["-y", "-i", saved.audioFilePath, "-c", "copy", named]);
  parts.push(named);
}
tts.close();
const silence = path.join(work, "gap.mp3");
await run(ffmpeg, ["-y", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "0.22", "-c:a", "libmp3lame", "-q:a", "6", silence]);

const inputs = [];
for (let i = 0; i < parts.length; i += 1) {
  inputs.push(parts[i]);
  if (i < parts.length - 1) inputs.push(silence);
}
const audio = path.join(work, "briefing.mp3");
const list = inputs.map((file) => `file '${file.replaceAll("\\", "/")}'`).join("\n");
await writeFile(path.join(work, "list.txt"), list);
await run(ffmpeg, ["-y", "-f", "concat", "-safe", "0", "-i", path.join(work, "list.txt"), "-c", "copy", audio]);

let cursor = 0;
const cues = [];
for (let i = 0; i < parts.length; i += 1) {
  cues.push({ t: Number(cursor.toFixed(2)), text: lines[i] });
  cursor += await probe(parts[i]);
  if (i < parts.length - 1) cursor += await probe(silence);
}
const duration = await probe(audio);
await writeFile(path.join(root, "public", "mara-intro.json"), JSON.stringify({ duration, cues }, null, 2));

const portrait = path.join(root, "public", "mara-briefing.jpg");
const video = path.join(root, "public", "mara-intro.mp4");
await run(ffmpeg, [
  "-y", "-loop", "1", "-i", portrait, "-i", audio,
  "-vf", "scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,zoompan=z='min(1+0.00028*on,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=25,fade=t=in:st=0:d=0.5",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
  "-shortest", "-movflags", "+faststart", video,
]);
console.log(`intro ${duration.toFixed(1)}s -> ${video}`);
