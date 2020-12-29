import Vue from 'vue'
import App from './App.vue'
import store from "./store"
import "./plugins/vue-google-api";
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

if (process.env.NODE_ENV !== "development" && location.protocol !== "https:") {
  // in production we need SSL-connections (b/c of google credentials settings (only https is allowed))
  // kudos: https://stackoverflow.com/a/10036029/810944
  location.protocol = "https:";
}

new Vue({
  render: h => h(App),
  vuetify,
  store: store
}).$mount('#app')
