import Phaser from 'phaser';
import type { Actor } from '../core/movement';
import { Movement } from '../core/movement';
import type { GameState } from '../core/types';
import { act1World } from '../core/chapters';
import { activateAssets } from './assets';
import { VIEW, worldToPixel } from '../core/coordinates';
// Existing pixel painting is separated into textures. Phaser owns display, depth and camera.
interface Layer {
  texture: Phaser.Textures.CanvasTexture;
  image: Phaser.GameObjects.Image;
  ctx: CanvasRenderingContext2D;
  touched: boolean;
}
interface PrologPainter {
  background: (c: CanvasRenderingContext2D, room: string) => void;
  objectStates: (c: CanvasRenderingContext2D, s: GameState) => void;
  drawActor: (
    c: CanvasRenderingContext2D,
    a: Actor,
    room: string,
    t: number,
    mechanic?: boolean,
  ) => void;
}
interface Act1Painter {
  render: (
    c: CanvasRenderingContext2D,
    s: GameState,
    a: Actor,
    t: number,
    camera: number,
    lift: unknown,
    photo: unknown,
  ) => void;
}
let active: PhaserPresentation | null = null;
export function rendererLayer(name: string, depth: number) {
  active?.layer(name, depth);
}
export class PhaserPresentation {
  readonly game: Phaser.Game;
  private scene?: Phaser.Scene;
  private layers = new Map<string, Layer>();
  private current?: Layer;
  private frame = 0;
  constructor(readonly chapter: 'prolog' | 'act1') {
    const parent = document.createElement('div');
    parent.id = 'phaser-world';
    parent.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none';
    document.getElementById('scene')!.prepend(parent);
    const previous = document.getElementById('actors');
    if (previous) previous.style.display = 'none';
    const owner = this;
    class WorldScene extends Phaser.Scene {
      create() {
        owner.scene = this;
        this.input.enabled = false;
        this.cameras.main.setRoundPixels(true);
        document.getElementById('scene')!.dataset.renderer = 'phaser3';
      }
    }
    this.game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      width: VIEW.pixelWidth,
      height: VIEW.pixelHeight,
      transparent: true,
      pixelArt: true,
      roundPixels: true,
      audio: { noAudio: true },
      banner: false,
      scale: { mode: Phaser.Scale.NONE },
      scene: WorldScene,
    });
    parent.querySelector('canvas')?.setAttribute('aria-hidden', 'true');
    const style = document.createElement('style');
    style.textContent =
      '#phaser-world canvas{width:100%!important;height:100%!important;image-rendering:pixelated;pointer-events:none}';
    document.head.append(style);
  }
  private begin(room: string, camera: number) {
    activateAssets(this.chapter, room);
    if (!this.scene) return false;
    active = this;
    this.frame++;
    for (const l of this.layers.values()) {
      l.touched = false;
      l.image.setVisible(false);
    }
    this.layer('background', 0);
    const width =
      this.chapter === 'act1'
        ? worldToPixel(act1World.rooms[room].width ?? VIEW.worldWidth)
        : VIEW.pixelWidth;
    this.scene.cameras.main
      .setBounds(0, 0, width, VIEW.pixelHeight)
      .setScroll(Math.round(worldToPixel(camera)), 0);
    return true;
  }
  layer(name: string, depth: number) {
    if (!this.scene) return;
    let l = this.layers.get(name);
    if (!l) {
      const texture = this.scene.textures.createCanvas('layer-' + name, 1280, 360);
      if (!texture) throw Error('Texture allocation failed');
      l = {
        texture,
        ctx: texture.context,
        image: this.scene.add.image(0, 0, 'layer-' + name).setOrigin(0),
        touched: false,
      };
      this.layers.set(name, l);
    }
    if (!l.touched) {
      l.ctx.resetTransform();
      l.ctx.clearRect(0, 0, 1280, 360);
      l.ctx.imageSmoothingEnabled = false;
      l.touched = true;
      l.image.setVisible(true);
    }
    l.image.setDepth(depth);
    this.current = l;
  }
  private context(): CanvasRenderingContext2D {
    return new Proxy({} as CanvasRenderingContext2D, {
      get: (_target, key) => {
        const ctx = this.current!.ctx;
        const value = Reflect.get(ctx, key, ctx);
        return typeof value === 'function' ? value.bind(ctx) : value;
      },
      set: (_target, key, value) => Reflect.set(this.current!.ctx, key, value),
    });
  }
  private finish() {
    for (const l of this.layers.values()) if (l.touched) l.texture.refresh();
    active = null;
    document.getElementById('scene')!.dataset.renderFrame = String(this.frame);
  }
  renderProlog(p: PrologPainter, s: GameState, a: Actor, t: number) {
    if (!this.begin(s.room, 0)) return;
    const c = this.context();
    p.background(c, s.room);
    p.objectStates(c, s);
    if (s.room === 'garage') {
      const pos = Movement.maps.garage.npc!;
      this.layer('mechanic', pos[1]);
      p.drawActor(
        c,
        { ...a, x: pos[0], y: pos[1], moving: false, direction: 'left' },
        s.room,
        t,
        true,
      );
    }
    this.layer('hero', a.y);
    p.drawActor(c, a, s.room, t);
    this.finish();
  }
  renderAct1(
    p: Act1Painter,
    s: GameState,
    a: Actor,
    t: number,
    camera: number,
    lift: unknown,
    photo: unknown,
  ) {
    if (!this.begin(s.room, camera)) return;
    p.render(this.context(), s, a, t, camera, lift, photo);
    this.finish();
  }
}
