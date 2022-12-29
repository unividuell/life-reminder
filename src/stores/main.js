import { createApp } from 'vue'
import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
    state: () => ({
        authenticated: false,
        calendarBackendId: null,
        loading: false
    }),
    // actions: {
    //     setAuthenticated (value) {
    //         this.state.authenticated = value
    //     },
    //     setCalendarBackendId(value) {
    //         this.state.calendarBackendId = value
    //     },
    //     setLoading(value) {
    //         this.state.loading = value
    //     }
    // }
});