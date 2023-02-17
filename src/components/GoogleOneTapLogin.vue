<template>

</template>

<script setup>
import { useOneTap } from "vue3-google-signin";
import {useGoogleOneTapStore} from "../stores/GoogleOneTapStore";
import {watch} from "vue";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";

const googleOneTapStore = useGoogleOneTapStore()
const googleAuthStore = useGoogleAuthorizationStore()

const oneTap = useOneTap({
  onSuccess: (response) => {
    googleOneTapStore.onAuthenticated(response)
  },
  onError: () => console.error("Error with One Tap Login"),
  disableAutomaticPrompt: true,
  autoSelect: true,
  cancelOnTapOutside: false,
  scope: 'https://www.googleapis.com/auth/calendar',
  // options
});

watch(oneTap.isReady, (newValue) => {
  if (newValue) {
    if (googleAuthStore.needsTokenRefresh || googleAuthStore.accessToken === undefined) {
      oneTap.login()
    }
  }
})

</script>

<style scoped>

</style>