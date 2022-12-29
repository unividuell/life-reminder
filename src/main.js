import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";
import vue3GoogleLogin from 'vue3-google-login';

createApp(App)
    .use(createPinia())
    .use(VueAxios, axios)
    .use(vuetify)
    .use(vue3GoogleLogin, {
        clientId: import.meta.env.VITE_GAPI_CLIENT_ID
    })
    .mount("#app");
