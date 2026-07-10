import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { RouterLink, RouterView } from 'vue-router'
import { router } from './router'
import App from './App.vue'
import './assets/css/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Alias NuxtLink → RouterLink so existing components work unchanged
app.component('NuxtLink', RouterLink)
app.component('NuxtPage', RouterView)

app.mount('#app')
