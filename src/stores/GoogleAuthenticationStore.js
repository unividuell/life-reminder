import { defineStore } from "pinia";
import { decodeCredential } from 'vue3-google-login'
import { googleLogout } from "vue3-google-login"

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore("GoogleAuthentication", {
    state: () => ({
        currentUser: null,
        calendarBackendId: null,
        loading: false
    }),
    getters: {
        authenticated: (state) => state.currentUser != null
    },
    actions: {
        loginCallback(response) {
            const userData = decodeCredential(response.credential)
            this.currentUser = userData
        },
        logout() {
            googleLogout()
            this.currentUser = null
            googleLogout()
        }
    }
});