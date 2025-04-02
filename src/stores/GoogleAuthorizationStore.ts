import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {useGoogleCalendarStore} from "./GoogleCalendarStore";
import {DateTime, Interval} from "luxon";

// Authorization is the process of granting or rejecting access to data or resources.
export const useGoogleAuthorizationStore = defineStore("GoogleAuthorization", () => {

    const accessToken = ref<string | null>(null)
    const expiresAtIsoString = ref<string | null>(null)
    const expiresIn = ref<number | null>(null)
    const activeRefreshInterval = ref<number | null>(null)
    const authorizationResponse = ref<unknown | null>(null)
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

    const isReady = computed(() => true)

    function authorize(email: string) {
        if (!isReady.value) {
            console.warn(`cannot authorize as the client is not ready`)
        }
        // tokenClient.login({hint: email})
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
            await useGoogleCalendarStore().loadCalendarItems()
        }
    })

    return { isReady, isAuthorized, accessToken, expiresAtIsoString, expiresIn, needsTokenRefresh, authorizationResponse, authorize, reset }
},
{
    persist: true
})
