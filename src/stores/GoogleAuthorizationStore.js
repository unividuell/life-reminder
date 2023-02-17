import {defineStore} from "pinia";
import {
    hasGrantedAllScopes, useTokenClient,
} from "vue3-google-signin";
import {computed, onMounted, ref, watch} from "vue";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";
import {DateTime, Interval} from "luxon";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", () => {

    const accessToken = ref(null)
    const expiresAt = ref(null)
    const activeRefreshInterval = ref(null)
    const authorizationResponse = ref(null)
    const needsTokenRefresh = ref(false)

    const isAuthorized = computed(() => accessToken.value !== null)

    // we can use the result from the one-tap response to get an access token
    const tokenClient = useTokenClient({
        onSuccess: (response) => {
            authorizationResponse.value = response
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
            accessToken.value = response.access_token
            expiresAt.value = DateTime.now().plus({ seconds: response.expires_in })
        },
        onError: (errorResponse) => console.error(errorResponse),
        // client_id: oneTapStore.oneTapResponse?.clientId,
        // with this hint we connect the one-tap-result to the token-client
        // kudos: https://stackoverflow.com/a/73385352/810944
        hint: null,
        // Specified as an empty string to auto select the account which we have already consented for use.
        prompt: '',
    })

    const isReady = computed(() => tokenClient.isReady.value)

    function authorize(email) {
        if (!tokenClient.isReady) {
            console.warn(`cannot authorize as the client is not ready`)
        }
        tokenClient.login({hint: email})
    }

    function reset() {
        accessToken.value = null
        expiresAt.value = null
        authorizationResponse.value = null
        needsTokenRefresh.value = true
        console.info(`did reset everything`)
    }

    watch(accessToken, async (newValue) => {
        localStorage.setItem(tokenKey, newValue)
        if (newValue) {
            console.info('detected changed google access token, will load everything..')
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })
    // watch(expiresAt, async(newValue) => {
    //     localStorage.setItem(tokenExpiresAtKey, newValue)
    //     if (activeRefreshInterval.value) {
    //         clearInterval(activeRefreshInterval.value)
    //         console.log(`cleared interval `, activeRefreshInterval.value)
    //     }
    //     if (! newValue) return
    //     activeRefreshInterval.value = setInterval(() => {
    //         let now = DateTime.now()
    //         let i = Interval.fromDateTimes(now, newValue);
    //         if (i.length('seconds') > 60) {
    //             console.log(`more than 1 second remaining, nothing to do..`, i.length('seconds'))
    //             needsTokenRefresh.value = false
    //         } else {
    //             needsTokenRefresh.value = false
    //         }
    //     }, 5_000)
    // })
    // watch(needsTokenRefresh, async (newValue) => {
    //     if (newValue) {
    //         // do a refresh
    //         await useGoogleOneTapStore().tokenLogin()
    //     }
    // })

    const tokenKey = 'google_access_token'
    const tokenExpiresAtKey = 'google_access_token_expires-at'
    // watch for initial change via workaround.
    // kudos: https://github.com/vuejs/pinia/issues/309#issuecomment-1291213101
    const tokenInStore = localStorage.getItem(tokenKey)
    if (tokenInStore !== null) {
        accessToken.value = tokenInStore
    }
    const tokenExpiresAtInStore = localStorage.getItem(tokenExpiresAtKey)
    if (tokenExpiresAtInStore) {
        expiresAt.value = DateTime.fromISO(tokenExpiresAtInStore)
    }

    return { isReady, isAuthorized, accessToken, expiresAt, needsTokenRefresh, authorizationResponse, tokenClient, authorize, reset }
})
