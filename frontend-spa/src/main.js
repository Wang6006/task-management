import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query';

const app = createApp(App)
  .use(router)
  .use(VueQueryPlugin);

if (import.meta.env.DEV) {
  app.config.devtools = true;
}

app.mount('#app');
