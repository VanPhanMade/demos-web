import { defineComponent } from "@codex-game/engine";

export interface TransformData {
  x: number;
  y: number;
}

export interface VelocityData {
  x: number;
  y: number;
}

export interface SpriteData {
  assetId: string;
  frame: string;
  width: number;
  height: number;
}

export interface PlayerControlledData {
  speed: number;
}

export const Transform = defineComponent<TransformData>("Transform");
export const Velocity = defineComponent<VelocityData>("Velocity");
export const Sprite = defineComponent<SpriteData>("Sprite");
export const PlayerControlled =
  defineComponent<PlayerControlledData>("PlayerControlled");

