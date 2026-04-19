import { describe, expect, it } from "vitest";

import { KeyboardInput, type InputEventSource } from "./input";

class FakeInputSource implements InputEventSource {
  private listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatch(type: string, event: Event): void {
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
  }
}

function keyboardEvent(code: string, repeat = false): Event {
  return { code, repeat } as unknown as Event;
}

describe("KeyboardInput", () => {
  it("tracks down, pressed, and released state across frames", () => {
    const source = new FakeInputSource();
    const input = new KeyboardInput(source);

    source.dispatch("keydown", keyboardEvent("KeyW"));

    expect(input.isDown("KeyW")).toBe(true);
    expect(input.wasPressed("KeyW")).toBe(true);

    input.endFrame();

    expect(input.wasPressed("KeyW")).toBe(false);
    expect(input.isDown("KeyW")).toBe(true);

    source.dispatch("keyup", keyboardEvent("KeyW"));

    expect(input.wasReleased("KeyW")).toBe(true);
    expect(input.isDown("KeyW")).toBe(false);
  });

  it("clears all state on blur to avoid sticky keys", () => {
    const source = new FakeInputSource();
    const input = new KeyboardInput(source);

    source.dispatch("keydown", keyboardEvent("ArrowLeft"));
    source.dispatch("blur", {} as Event);

    expect(input.isDown("ArrowLeft")).toBe(false);
    expect(input.wasPressed("ArrowLeft")).toBe(false);
    expect(input.wasReleased("ArrowLeft")).toBe(false);
  });

  it("supports optional axis bindings", () => {
    const source = new FakeInputSource();
    const input = new KeyboardInput(source);

    input.bindAxis("moveX", {
      negative: ["ArrowLeft", "KeyA"],
      positive: ["ArrowRight", "KeyD"]
    });

    source.dispatch("keydown", keyboardEvent("KeyD"));
    expect(input.getAxis("moveX")).toBe(1);

    source.dispatch("keydown", keyboardEvent("KeyA"));
    expect(input.getAxis("moveX")).toBe(0);
  });
});

