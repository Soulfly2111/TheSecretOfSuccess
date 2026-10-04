import { assetImage } from '../presentation/assets';
import { Movement } from '../core/movement';
export const ActOneCast = (() => {
  const sheets = {},
    names = ['uncle', 'walter'];
  for (const id of names) {
    const image = assetImage(),
      frames = [];
    sheets[id] = { image, frames };
    image.onload = () => {
      const c = document.createElement('canvas');
      c.width = image.width;
      c.height = image.height;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(image, 0, 0);
      const pixels = g.getImageData(0, 0, c.width, c.height).data;
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 7; col++) {
          const l = Math.round((col * c.width) / 7),
            r = Math.round(((col + 1) * c.width) / 7),
            top = Math.round((row * c.height) / 4),
            bottom = Math.round(((row + 1) * c.height) / 4);
          let x = r,
            y = bottom,
            xx = l,
            yy = top;
          for (let j = top; j < bottom; j++)
            for (let i = l; i < r; i++)
              if (pixels[(j * c.width + i) * 4 + 3] > 110) {
                x = Math.min(x, i);
                xx = Math.max(xx, i);
                y = Math.min(y, j);
                yy = Math.max(yy, j);
              }
          let footL = r,
            footR = l;
          for (let j = Math.round(y + (yy - y) * 0.7); j <= yy; j++)
            for (let i = x; i <= xx; i++)
              if (pixels[(j * c.width + i) * 4 + 3] > 110) {
                footL = Math.min(footL, i);
                footR = Math.max(footR, i);
              }
          frames.push({
            x,
            y,
            w: xx - x + 1,
            h: yy - y + 1,
            anchor: (footL + footR) / 2 - x,
            cellX: l,
            cellY: top,
          });
        }
      // Align each pose to its torso, not to the changing span of its walking feet.
      for (const f of frames) {
        let left = c.width,
          right = 0;
        for (let j = Math.round(f.y + f.h * 0.35); j <= Math.round(f.y + f.h * 0.55); j++)
          for (let i = f.x; i < f.x + f.w; i++)
            if (pixels[(j * c.width + i) * 4 + 3] > 110) {
              left = Math.min(left, i);
              right = Math.max(right, i);
            }
        f.anchor = (left + right) / 2 - f.x;
      }
    };
    image.src = 'assets/act1-' + id + '-animation-v1.png';
  }
  const talking = { image: assetImage(), frames: [], loaded: false, error: false };
  talking.image.onload = () => {
    talking.loaded = true;
  };
  talking.image.onerror = () => {
    talking.error = true;
  };
  talking.image.src = 'assets/act1-uncle-talk-v2.png';
  fetch(new URL('assets/act1-uncle-talk-v2.json', document.baseURI))
    .then((r) => {
      if (!r.ok) throw Error('Talk atlas unavailable');
      return r.json();
    })
    .then((data) => {
      if (data.frames.length !== 48) throw Error('Invalid talk atlas');
      talking.frames = data.frames;
    })
    .catch(() => {
      talking.error = true;
    });
  // Two phrases share mouth shapes but use gestures at different intervals.
  const phraseA = [0, 1, 2, 3, 1, 4, 0, 2, 3, 5, 6, 7, 8, 9, 10, 11];
  const phraseB = [0, 2, 1, 3, 4, 1, 0, 9, 2, 3, 1, 10, 11];
  const durations = [180, 110, 100, 130, 90, 120, 150, 180, 120, 130, 150, 180];
  const timeline = [...phraseA, ...phraseB],
    cycle = timeline.reduce((sum, f) => sum + durations[f], 0);
  const actors = {};
  let speaker = null,
    elapsed = 0,
    pause = 600,
    speechTime = 0;
  function talkFrame() {
    let time = speechTime % cycle;
    for (const frame of timeline) {
      if (time < durations[frame]) return frame;
      time -= durations[frame];
    }
    return 0;
  }
  function init() {
    actors.walter = Movement.create('lobby');
    Object.assign(actors.walter, { x: 689, y: 445, direction: 'left' });
    actors.uncle = null;
    speaker = null;
    pause = 600;
    speechTime = 0;
  }
  function update(dt, state, holdWalter) {
    elapsed += dt;
    if (speaker === 'uncle') speechTime += dt;
    const a = actors.walter;
    if (!a || state.room !== 'lobby') return;
    if (holdWalter || speaker === 'walter' || state.flags.cardReturned) {
      Movement.cancel(a);
      a.direction = 'left';
      return;
    }
    if (a.moving) {
      Movement.tick(a, dt, 'lobby');
      if (!a.moving) pause = 1300;
    } else if ((pause -= dt) <= 0) Movement.move(a, 'lobby', { x: a.x < 685 ? 716 : 660, y: 445 });
  }
  function draw(ctx, id, a, t, state) {
    const sheet = sheets[id],
      row = { right: 0, left: 1, down: 2, up: 3 }[a.direction] || 0;
    if (id === 'uncle' && !a.moving && talking.loaded && talking.frames.length === 48) {
      const tile = talking.frames[row * 12 + (speaker === 'uncle' ? talkFrame() : 0)];
      // Use one reference scale per direction. A nod changes the crop, not body size.
      const neutral = sheet.frames[row * 7],
        reference = talking.frames[row * 12];
      const height =
          (Math.round((72 * Movement.scale('lobby', a.y) * 2) / 3) * neutral.h) /
          Math.max(...sheet.frames.map((f) => f.h)),
        scale = height / reference.h;
      const footX = Math.round((a.x * 2) / 3),
        footY = Math.round((a.y * 2) / 3);
      ctx.drawImage(
        talking.image,
        tile.x,
        tile.y,
        tile.w,
        tile.h,
        footX - tile.anchorX * scale,
        footY - tile.anchorY * scale,
        tile.w * scale,
        tile.h * scale,
      );
      return;
    }
    let frame = a.moving
      ? [1, 0, 2, 0][Math.floor((a.distance || 0) / 14) % 4]
      : speaker === id
        ? 4 + (Math.floor(t / 210) % 2)
        : Math.floor(t / 150) % 25 === 0
          ? 3
          : id === 'walter' && !state.flags.cardReturned && Math.floor(t / 700) % 4 < 2
            ? 6
            : 0;
    const tile = sheet.frames[row * 7 + frame];
    if (!tile) return;
    const h = Math.round((72 * Movement.scale('lobby', a.y) * 2) / 3),
      scale = h / Math.max(...sheet.frames.map((f) => f.h));
    ctx.drawImage(
      sheet.image,
      tile.x,
      tile.y,
      tile.w,
      tile.h,
      Math.round((a.x * 2) / 3 - tile.anchor * scale),
      Math.round((a.y * 2) / 3 - tile.h * scale),
      Math.round(tile.w * scale),
      Math.round(tile.h * scale),
    );
  }
  return {
    actors,
    init,
    update,
    draw,
    get speaker() {
      return speaker;
    },
    setSpeaker: (id) => {
      if (id !== speaker) speechTime = 0;
      speaker = id;
    },
    get speechFrame() {
      return speaker === 'uncle' ? talkFrame() : 0;
    },
    get speechTime() {
      return speechTime;
    },
    get talkReady() {
      return talking.loaded && talking.frames.length === 48;
    },
    get ready() {
      return (
        names.every((id) => sheets[id].frames.length === 28) &&
        (talking.error || (talking.loaded && talking.frames.length === 48))
      );
    },
  };
})();
