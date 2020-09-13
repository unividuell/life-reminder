import Vue from 'vue'
import App from './App.vue'
import VueGoogleApi from 'vue-google-api'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
