import {defineStore} from "pinia";
import {
    hasGrantedAllScopes,
} from "vue3-google-signin";
import {ref, watch} from "vue";
import {useGoogleAuthenticationStore} from "./GoogleAuthenticationStore";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", () => {

    const accessToken = ref(null)
    function authorize(response) {
        accessToken.value = response.access_token
        const result = hasGrantedAllScopes(
            response,
            "profile",
            "email",
            "https://www.googleapis.com/auth/calendar"
        )
        if (result === false) {
            console.warn('user did not granted all scopes!')
            throw Error('user did not granted all scopes!')
        }
    }
    watch(accessToken, async (newValue) => {
        localStorage.setItem(tokenKey, newValue)
        if (newValue) {
            console.info('detected changed google access token, will load everything..')
            await useGoogleAuthenticationStore().getUserProfile()
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })

    const tokenKey = 'google_access_token'
    const tokenInStore = localStorage.getItem(tokenKey)
    if (tokenInStore) {
        accessToken.value = tokenInStore
    }

    return { accessToken, authorize }
})
