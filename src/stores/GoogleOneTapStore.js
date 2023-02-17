import { defineStore } from "pinia";
import {decodeCredential, hasGrantedAllScopes, useTokenClient} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import axios from "axios";

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleOneTapStore = defineStore("GoogleOneTap", {
    state: () => ({
        oneTapResponse: null,
        currentUser: null,
    }),
    getters: {
        authenticated: (state) => state.currentUser != null
    },
    actions: {
        async onAuthenticated(response) {
            this.oneTapResponse = response
            this.currentUser = decodeCredential(this.oneTapResponse.credential)
            await this.tokenLogin()
        },
        async tokenLogin() {
            // we can use the result from the one-tap response to get an access token
            const { isReady, login } = useTokenClient({
                onSuccess: (response) => {
                    useGoogleAuthorizationStore().authorize(response)
                },
                onError: (errorResponse) => console.error(errorResponse),
                client_id: this.oneTapResponse.clientId,
                // with this hint we connect the one-tap-result to the token-client
                // kudos: https://stackoverflow.com/a/73385352/810944
                hint: this.currentUser.email,
                // Specified as an empty string to auto select the account which we have already consented for use.
                prompt: '',
            })
            if (isReady) login()
        },
        logout() {
            this.currentUser = null
            useGoogleAuthorizationStore().accessToken = null
        }
    }
});