<template>
  <v-btn :disabled="!loginIsPossible" @click="() => login()" prepend-icon="mdi-login">Login</v-btn>
</template>

<script setup lang="ts">
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import {watch} from "vue";
import {storeToRefs} from "pinia";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";

const googleAuthenticationStore = useGoogleAuthenticationStore()
const googleAuthorizationStore = useGoogleAuthorizationStore()

const {loginIsPossible, isAuthenticated, currentUser} = storeToRefs(googleAuthenticationStore)
const {isAuthorized} = storeToRefs(googleAuthorizationStore)

async function login() {
  if (! isAuthenticated.value) {
    console.info(`need to login by one-tap as currently not authenticated`)
    await googleAuthenticationStore.authenticate()
  } else if (! isAuthorized.value && currentUser.value?.email) {
    console.info(`need to authorize (we are already authorized)`)
    await googleAuthorizationStore.authorize(currentUser.value.email)
  }
}

watch(loginIsPossible, async (newValue) => {
  if (newValue && ! isAuthenticated.value) {
    console.info(`both login clients are ready, currently not authenticated => start authentication`)
    await login()
  }
})


</script>
