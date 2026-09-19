export interface MomentumSliderOptions {
  el?: string | Element;
  cssClass?: string;
  vertical?: boolean;
  reverse?: boolean;
  multiplier?: number;
  bounceCoefficient?: number;
  bounceMax?: number;
  loop?: number;
  interactive?: boolean;
  currentIndex?: number;
  animDuration?: number;
  sync?: MomentumSlider[];
  style?: Record<string, unknown>;
  customStyles?: (index: number, diff: number, lower?: boolean) => void;
  change?: (newIndex: number, oldIndex?: number) => void;
  prevEl?: string | Element | null;
  nextEl?: string | Element | null;
  /** ms between automatic `next()` steps (0 = off; ignored under reduced motion). */
  autoplay?: number;
  /** Continuous drift in px/second, marquee-style (0 = off; requires `loop`). */
  autoScroll?: number;
  /** Element whose hover / keyboard-focus pauses autoplay (default: `el`). */
  pauseEl?: Element | null;
  /** Element whose hover pauses autoplay (default: `pauseEl`). */
  hoverEl?: Element | null;
  /** Pause autoplay while hovered (hover-capable devices only). Default true. */
  pauseOnHover?: boolean;
  /** Skip autoplay when the OS prefers reduced motion. Default true. */
  respectReducedMotion?: boolean;
}

export default class MomentumSlider {
  constructor(options?: MomentumSliderOptions);
  readonly o: MomentumSliderOptions;
  prev(): void;
  next(): void;
  select(index: number): void;
  refresh(): void;
  destroy(): void;
  getCurrentIndex(): number;
  enable(): void;
  disable(): void;
}
