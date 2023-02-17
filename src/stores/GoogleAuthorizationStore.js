import {defineStore} from "pinia";
import {
    hasGrantedAllScopes,
} from "vue3-google-signin";
import {ref, watch} from "vue";
import {useGoogleAuthenticationStore} from "./GoogleAuthenticationStore";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";
import {DateTime, Interval} from "luxon";
import {useGoogleOneTapStore} from "./GoogleOneTapStore";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", () => {

    const accessToken = ref(null)
    const expiresAt = ref(null)
    const activeRefreshInterval = ref(null)
    const authorizationResponse = ref(null)
    function authorize(response) {
        authorizationResponse.value = response
        accessToken.value = response.access_token
        expiresAt.value = DateTime.now().plus({ seconds: response.expires_in })
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
    watch(expiresAt, async(newValue) => {
        if (activeRefreshInterval.value) {
            clearInterval(activeRefreshInterval.value)
            console.log(`cleared interval `, activeRefreshInterval.value)
        }
        activeRefreshInterval.value = setInterval(() => {
            let now = DateTime.now()
            let i = Interval.fromDateTimes(now, newValue);
            if (i.length('seconds') > 60) {
                console.log(`more than 1 second remaining, nothing to do..`, i.length('seconds'))
            } else {
                // do a refresh
                useGoogleOneTapStore().tokenLogin()
            }
        }, 5_000)
    })

    const tokenKey = 'google_access_token'
    // watch for initial change via workaround.
    // kudos: https://github.com/vuejs/pinia/issues/309#issuecomment-1291213101
    const tokenInStore = localStorage.getItem(tokenKey)
    if (tokenInStore) {
        accessToken.value = tokenInStore
    }

    return { accessToken, expiresAt, authorizationResponse, authorize }
})
