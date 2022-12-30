import {defineStore} from "pinia";
import {
    hasGrantedAllScopes,
} from "vue3-google-signin";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", {
    state: () => ({
        accessToken: null
    }),
    actions: {
        authorize(response) {
            this.accessToken = response.access_token
            const result = hasGrantedAllScopes(
                response,
                "profile",
                "email",
                "https://www.googleapis.com/auth/calendar"
            )
            if (result === false) console.warn('user did not granted all scopes!')
        }
    }
})