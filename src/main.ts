import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router';
import './styles/app-base.css';
import './styles/pixel-theme.css';
import './styles/market-terminal.css';
import './styles/responsive.css';

createApp(App).use(router).mount('#app');
