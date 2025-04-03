<template>
  <v-btn v-if="!isAuthorized" @click="() => login()" prepend-icon="mdi-login">Sign in</v-btn>
  <v-btn v-else @click="() => logout()" prepend-icon="mdi-logout" :text="display.smAndUp.value ? 'Sign out' : ''"></v-btn>
</template>

<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useGoogleAuthStore} from "../stores/GoogleAuthStore";
import {useGoogleClient} from "@/composables/useGoogleClient";
import {useDisplay} from "vuetify";

const { oauth2Client } = useGoogleClient()
const googleAuthStore = useGoogleAuthStore()
const {isAuthorized} = storeToRefs(googleAuthStore)
const display = useDisplay()

async function login() {
  // kudos: https://developers.google.com/identity/oauth2/web/guides/use-token-model
  oauth2Client.requestAccessToken()
}
function logout() {
  googleAuthStore.reset()
}
</script>
