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
