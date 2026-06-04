import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuth } from './composables/useAuth'

// Restore any existing session before mount (so navbar shows the right state).
useAuth().init()

const app = createApp(App)

// Global error + warning handlers (logged for debugging; never crash silently).
app.config.errorHandler = (err, instance, info) => {
  console.error('[MENYA] Unhandled error:', err, '\nContext:', info)
}

app.use(router)
app.mount('#app')
