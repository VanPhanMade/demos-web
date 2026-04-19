export interface AxisBinding {
  negative: string[];
  positive: string[];
}

export interface InputLike {
  isDown(code: string): boolean;
  wasPressed(code: string): boolean;
  wasReleased(code: string): boolean;
  getAxis(name: string): number;
}

export interface InputEventSource {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void;
}

export class KeyboardInput implements InputLike {
  private down = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();
  private axes = new Map<string, AxisBinding>();

  private readonly onKeyDown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.repeat || this.down.has(keyboardEvent.code)) {
      return;
    }

    this.down.add(keyboardEvent.code);
    this.pressed.add(keyboardEvent.code);
  };

  private readonly onKeyUp = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    if (!this.down.has(keyboardEvent.code)) {
      return;
    }

    this.down.delete(keyboardEvent.code);
    this.released.add(keyboardEvent.code);
  };

  private readonly onBlur = (): void => {
    this.resetAll();
  };

  constructor(private readonly source: InputEventSource) {
    this.source.addEventListener("keydown", this.onKeyDown);
    this.source.addEventListener("keyup", this.onKeyUp);
    this.source.addEventListener("blur", this.onBlur);
  }

  bindAxis(name: string, binding: AxisBinding): void {
    this.axes.set(name, binding);
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  wasPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  wasReleased(code: string): boolean {
    return this.released.has(code);
  }

  getAxis(name: string): number {
    const binding = this.axes.get(name);
    if (!binding) {
      return 0;
    }

    const negative = binding.negative.some((code) => this.isDown(code));
    const positive = binding.positive.some((code) => this.isDown(code));

    if (negative === positive) {
      return 0;
    }

    return positive ? 1 : -1;
  }

  endFrame(): void {
    this.pressed.clear();
    this.released.clear();
  }

  resetAll(): void {
    this.down.clear();
    this.pressed.clear();
    this.released.clear();
  }

  dispose(): void {
    this.source.removeEventListener("keydown", this.onKeyDown);
    this.source.removeEventListener("keyup", this.onKeyUp);
    this.source.removeEventListener("blur", this.onBlur);
  }
}

