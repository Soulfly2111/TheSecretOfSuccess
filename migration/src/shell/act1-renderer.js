import { assetImage } from '../presentation/assets';
import { rendererLayer } from '../presentation/phaser';
import { Movement } from '../core/movement';
import { ActOne, act1World } from '../core/chapters';
import { ActOneWorld } from '../core/world';
import { ActOneCast } from './act1-cast';
import { PixelScene } from './renderer';
('use strict');
export const ActOneScene = (() => {
  const cleaning = assetImage();
  cleaning.src = 'assets/act1-cleaning-room-v1.png';
  const upper = assetImage(),
    upperOpen = assetImage(),
    kitchen = assetImage();
  upper.src = 'assets/act1-first-floor-v1.png';
  upperOpen.src = 'assets/act1-first-floor-open-v1.png';
  kitchen.src = 'assets/act1-office-kitchen-v1.png';
  const upperStairs = assetImage();
  upperStairs.src = 'assets/act1-first-floor-stairs-v2.png';
  const second = assetImage(),
    secondOpen = assetImage(),
    teamOffice = assetImage(),
    ems = assetImage(),
    lounge = assetImage();
  second.src = 'assets/act1-second-floor-v1.png';
  secondOpen.src = 'assets/act1-second-floor-open-v1.png';
  teamOffice.src = 'assets/act1-team-office-v1.png';
  ems.src = 'assets/act1-ems-v1.png';
  lounge.src = 'assets/act1-lounge-v1.png';
  const extraPeople = assetImage(),
    extraTiles = [];
  extraPeople.src = 'assets/act1-second-characters-v1.png';
  const vinceStates = assetImage(),
    vinceTiles = [];
  vinceStates.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = vinceStates.width;
    canvas.height = vinceStates.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(vinceStates, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let frame = 0; frame < 2; frame++) {
      const start = Math.floor((frame * canvas.width) / 2),
        end = Math.floor(((frame + 1) * canvas.width) / 2);
      let left = end,
        right = start,
        top = canvas.height,
        bottom = 0;
      for (let y = 0; y < canvas.height; y++)
        for (let x = start; x < end; x++) {
          if (pixels[(y * canvas.width + x) * 4 + 3] <= 110) continue;
          left = Math.min(left, x);
          right = Math.max(right, x);
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      vinceTiles.push({ x: left, y: top, w: right - left + 1, h: bottom - top + 1 });
    }
  };
  vinceStates.src = 'assets/act1-vince-states-v1.png';
  const newBackgrounds = { second, teamOffice, ems, lounge };
  extraPeople.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = extraPeople.width;
    canvas.height = extraPeople.height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(extraPeople, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let row = 0; row < 2; row++)
      for (let column = 0; column < 2; column++) {
        const startX = Math.floor((column * canvas.width) / 2),
          endX = Math.floor(((column + 1) * canvas.width) / 2);
        const startY = Math.floor((row * canvas.height) / 2),
          endY = Math.floor(((row + 1) * canvas.height) / 2);
        let left = endX,
          right = startX,
          top = endY,
          bottom = startY;
        for (let vertical = startY; vertical < endY; vertical++)
          for (let horizontal = startX; horizontal < endX; horizontal++) {
            if (pixels[(vertical * canvas.width + horizontal) * 4 + 3] <= 110) continue;
            left = Math.min(left, horizontal);
            right = Math.max(right, horizontal);
            top = Math.min(top, vertical);
            bottom = Math.max(bottom, vertical);
          }
        extraTiles.push({ x: left, y: top, w: right - left + 1, h: bottom - top + 1 });
      }
  };
  const brochure = assetImage();
  brochure.src = 'assets/company-brochure-v1.png';
  const restroom = assetImage(),
    wcDoor = assetImage(),
    drawerOpen = assetImage();
  restroom.src = 'assets/act1-wc-radiator-v2.png';
  wcDoor.src = 'assets/act1-ground-wc-open-v1.png';
  drawerOpen.src = 'assets/act1-kitchen-drawer-v2.png';
  const panorama = assetImage(),
    opened = assetImage();
  panorama.src = 'assets/act1-ground-floor-v2.png';
  opened.src = 'assets/act1-ground-floor-open-v2.png';
  const backgrounds = assetImage(),
    people = assetImage(),
    tiles = [];
  backgrounds.src = 'assets/act1-locations.png';
  people.src = 'assets/act1-characters.png';
  people.onload = () => {
    const c = document.createElement('canvas');
    c.width = people.width;
    c.height = people.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(people, 0, 0);
    const pixels = g.getImageData(0, 0, c.width, c.height).data,
      w = c.width / 3,
      h = c.height / 3;
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++) {
        let left = Math.ceil(col * w),
          right = Math.floor((col + 1) * w) - 1,
          top = [0, 418, 833][row],
          bottom = [418, 833, 1254][row] - 1,
          x = right,
          y = bottom,
          xx = left,
          yy = top;
        for (let j = top; j <= bottom; j++)
          for (let i = left; i <= right; i++)
            if (pixels[(j * c.width + i) * 4 + 3] > 110) {
              x = Math.min(x, i);
              xx = Math.max(xx, i);
              y = Math.min(y, j);
              yy = Math.max(yy, j);
            }
        tiles.push({ x, y, w: xx - x + 1, h: yy - y + 1 });
      }
  };
  function npc(ctx, id, x, y, t, room = 'lobby') {
    const data = ActOneWorld.npcs[id],
      tile = (data[3] === 'second' ? extraTiles : tiles)[data[0]];
    if (!tile) return;
    let h = Math.round((72 * Movement.scale(room, y) * 2) / 3),
      w = Math.round((h * tile.w) / tile.h);
    ctx.drawImage(
      data[3] === 'second' ? extraPeople : people,
      tile.x,
      tile.y,
      tile.w,
      tile.h,
      Math.round((x * 2) / 3 - w / 2),
      Math.round((y * 2) / 3 - h),
      w,
      h,
    );
  }
  function vince(ctx, x, y, state, transform = 0) {
    if (!vinceStates.complete || !vinceStates.naturalWidth) return;
    const transformed = state.flags.vinceTransformed;
    const tile = vinceTiles[transformed ? 1 : 0];
    if (!tile) return;
    const pulse = transform > 0 ? Math.sin(transform / 75) * 3 : 0;
    const h = Math.round((72 * Movement.scale('ems', y) * 2) / 3);
    const w = Math.round((h * tile.w) / tile.h);
    ctx.drawImage(
      vinceStates,
      tile.x,
      tile.y,
      tile.w,
      tile.h,
      Math.round((x * 2) / 3 - w / 2 + pulse),
      Math.round((y * 2) / 3 - h),
      w,
      h,
    );
    if (transform > 0) {
      const cx = Math.round((x * 2) / 3);
      ctx.fillStyle = transform > 1300 ? '#fff3bd' : '#d7b55b';
      for (const [dx, dy] of [
        [-45, -62],
        [43, -55],
        [-38, -30],
        [35, -85],
      ])
        ctx.fillRect(cx + dx, Math.round((y * 2) / 3 + dy), 3, 3);
    }
  }
  function patchImage(ctx, image, box, width) {
    if (!image.complete || !image.naturalWidth) return;
    const [left, top, span, height] = box;
    ctx.drawImage(
      image,
      (left / width) * image.width,
      (top / 360) * image.height,
      (span / width) * image.width,
      (height / 360) * image.height,
      left,
      top,
      span,
      height,
    );
  }
  function render(ctx, s, a, t, camera = 0, liftVisual = null, photo = {}) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 640, 360);
    const tile = ActOneWorld.rooms[s.room].tile;
    ctx.save();
    if (s.room === 'lobby') {
      if (panorama.complete && panorama.naturalWidth) ctx.drawImage(panorama, 0, 0, 1280, 360);
    } else if (s.room === 'corridor') {
      if (cleaning.complete && cleaning.naturalWidth) ctx.drawImage(cleaning, 0, 0, 640, 360);
    } else if (s.room === 'restroom') {
      if (restroom.complete && restroom.naturalWidth) ctx.drawImage(restroom, 0, 0, 640, 360);
    } else if (s.room === 'upper') {
      if (upper.complete && upper.naturalWidth) ctx.drawImage(upper, 0, 0, 1280, 360);
    } else if (s.room === 'kitchen') {
      if (kitchen.complete && kitchen.naturalWidth) ctx.drawImage(kitchen, 0, 0, 640, 360);
    } else if (newBackgrounds[s.room]) {
      const backdrop = newBackgrounds[s.room];
      if (backdrop.complete && backdrop.naturalWidth)
        ctx.drawImage(backdrop, 0, 0, s.room === 'second' ? 1280 : 640, 360);
    } else if (backgrounds.complete && backgrounds.naturalWidth) {
      const cuts = [0, 714, 1368, 2048],
        col = tile % 3,
        h = backgrounds.height / 2;
      ctx.drawImage(
        backgrounds,
        cuts[col],
        Math.floor(tile / 3) * h,
        cuts[col + 1] - cuts[col],
        h,
        0,
        0,
        640,
        360,
      );
    }
    const r = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };
    if (s.room === 'restroom' && ActOne.visible(s, 'keycard')) {
      r(575, 173, 10, 4, '#233843');
      r(576, 173, 8, 2, '#e6cf91');
    }
    if (s.room === 'kitchen' && s.flags.drawerOpen) {
      patchImage(ctx, drawerOpen, [145, 176, 55, 25], 640);
      if (ActOne.visible(s, 'knife')) {
        r(165, 181, 14, 2, '#a9b9be');
        r(165, 181, 6, 1, '#f0e5d1');
        r(179, 181, 5, 2, '#58402f');
      }
    }
    if (s.room === 'lobby') {
      if (
        !s.inventory.includes('brochure') &&
        !s.flags.brochureTaken &&
        brochure.complete &&
        brochure.naturalWidth
      )
        ctx.drawImage(brochure, 0, 0, brochure.width / 3, brochure.height, 49, 215, 28, 36);
      const patch = (x, y, w, h) => {
        if (opened.complete && opened.naturalWidth)
          ctx.drawImage(
            opened,
            (x / 1280) * opened.width,
            (y / 360) * opened.height,
            (w / 1280) * opened.width,
            (h / 360) * opened.height,
            x,
            y,
            w,
            h,
          );
      };
      if (s.flags.wcOpen && wcDoor.complete && wcDoor.naturalWidth)
        ctx.drawImage(
          wcDoor,
          (829 / 1280) * wcDoor.width,
          (119 / 360) * wcDoor.height,
          (83 / 1280) * wcDoor.width,
          (133 / 360) * wcDoor.height,
          829,
          119,
          83,
          133,
        );
      if (s.flags.technicalOpen) patch(988, 119, 89, 133);
      if (s.flags.sideOpen) patch(1182, 113, 75, 170);
      r(983, 83, 101, 27, '#39271e');
      ctx.fillStyle = '#ead9ab';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('REINIGUNGS-', 1033, 94);
      ctx.fillText('RAUM', 1033, 105);
      ctx.textAlign = 'start';
    }
    if (s.room === 'upper') {
      patchImage(ctx, upperStairs, [708, 56, 138, 203], 1280);
      r(858, 143, 40, 28, '#bc9d58');
      ctx.fillStyle = '#252923';
      ctx.font = '7px monospace';
      ctx.fillText('WC: EG', 862, 154);
      ctx.fillText('↓', 875, 164);
    }
    if (s.room === 'second') {
      if (s.flags.officeOpen) patchImage(ctx, secondOpen, [12, 126, 70, 151], 1280);
      if (s.flags.emsOpen) patchImage(ctx, secondOpen, [980, 126, 81, 131], 1280);
      if (s.flags.loungeOpen) patchImage(ctx, secondOpen, [1144, 126, 85, 131], 1280);
      r(871, 128, 35, 46, '#bfa161');
      r(873, 130, 31, 42, '#222e31');
      ctx.fillStyle = '#eed59d';
      ctx.font = '5px monospace';
      ctx.fillText('WC: EG', 876, 140);
      ctx.fillText('BESPR.', 876, 152);
      ctx.fillText('1. ET.', 876, 161);
    }
    if (s.room === 'upper' && s.flags.kitchenOpen)
      patchImage(ctx, upperOpen, [12, 126, 70, 151], 1280);
    if (liftVisual?.room === s.room && upperOpen.complete && upperOpen.naturalWidth) {
      const opening = liftVisual.arrival
        ? Math.max(0, 1 - Math.max(0, liftVisual.elapsed - 500) / 600)
        : Math.min(1, liftVisual.elapsed / 700);
      const box = s.room === 'lobby' ? [505, 123, 80, 125] : [570, 135, 67, 120];
      ctx.save();
      ctx.beginPath();
      ctx.rect(box[0] + (box[2] * (1 - opening)) / 2, box[1], box[2] * opening, box[3]);
      ctx.clip();
      const cabin = s.room === 'second' ? secondOpen : upperOpen;
      if (cabin.complete && cabin.naturalWidth)
        ctx.drawImage(
          cabin,
          (570 / 1280) * cabin.width,
          (135 / 360) * cabin.height,
          (67 / 1280) * cabin.width,
          (120 / 360) * cabin.height,
          ...box,
        );
      ctx.restore();
    }
    rendererLayer('background', 0);
    const actors = [];
    if (s.room === 'lobby')
      actors.push({
        y: 403,
        draw: () => {
          r(307, 182, 32, 14, '#a7aca3');
          r(310, 180, 25, 4, '#d1ccaf');
          r(310, 190, 24, 4, '#222e37');
          r(333, 185, 3, 2, '#74db9a');
          if (photo.job?.kind === 'print') {
            const h = 2 + Math.floor(photo.job.elapsed / 160);
            r(316, 193, 15, Math.min(11, h), '#d8bb73');
            r(319, 194, 5, 3, '#376478');
          }
        },
      });
    if (s.room === 'upper')
      actors.push({
        y: 378,
        draw: () => {
          r(374, 174, 46, 25, '#1a212a');
          r(377, 177, 40, 19, s.flags.photoSent ? '#234d3c' : '#29455c');
          r(394, 199, 5, 5, '#252e34');
          r(386, 204, 21, 2, '#747b77');
          ctx.fillStyle = '#c6d9b6';
          ctx.font = '5px monospace';
          ctx.fillText('GRAFIK', 380, 184);
          ctx.fillText(
            photo.job?.kind === 'upload'
              ? photo.job.files?.[
                  Math.min(
                    photo.job.files.length - 1,
                    Math.floor((photo.job.elapsed / photo.job.duration) * photo.job.files.length),
                  )
                ] || 'UPLOAD'
              : s.flags.photoSent
                ? 'GESENDET'
                : s.flags.selfieUploaded || s.flags.marbleUploaded
                  ? 'FOTO 1/2'
                  : 'FOTOS 0/2',
            380,
            192,
          );
        },
      });
    if (s.room === 'lounge' && ActOne.visible(s, 'wheyPowder'))
      actors.push({
        y: 299,
        draw: () => {
          r(206, 126, 16, 20, '#705737');
          r(207, 127, 14, 18, '#d7bb69');
          r(207, 124, 14, 4, '#f1e3b0');
          r(209, 128, 2, 15, '#f5dca0');
          r(210, 132, 10, 9, '#63394d');
          r(212, 134, 6, 1, '#f1e3b0');
          r(212, 137, 5, 1, '#f1e3b0');
        },
      });
    if (s.room === 'ems') {
      actors.push({
        y: 289,
        draw: () => {
          if (s.flags.lockerOpen) {
            // Left compartment of the existing metal locker, in background coordinates.
            r(410, 84, 25, 101, '#242e31');
            r(412, 86, 21, 97, '#384447');
            r(413, 132, 20, 3, '#9da7a1');
            r(413, 170, 20, 3, '#9da7a1');
            r(411, 85, 2, 99, '#151d22');
            ctx.fillStyle = '#758080';
            ctx.beginPath();
            ctx.moveTo(409, 84);
            ctx.lineTo(398, 91);
            ctx.lineTo(398, 192);
            ctx.lineTo(409, 185);
            ctx.closePath();
            ctx.fill();
            r(399, 100, 6, 1, '#404d50');
            r(399, 103, 6, 1, '#404d50');
            r(400, 137, 2, 10, '#c3c8bb');
            if (ActOne.visible(s, 'creatineCapsules')) {
              r(417, 116, 12, 16, '#1c343d');
              r(418, 118, 10, 13, '#dde7d5');
              r(417, 114, 12, 4, '#477688');
              r(419, 121, 8, 6, '#397087');
              r(420, 122, 5, 1, '#f1eac8');
              r(420, 125, 4, 1, '#f1eac8');
              r(418, 118, 2, 12, '#ffffff');
            }
          }
        },
      });
      actors.push({
        y: 372,
        draw: () => {
          // Shaker rests on the right-hand tabletop.
          r(584, 191, 17, 3, '#332d29');
          r(586, 176, 13, 16, '#263d48');
          r(588, 178, 9, 12, s.flags.shakeMixed ? '#ae8c68' : '#91aeb0');
          r(587, 173, 12, 5, '#334f5b');
          r(590, 170, 5, 3, '#b9c7b5');
          r(588, 178, 2, 11, '#dae3cd');
          r(594, 181, 3, 1, '#435d64');
          r(594, 185, 3, 1, '#435d64');
        },
      });
    }
    for (const o of ActOneWorld.rooms[s.room].objects)
      if (
        o[0] !== 'walter' &&
        o[0] !== 'vince' &&
        ActOneWorld.npcs[o[0]] &&
        ActOne.visible(s, o[0])
      ) {
        let [frame, x, y] = ActOneWorld.npcs[o[0]];
        if (o[0] === 'technician' && s.room === 'corridor') x = 651;
        actors.push({ y, draw: () => npc(ctx, o[0], x, y, t, s.room) });
      }
    if (s.room === 'ems' && ActOne.visible(s, 'vince'))
      actors.push({ y: 315, draw: () => vince(ctx, 510, 315, s, photo.vinceTransform || 0) });
    if (s.room === 'lobby')
      for (const [id, person] of Object.entries(ActOneCast.actors))
        if (person)
          actors.push({ y: person.y, draw: () => ActOneCast.draw(ctx, id, person, t, s) });
    if (s.room === 'lobby' && panorama.complete && panorama.naturalWidth)
      actors.push({
        y: 402,
        draw: () =>
          ctx.drawImage(
            panorama,
            (190 / 1280) * panorama.width,
            (193 / 360) * panorama.height,
            (248 / 1280) * panorama.width,
            (67 / 360) * panorama.height,
            190,
            193,
            248,
            67,
          ),
      });
    if (s.room === 'upper')
      for (const [depth, box] of [
        [372, [175, 175, 140, 71]],
        [372, [353, 175, 137, 71]],
        [379, [981, 180, 196, 73]],
      ])
        actors.push({ y: depth, draw: () => patchImage(ctx, upper, box, 1280) });
    if (s.room === 'kitchen')
      actors.push({ y: 418, draw: () => patchImage(ctx, kitchen, [500, 180, 140, 103], 640) });
    const foreground = {
      second: [
        [343, [242, 141, 86, 85]],
        [364, [180, 170, 74, 73]],
        [332, [331, 121, 113, 97]],
      ],
      teamOffice: [
        [334, [249, 144, 198, 70]],
        [349, [248, 154, 74, 74]],
      ],
      ems: [
        [292, [153, 111, 156, 85]],
        [330, [503, 142, 55, 77]],
      ],
      lounge: [
        [301, [235, 144, 180, 55]],
        [328, [272, 181, 129, 39]],
        [349, [465, 144, 143, 90]],
      ],
    };
    for (const [depth, box] of foreground[s.room] || [])
      actors.push({
        y: depth,
        draw: () => patchImage(ctx, newBackgrounds[s.room], box, s.room === 'second' ? 1280 : 640),
      });
    actors.push({
      y: a.y,
      draw: () => {
        PixelScene.drawActor(ctx, a, s.room, t);
        if (a.gesture > 0 && s.room === 'restroom') {
          r(Math.round((a.x * 2) / 3 + 12), Math.round((a.y * 2) / 3 - 70), 12, 4, '#d39b70');
        }
      },
    });
    actors
      .sort((x, y) => x.y - y.y)
      .forEach((x, i) => {
        rendererLayer('actor-' + i, x.y);
        x.draw();
      });
    rendererLayer('foreground', 10000);
    if (s.room === 'restroom' && restroom.complete && restroom.naturalWidth) {
      // Foreground furniture occludes the actor, while its footprint is excluded from navigation.
      ctx.save();
      ctx.beginPath();
      const outline = [
        [163, 360],
        [163, 337],
        [186, 301],
        [213, 301],
        [213, 283],
        [222, 279],
        [227, 301],
        [235, 301],
        [236, 282],
        [247, 282],
        [249, 301],
        [255, 301],
        [256, 282],
        [270, 282],
        [272, 297],
        [278, 297],
        [279, 285],
        [285, 284],
        [284, 275],
        [290, 269],
        [298, 277],
        [304, 272],
        [305, 285],
        [313, 284],
        [313, 301],
        [382, 301],
        [382, 255],
        [388, 248],
        [403, 248],
        [410, 255],
        [410, 304],
        [418, 304],
        [418, 282],
        [421, 280],
        [418, 270],
        [428, 266],
        [435, 270],
        [435, 283],
        [443, 287],
        [443, 301],
        [456, 301],
        [480, 337],
        [480, 360],
      ];
      outline.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(restroom, 0, 0, 640, 360);
      ctx.restore();
    }
    if (photo.job?.kind === 'capture') {
      const x = Math.round((a.x * 2) / 3),
        y = Math.round((a.y * 2) / 3 - 72 * Movement.scale(s.room, a.y) * 0.45);
      r(x + 8, y, 15, 5, '#ca986e');
      r(x + 20, y - 11, 7, 14, '#182733');
      r(x + 22, y - 9, 3, 8, '#a1dce8');
    }
    if (photo.flash > 0) {
      ctx.fillStyle = 'rgba(255,247,213,' + (photo.flash / 320) * 0.28 + ')';
      ctx.fillRect((camera * 2) / 3, 0, 640, 360);
    }
    if (s.room === 'corridor') {
      // The foreground carts hide feet at their solid, non-walkable edges.
      patchImage(ctx, cleaning, [0, 288, 140, 28], 640);
      patchImage(ctx, cleaning, [537, 283, 103, 33], 640);
      if (ActOne.visible(s, 'insulationTape') && s.flags.cleaningLightOn) {
        r(272, 290, 13, 11, '#20272b');
        r(275, 293, 7, 5, '#aab4b3');
      }
      if (!s.flags.cleaningLightOn) {
        r(0, 0, 640, 360, 'rgba(0,0,0,0.985)');
        r(253, 151, 12, 21, '#514621');
        r(255, 153, 8, 17, '#a09342');
        r(257, 155, 4, 12, '#e3ef8e');
        r(258, 157, 2, 3, '#faffd4');
      }
    }
    ctx.restore();
  }
  return { render };
})();
