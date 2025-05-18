import type { InjectionKey, Ref } from 'vue'

export enum Mode {
  Developer = 'developer',
  Gamer = 'gamer',
}

export interface ModeContext {
  mode: Ref<string>
  setMode: (newMode: string) => void
}

export const ModeInjectionKey: InjectionKey<ModeContext> = Symbol('mode')
