import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";

createApp(App)
    .use(createPinia())
    .use(VueAxios, axios)
    .use(vuetify)
    .mount("#app");
