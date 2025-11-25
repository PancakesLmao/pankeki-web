<script setup lang="ts">
defineOptions({ name: 'CustomTerminal' })
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

interface TerminalLine {
  type: 'command' | 'output' | 'intro'
  text: string
}

enum InputMode {
  NORMAL = 'normal',
  USERNAME = 'username',
  PASSWORD = 'password',
}

const authStore = useAuthStore()
const router = useRouter()

const lines = ref<TerminalLine[]>([])
const currentCommand = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const terminalRef = ref<HTMLDivElement | null>(null)
const inputMode = ref<InputMode>(InputMode.NORMAL)
const signinEmail = ref('')
const signinPassword = ref('')

const intro = `
⡆⣿⣿⣦⠹⣳⣳⣕⢅⠈⢗⢕⢕⢕⢕⢕⢈⢆⠟⠋⠉⠁⠉⠉⠁⠈⠼⢐⢕ ⡗⢰⣶⣶⣦⣝⢝⢕⢕⠅⡆⢕⢕⢕⢕⢕⣴⠏⣠⡶⠛⡉⡉⡛⢶⣦⡀⠐⣕ ⡝⡄⢻⢟⣿⣿⣷⣕⣕⣅⣿⣔⣕⣵⣵⣿⣿⢠⣿⢠⣮⡈⣌⠨⠅⠹⣷⡀⢱ ⡝⡵⠟⠈⢀⣀⣀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣼⣿⢈⡋⠴⢿⡟⣡⡇⣿⡇⡀ ⡝⠁⣠⣾⠟⡉⡉⡉⠻⣦⣻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠸⣿⣦⣥⣿⡇⡿⣰⢗ ⠁⢰⣿⡏⣴⣌⠈⣌⠡⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣬⣉⣉⣁⣄⢖⢕⢕ ⡀⢻⣿⡇⢙⠁⠴⢿⡟⣡⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣵⣵ ⡻⣄⣻⣿⣌⠘⢿⣷⣥⣿⠇⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿ ⣷⢄⠻⣿⣟⠿⠦⠍⠉⣡⣾⣿⣿⣿⣿⣿⣿⢸⣿⣦⠙⣿⣿⣿⣿⣿⣿⣿⣿ ⡕⡑⣑⣈⣻⢗⢟⢞⢝⣻⣿⣿⣿⣿⣿⣿⣿⠸⣿⠿⠃⣿⣿⣿⣿⣿⣿⡿⠁
You've found the Terminal!
Type 'help' to see available commands
`

onMounted(() => {
  lines.value.push({
    type: 'intro',
    text: intro,
  })
  focusInput()
})

const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleSubmit = () => {
  const command = currentCommand.value.trim()

  if (!command) return

  // Handle different input modes
  if (inputMode.value === InputMode.USERNAME) {
    signinEmail.value = command
    lines.value.push({
      type: 'command',
      text: command,
    })
    currentCommand.value = ''
    inputMode.value = InputMode.PASSWORD
    addOutput('Password:')
    scrollToBottom()
    return
  }

  if (inputMode.value === InputMode.PASSWORD) {
    signinPassword.value = command
    lines.value.push({
      type: 'command',
      text: '••••••••', // Hide password
    })
    currentCommand.value = ''
    inputMode.value = InputMode.NORMAL

    // Perform signin
    performSignin()
    scrollToBottom()
    return
  }

  // Normal command mode
  lines.value.push({
    type: 'command',
    text: command,
  })

  // Clear input
  currentCommand.value = ''

  // Handle special clear command
  if (command.toLowerCase() === 'clear') {
    lines.value = []
    scrollToBottom()
    return
  }

  // Handle commands
  handleCommand(command)
  scrollToBottom()
}

const handleCommand = (command: string) => {
  const cmd = command.toLowerCase()

  switch (cmd) {
    case 'help':
      addOutput(`help     - Show this help message\nabout    - About me\nskills   - List my skills\nprojects - List my projects\ngames    - List my games\nclear    - Clear the terminal
`)
      break

    case 'about':
      addOutput(`Look to your left (ᗜ˰ᗜ)`)
      break

    case 'skills':
      addOutput(`- Web Development (React, Vue, Elysia, Nextjs) \n- IoT Programming (Raspberry Pi, Arduino, ESP32)\n- Cloud Computing (AWS)\n- Linux (Just a little bit)
`)
      break

    case 'projects':
      fetchAndDisplayProjects()
      break

    case 'games':
      fetchAndDisplayGames()
      break

    case 'signin':
      // Check if already signed in
      if (authStore.isAuthenticated) {
        addOutput('✓ You are already signed in!')
        addOutput('Type "signout" to sign out first.')
        break
      }
      inputMode.value = InputMode.USERNAME
      signinEmail.value = ''
      signinPassword.value = ''
      addOutput('Username:')
      break

    case 'signout':
      performSignout()
      break

    case 'rm -rf /*':
      addOutput(`It's not an actual terminal bruh (ᗜ˰ᗜ)`)
      break

    default:
      addOutput(`Command not found: ${command}
Type 'help' to see available commands.`)
      break
  }
}

const performSignin = async () => {
  addOutput('Authenticating...')

  const result = await authStore.signin(signinEmail.value, signinPassword.value)

  if (result.success) {
    addOutput('✓ Signed in successfully!')
    addOutput('Redirecting to dashboard...')

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } else {
    addOutput(`✗ Authentication failed: ${result.error}`)
    addOutput('Type "signin" to try again.')
  }

  // Reset signin state
  signinEmail.value = ''
  signinPassword.value = ''
}

const performSignout = async () => {
  // Check if user is signed in
  if (!authStore.isAuthenticated) {
    addOutput('✗ You are not signed in.')
    return
  }

  addOutput('Signing out...')

  await authStore.signout()

  addOutput('✓ Signed out successfully!')

  // If on dashboard, redirect to home
  if (router.currentRoute.value.path === '/dashboard') {
    addOutput('Redirecting to home...')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }
}

const addOutput = (text: string) => {
  lines.value.push({
    type: 'output',
    text,
  })
}

const fetchAndDisplayProjects = async () => {
  try {
    addOutput('Loading projects...')
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const response = await fetch(`${backendUrl}/api/projects`)
    const data = (await response.json()) as { projects: Array<{ title: string }> }

    if (!data.projects || data.projects.length === 0) {
      addOutput('No projects found.')
      return
    }

    const projectList = data.projects.map((project) => `- ${project.title}`).join('\n')
    addOutput(projectList)
  } catch (error) {
    addOutput(
      `✗ Error fetching projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

const fetchAndDisplayGames = async () => {
  try {
    addOutput('Loading games...')
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const response = await fetch(`${backendUrl}/api/games`)
    const data = (await response.json()) as { games: Array<{ title: string }> }

    if (!data.games || data.games.length === 0) {
      addOutput('No games found.')
      return
    }

    const gameList = data.games.map((game) => `- ${game.title}`).join('\n')
    addOutput(gameList)
  } catch (error) {
    addOutput(`✗ Error fetching games: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    }
  })
}

const handleKeyDown = (e: KeyboardEvent) => {
  // Prevent tab default behavior
  if (e.key === 'Tab') {
    e.preventDefault()
  }
}
</script>

<template>
  <div ref="terminalRef" class="terminal-container" @click="focusInput">
    <div class="terminal-content">
      <!-- Display history -->
      <div v-for="(line, index) in lines" :key="index" class="terminal-line">
        <div v-if="line.type === 'intro'" class="terminal-intro">
          {{ line.text }}
        </div>
        <div v-else-if="line.type === 'command'" class="terminal-command">
          <span class="terminal-prompt">$</span>
          <span class="terminal-command-text">{{ line.text }}</span>
        </div>
        <div v-else-if="line.type === 'output'" class="terminal-output">
          <pre>{{ line.text }}</pre>
        </div>
      </div>

      <!-- Current input -->
      <div class="terminal-input-line">
        <span class="terminal-prompt">$</span>
        <input
          ref="inputRef"
          v-model="currentCommand"
          :type="inputMode === 'password' ? 'password' : 'text'"
          class="terminal-input"
          @keydown.enter="handleSubmit"
          @keydown="handleKeyDown"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal-container {
  background: #0d1117;
  color: white;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 13px;
  padding: 0.75rem;
  height: 300px;
  overflow-y: auto;
  cursor: text;
  line-height: 1.5;
  border: 1px solid #30363d;
  border-radius: 0.5rem;
}

.terminal-content {
  min-height: 100%;
}

.terminal-line {
  margin-bottom: 0.25rem;
}

.terminal-intro {
  color: #8b949e;
  white-space: pre-wrap;
  margin-bottom: 0.75rem;
  font-size: 12px;
}

.terminal-command {
  display: flex;
  gap: 0.5rem;
}

.terminal-prompt {
  color: #7ee787;
  font-weight: bold;
  user-select: none;
}

.terminal-command-text {
  color: #c9d1d9;
}

.terminal-output {
  color: #c9d1d9;
  margin-left: 1.5rem;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
}

.terminal-output pre {
  margin: 0;
  font-family: inherit;
  white-space: pre-wrap;
}

.terminal-input-line {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #c9d1d9;
  font-family: inherit;
  font-size: inherit;
  caret-color: white;
}

.terminal-input::selection {
  background: #1f6feb;
}

/* Custom scrollbar */
.terminal-container::-webkit-scrollbar {
  width: 6px;
}

.terminal-container::-webkit-scrollbar-track {
  background: #161b22;
}

.terminal-container::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}

.terminal-container::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>
