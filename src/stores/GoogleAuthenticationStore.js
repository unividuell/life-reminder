import { defineStore } from "pinia";
import {decodeCredential, hasGrantedAllScopes, useOneTap, useTokenClient} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import {computed, ref, watch} from "vue";

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
        await oneTap.login()
    }

    async function logout() {
        currentUser.value = null
        await useGoogleAuthorizationStore().reset()
        userDidLogout.value = true
    }

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

    const currentUserKey = "google_current-user"
    currentUser.value = JSON.parse(localStorage.getItem(currentUserKey))

    return { isAuthenticated, loginIsPossible, userDidLogout, currentUser, authenticate, logout }
})
