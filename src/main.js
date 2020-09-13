import Vue from 'vue'
import App from './App.vue'
import VueGoogleApi from 'vue-google-api'

Vue.config.productionTip = false

const config = {
  apiKey: process.env.VUE_APP_GAPI_KEY,
  clientId: process.env.VUE_APP_GAPI_CLIENT_ID,
  scope: 'email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.calendars',
  discoveryDocs: [ 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest' ]
}
Vue.use(VueGoogleApi, config)

new Vue({
  render: h => h(App),
}).$mount('#app')
