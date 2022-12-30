import { defineStore } from "pinia";
import {decodeCredential} from "vue3-google-signin";


// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore("GoogleAuthentication", {
    state: () => ({
        googleToken: null,
        currentUser: null,
        calendarBackendId: null,
        loading: false
    }),
    getters: {
        authenticated: (state) => state.currentUser != null
    },
    actions: {
        loginCallback(response) {
            this.googleToken = response
            const userData = decodeCredential(response.credential)
            this.currentUser = userData
        },
        logout() {
            this.googleToken = null
            this.currentUser = null
        }
    }
});