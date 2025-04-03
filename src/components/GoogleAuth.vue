<template>
  <v-btn v-if="!isAuthorized" @click="() => login()" prepend-icon="mdi-login">Login</v-btn>
  <v-btn v-else @click="() => logout()" prepend-icon="mdi-logout">Logout</v-btn>
</template>

<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {useGoogleClient} from "@/composables/useGoogleClient";

const { oauth2Client } = useGoogleClient()
const googleAuthorizationStore = useGoogleAuthorizationStore()

const {isAuthorized} = storeToRefs(googleAuthorizationStore)

async function login() {
  // kudos: https://developers.google.com/identity/oauth2/web/guides/use-token-model
  oauth2Client.requestAccessToken()
}
function logout() {
  googleAuthorizationStore.reset()
}
</script>
