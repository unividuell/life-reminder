<template>
  <v-btn :disabled="!loginIsPossible" @click="() => login()" prepend-icon="mdi-login">Login</v-btn>
</template>

<script setup>
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import {onMounted, watch} from "vue";
import {storeToRefs} from "pinia";
import {useGoogleAuthorizationStore} from "@/stores/GoogleAuthorizationStore";

const googleAuthenticationStore = useGoogleAuthenticationStore()
const googleAuthorizationStore = useGoogleAuthorizationStore()

const {loginIsPossible, isAuthenticated, currentUser, userDidLogout} = storeToRefs(googleAuthenticationStore)
const {isAuthorized, authorize} = storeToRefs(googleAuthorizationStore)

async function login() {
  if (! isAuthenticated.value) {
    console.info(`need to login by one-tap as currently not authenticated`)
    await googleAuthenticationStore.authenticate()
  } else if (! isAuthorized.value) {
    console.info(`need to authorize (we are already authorized)`)
    await googleAuthorizationStore.authorize(currentUser.email)
  }
}

watch(loginIsPossible, async (newValue) => {
  if (newValue && ! isAuthenticated.value) {
    console.info(`both login clients are ready, currently not authenticated => start authentication`)
    await login()
  }
})


</script>

<style scoped>

</style>