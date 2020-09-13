import Vue from 'vue'
import App from './App.vue'
import VueGAPI from 'vue-gapi'

Vue.config.productionTip = false

const apiConfig = {
  apiKey: process.env.VUE_APP_GAPI_KEY,
  clientId: process.env.VUE_APP_GAPI_CLIENT_ID,
  scope: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.calendars',
  discoveryDocs: [ 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest' ],
  // works only with `ux_mode: "prompt"`
  refreshToken: true,
}
Vue.use(VueGAPI, apiConfig)

new Vue({
  render: h => h(App),
}).$mount('#app')
