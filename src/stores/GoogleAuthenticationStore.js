import { defineStore } from "pinia";
import {decodeCredential, hasGrantedAllScopes, useOneTap, useTokenClient} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import {computed, ref, watch} from "vue";

const currentUserKey = "google_current-user"

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore('GoogleAuthentication', () => {

    const oneTapResponse = ref(null)
    const currentUser = ref(null)
    const userDidLogout = ref(false)

    const isAuthenticated = computed(() => currentUser.value !== null)

    const oneTap = useOneTap({
        onSuccess: (response) => {
            oneTapResponse.value = response
            currentUser.value = decodeCredential(response.credential)
        },
        onError: () => console.error("Error with One Tap Login"),
        disableAutomaticPrompt: userDidLogout,
        autoSelect: true,
        cancelOnTapOutside: false,
    });

    const isReady = computed(() => oneTap.isReady.value)
    const loginIsPossible = computed(() => isReady && useGoogleAuthorizationStore().isReady)

    async function authenticate() {
        if (!oneTap.isReady) {
            console.warn(`cannot authenticate as the client is not ready`)
            return
        }
        console.info(`starting google one-tap login`)
        await oneTap.login()
    }

    async function logout() {
        currentUser.value = null
        await useGoogleAuthorizationStore().reset()
        userDidLogout.value = true
    }

    restoreLastState()

    // start watching after restoring last state
    watch(currentUser, async (newValue) => {
        if (newValue) {
            localStorage.setItem(currentUserKey, JSON.stringify(newValue))
        } else {
            localStorage.removeItem(currentUserKey)
        }
        if (newValue) {
            console.info(`got different email ${newValue.email}. Will start authorization`)
            await useGoogleAuthorizationStore().authorize(newValue.email)
        }
    })

    function restoreLastState() {
        currentUser.value = JSON.parse(localStorage.getItem(currentUserKey))
    }

    return { isAuthenticated, loginIsPossible, userDidLogout, currentUser, authenticate, logout }
})
