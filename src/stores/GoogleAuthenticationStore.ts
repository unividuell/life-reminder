import { defineStore } from "pinia";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import {computed, ref, watch} from "vue";

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore('GoogleAuthentication', () => {

    const oneTapResponse = ref<unknown>()
    const currentUser = ref<unknown | null>(null)
    const userDidLogout = ref(false)

    const isAuthenticated = computed(() => currentUser.value !== null)

    // init one-tap after restoring last state
    // const oneTap = useOneTap({
    //     onSuccess: (response) => {
    //         oneTapResponse.value = response
    //         currentUser.value = decodeCredential(response.credential)
    //     },
    //     onError: () => console.error("Error with One Tap Login"),
    //     disableAutomaticPrompt: true, // userDidLogout.value || isAuthenticated.value,
    //     autoSelect: true,
    //     cancelOnTapOutside: false,
    // });

    const isReady = computed(() => true)
    const loginIsPossible = computed(() => isReady && useGoogleAuthorizationStore().isReady)

    async function authenticate() {
        if (!isReady.value) {
            console.warn(`cannot authenticate as the client is not ready`)
            return
        }
        console.info(`starting google one-tap login. isReady: ${isReady.value}, userDidLogout: ${userDidLogout.value}, isAuthenticated: ${isAuthenticated.value}`)
        throw Error(`WIP`)
    }

    function logout() {
        currentUser.value = null
        useGoogleAuthorizationStore().reset()
        userDidLogout.value = true
    }

    watch(currentUser, (newValue) => {
        if (newValue) {
            console.info(`got different email ${newValue}. Will start authorization`)
            throw Error(`WIP`)
            // useGoogleAuthorizationStore().authorize(newValue.email)
        }
    })

    return { isAuthenticated, loginIsPossible, userDidLogout, currentUser, authenticate, logout }
},
{
    persist: true
})
