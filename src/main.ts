import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";
import axiosPlugin from './plugins/axios';
import GoogleSignInPlugin from "vue3-google-signin";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'


createApp(App)
    .use(createPinia())
    .use(VueAxios, axios)
    .use(axiosPlugin, {})
    .use(vuetify)
    .use(GoogleSignInPlugin, {
        clientId: import.meta.env.VITE_GAPI_CLIENT_ID
    })
    .component('Datepicker', Datepicker)
    .mount("#app");
