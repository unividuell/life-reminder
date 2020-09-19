import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        authenticated: false,
        calendarBackendId: null
    },
    mutations: {
        setAuthenticated (state, value) {
            state.authenticated = value
        },
        setCalendarBackendId(state, value) {
            state.calendarBackendId = value
        }
    }
});