declare module 'vue-writer' {
  import { App, DefineComponent } from 'vue'

  interface VueWriterProps {
    array: string[]
    typeSpeed?: number
    eraseSpeed?: number
    typeDelay?: number
    eraseDelay?: number
    repeat?: boolean
  }

  const VueWriter: DefineComponent<VueWriterProps>

  export default {
    install: (app: App) => {
      app.component('VueWriter', VueWriter)
    },
  }
}
