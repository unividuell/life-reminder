import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";
import {DateTime, Interval} from "luxon";
import {AccessTokenResponse} from "../composables/useGoogleClient";
import {GoogleProfile, useGoogleProfile} from "../composables/useGoogleProfile";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthStore = defineStore("GoogleAuth", () => {

    const accessToken = ref<string | null>(null)
    const expiresAtIsoString = ref<string | null>(null)
    const expiresIn = ref<number | null>(null)
    const activeRefreshInterval = ref<number | null>(null)
    const authorizationResponse = ref<unknown | null>(null)
    const needsTokenRefresh = ref(false)
    const currentUser = ref<GoogleProfile | null>(null)

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

    const isReady = computed(() => true)

    function authorize(token: AccessTokenResponse) {
        accessToken.value = token.access_token
        expiresIn.value = token.expires_in
        expiresAt.value = DateTime.now().plus({ seconds: expiresIn.value ?? undefined })
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
            expiresIn.value = Math.round(i.length('seconds'))
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
            currentUser.value = await useGoogleProfile().loadProfile()
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })

    return { isReady, isAuthorized, accessToken, expiresAtIsoString, expiresIn, needsTokenRefresh, authorizationResponse, authorize, reset, currentUser }
},
{
    persist: true
})
