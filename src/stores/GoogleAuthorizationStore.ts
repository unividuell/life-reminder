import {defineStore} from "pinia";
import {
    AuthCodeFlowSuccessResponse,
    hasGrantedAllScopes,
    useTokenClient,
} from "vue3-google-signin";
import {computed, ref, watch} from "vue";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";
import {DateTime, Interval} from "luxon";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", () => {

    const accessToken = ref<string | null>(null)
    const expiresAtIsoString = ref<string | null>(null)
    const expiresIn = ref<number | null>(null)
    const activeRefreshInterval = ref<number | null>(null)
    const authorizationResponse = ref<AuthCodeFlowSuccessResponse | null>(null)
    const needsTokenRefresh = ref(false)

    const isAuthorized = computed(() => accessToken.value !== null)
    // computed b/c date-time is not persistable out-of the box
    const expiresAt = computed({
        get(): DateTime | null {
            return expiresAtIsoString.value ? DateTime.fromISO(expiresAtIsoString.value) : null
        },
        set(newValue: DateTime | null) {
            expiresAtIsoString.value = newValue?.toString() || null
        }
    })

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
            if (!result) {
                console.warn('user did not granted all scopes!', authorizationResponse.value.scope)
                throw Error('user did not granted all scopes!')
            }
            accessToken.value = response.access_token
            needsTokenRefresh.value = false
            expiresIn.value = response.expires_in /* use to test: 120 */
            expiresAt.value = DateTime.now().plus({ seconds: expiresIn.value ?? undefined })

        },
        onError: (errorResponse) => console.error(errorResponse),
        // client_id: oneTapStore.oneTapResponse?.clientId,
        // with this hint we connect the one-tap-result to the token-client
        // kudos: https://stackoverflow.com/a/73385352/810944
        hint: null,
        // Specified as an empty string to auto select the account which we have already consented for use.
        prompt: '',
        scope: 'https://www.googleapis.com/auth/calendar'
    })

    const isReady = computed(() => tokenClient.isReady.value)

    function authorize(email: string) {
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

    watch(expiresAt, (newValue) => {
        if (activeRefreshInterval.value) {
            clearInterval(activeRefreshInterval.value)
            console.log(`cleared interval `, activeRefreshInterval.value)
        }
        if (! newValue) return
        console.log(`starting expiration interval`)
        activeRefreshInterval.value = window.setInterval(() => {
            let now = DateTime.now()
            let i = Interval.fromDateTimes(now, expiresAt.value!)
            expiresIn.value = i.length('seconds')
            if (expiresIn.value > 60) {
                // console.log(`more than 1 second remaining, nothing to do..`, expiresIn.value)
                needsTokenRefresh.value = false
            } else {
                console.log(`detected ending session in `, expiresIn.value)
                needsTokenRefresh.value = true
                window.clearInterval(activeRefreshInterval.value ?? undefined)
            }
        }, 5_000)
    })

    watch(accessToken, async (newValue) => {
        if (newValue) {
            console.info(`detected changed google access token ${newValue}, will load everything..`)
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })

    return { isReady, isAuthorized, accessToken, expiresAtIsoString, expiresIn, needsTokenRefresh, authorizationResponse, tokenClient, authorize, reset }
},
{
    persist: true
})
