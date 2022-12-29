import { defineStore } from "pinia";

export const useGoogleLoginStore = defineStore("googleLogin", {
    state: () => ({
        currentUser: null,
        calendarBackendId: null,
        loading: false
    }),
    getters: {
        authenticated: (state) => state.currentUser != null
    }
});