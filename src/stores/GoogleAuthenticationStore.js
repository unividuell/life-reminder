import { defineStore } from "pinia";
import {decodeCredential, hasGrantedAllScopes, useOneTap, useTokenClient} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import {computed, ref, watch} from "vue";

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore('GoogleAuthentication', () => {

    const oneTapResponse = ref(null)
    const currentUser = ref(null)

    const isAuthenticated = computed(() => currentUser.value !== null)

    const oneTap = useOneTap({
        onSuccess: (response) => {
            oneTapResponse.value = response
            currentUser.value = decodeCredential(response.credential)
        },
        onError: () => console.error("Error with One Tap Login"),
        disableAutomaticPrompt: true,
        autoSelect: true,
        cancelOnTapOutside: false,
        scope: 'https://www.googleapis.com/auth/calendar',
        // options
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

    function logout() {
        currentUser.value = null
        useGoogleAuthorizationStore().reset()
    }

    watch(currentUser, async (newValue) => {
        localStorage.setItem(currentUserKey, JSON.stringify(newValue))
        console.info(`got different email ${newValue.email}. Will start authorization`)
        await useGoogleAuthorizationStore().authorize(newValue.email)
    })

    const currentUserKey = "google_current-user"
    currentUser.value = JSON.parse(localStorage.getItem(currentUserKey))

    return { isAuthenticated, loginIsPossible, isReady, oneTapResponse, currentUser, oneTap, authenticate, logout }
})
