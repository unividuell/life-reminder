/**************************************************************************************************
 *
 *                                GOOGLE API WRAPPER FOR VUE.JS 2
 *
 *************************************************************************************************/

import GAPI from './gapi'

export default {
  /** Plugin install method */
  install (Vue, config) {
    console.log("using vue-google-api PATCH!")
    Object.defineProperty(Vue.prototype, '$gapi', { value: new GAPI(config) })
  }
}
