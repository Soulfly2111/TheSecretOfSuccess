// HTML images are still accepted by the pixel painters; network loading follows the current room.
type Entry = { image: HTMLImageElement; url: string; started: boolean };
const images: Entry[] = [];
let chapter: 'prolog' | 'act1' | null = null,
  room = 'yard';
const prolog = new Set([
  'locations-v3.png',
  'locations-states-v3.png',
  'doors-open-v5.png',
  'car-front-closed-v4.png',
  'car-front-open-v4.png',
  'mechanic-idle.png',
]);
const roomAssets: Record<string, string[]> = {
  lobby: [
    'act1-ground-floor-v2.png',
    'act1-ground-floor-open-v2.png',
    'act1-ground-wc-open-v1.png',
    'company-brochure-v1.png',
  ],
  restroom: ['act1-wc-radiator-v2.png'],
  corridor: ['act1-cleaning-room-v1.png'],
  upper: [
    'act1-first-floor-v1.png',
    'act1-first-floor-open-v1.png',
    'act1-first-floor-stairs-v2.png',
  ],
  kitchen: ['act1-office-kitchen-v1.png', 'act1-kitchen-drawer-v2.png'],
  second: [
    'act1-second-floor-v1.png',
    'act1-second-floor-open-v1.png',
    'act1-second-characters-v1.png',
  ],
  teamOffice: ['act1-team-office-v1.png', 'act1-second-characters-v1.png'],
  ems: ['act1-ems-v1.png', 'act1-second-characters-v1.png', 'act1-vince-states-v1.png'],
  lounge: ['act1-lounge-v1.png', 'act1-second-characters-v1.png'],
  delivery: ['act1-locations.png'],
};
function needed(url: string) {
  if (!chapter) return false;
  const file = url.split('/').at(-1)!;
  if (file === 'hero-detailed-v6.png') return true;
  if (chapter === 'prolog')
    return prolog.has(file) && (file !== 'mechanic-idle.png' || room === 'garage');
  if (file === 'act1-characters.png') return true;
  if (/act1-(uncle|walter)-/.test(file)) return room === 'lobby';
  return (roomAssets[room] ?? []).includes(file) || file === 'company-brochure-v1.png';
}
const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
function load(e: Entry) {
  if (e.started || !e.url || !needed(e.url)) return;
  e.started = true;
  descriptor.set!.call(e.image, new URL(e.url, document.baseURI).href);
}
export function assetImage(): HTMLImageElement {
  const image = new Image(),
    e: Entry = { image, url: '', started: false };
  images.push(e);
  Object.defineProperty(image, 'src', {
    get: () => e.url,
    set: (url: string) => {
      e.url = url;
      load(e);
    },
  });
  return image;
}
export function activateAssets(ch: 'prolog' | 'act1', current: string) {
  chapter = ch;
  room = current;
  for (const e of images) load(e);
}
