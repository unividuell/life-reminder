import { defineStore } from "pinia";
import {decodeCredential} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import axios from "axios";

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore("GoogleAuthentication", {
    state: () => ({
        currentUser: null,
        calendarBackendId: null,
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
        async getUserProfile() {
            let response = await axios
                .get(
                    'https://www.googleapis.com/oauth2/v1/userinfo',
                    {
                        headers: {
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                    }
                )
            this.currentUser = response.data
        },
        logout() {
            this.currentUser = null
            useGoogleAuthorizationStore().accessToken = null
        }
    }
});