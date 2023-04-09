import { defineStore } from "pinia";
import {CredentialResponse, decodeCredential, hasGrantedAllScopes, useOneTap, useTokenClient} from "vue3-google-signin";

import { useGoogleAuthorizationStore } from './GoogleAuthorizationStore'
import {computed, ref, watch} from "vue";
import {DecodedGoogleUser} from "vue3-google-signin/dist/utils/types";

// Authentication establishes who someone is, and is commonly referred to as user sign-up or sign-in.
export const useGoogleAuthenticationStore = defineStore('GoogleAuthentication', () => {

    const oneTapResponse = ref<CredentialResponse>()
    const currentUser = ref<DecodedGoogleUser | null>(null)
    const userDidLogout = ref(false)

    const isAuthenticated = computed(() => currentUser.value !== null)

    // init one-tap after restoring last state
    const oneTap = useOneTap({
        onSuccess: (response) => {
            oneTapResponse.value = response
            currentUser.value = decodeCredential(response.credential)
        },
        onError: () => console.error("Error with One Tap Login"),
        disableAutomaticPrompt: true, // userDidLogout.value || isAuthenticated.value,
        autoSelect: true,
        cancelOnTapOutside: false,
    });

    const isReady = computed(() => oneTap.isReady.value)
    const loginIsPossible = computed(() => isReady && useGoogleAuthorizationStore().isReady)

    async function authenticate() {
        if (!oneTap.isReady.value) {
            console.warn(`cannot authenticate as the client is not ready`)
            return
        }
        console.info(`starting google one-tap login. isReady: ${oneTap.isReady.value}, userDidLogout: ${userDidLogout.value}, isAuthenticated: ${isAuthenticated.value}`)
        await oneTap.login()
    }

    async function logout() {
        currentUser.value = null
        await useGoogleAuthorizationStore().reset()
        userDidLogout.value = true
    }

    watch(currentUser, async (newValue) => {
        if (newValue) {
            console.info(`got different email ${newValue.email}. Will start authorization`)
            await useGoogleAuthorizationStore().authorize(newValue.email)
        }
    })

    return { isAuthenticated, loginIsPossible, userDidLogout, currentUser, authenticate, logout }
},
{
    persist: true
})
