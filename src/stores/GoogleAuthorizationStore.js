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
    const expiresIn = ref(null)
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
            needsTokenRefresh.value = false
            expiresIn.value = response.expires_in /* use to test: 120 */
            expiresAt.value = DateTime.now().plus({ seconds: expiresIn.value })

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
        expiresIn.value = null
        authorizationResponse.value = null
        needsTokenRefresh.value = false
        console.info(`did reset everything`)
    }

    watch(accessToken, async (newValue) => {
        if (newValue) {
            localStorage.setItem(tokenKey, newValue)
        } else {
            localStorage.removeItem(tokenKey)
        }
        if (newValue) {
            console.info(`detected changed google access token ${newValue}, will load everything..`)
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })
    watch(expiresAt, async(newValue) => {
        if (newValue) {
            localStorage.setItem(tokenExpiresAtKey, newValue?.toString())
        } else {
            localStorage.removeItem(tokenExpiresAtKey)
        }
        if (activeRefreshInterval.value) {
            clearInterval(activeRefreshInterval.value)
            console.log(`cleared interval `, activeRefreshInterval.value)
        }
        if (! newValue) return
        console.log(`starting expiration interval`)
        activeRefreshInterval.value = setInterval(() => {
            let now = DateTime.now()
            let i = Interval.fromDateTimes(now, expiresAt.value)
            expiresIn.value = i.length('seconds')
            if (expiresIn.value > 60) {
                console.log(`more than 1 second remaining, nothing to do..`, expiresIn.value)
                needsTokenRefresh.value = false
            } else {
                console.log(`detected ending session in `, expiresIn.value)
                needsTokenRefresh.value = true
                clearInterval(activeRefreshInterval.value)
            }
        }, 5_000)
    })

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

    return { isReady, isAuthorized, accessToken, expiresAt, expiresIn, needsTokenRefresh, authorizationResponse, tokenClient, authorize, reset }
})
