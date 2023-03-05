<template>
  <v-btn :disabled="!loginIsPossible" @click="() => authenticate()" prepend-icon="mdi-login">Login</v-btn>
</template>

<script setup>
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import {onMounted, watch} from "vue";
import {storeToRefs} from "pinia";

const googleAuthenticationStore = useGoogleAuthenticationStore()

const {loginIsPossible, isAuthenticated, currentUser, userDidLogout} = storeToRefs(googleAuthenticationStore)

async function authenticate() {
  if (! isAuthenticated.value) {
    console.info(`need to login by one-tap as currently not authenticated`)
    await googleAuthenticationStore.authenticate()
  }
}

watch(loginIsPossible, async (newValue) => {
  if (newValue && ! isAuthenticated.value) {
    console.info(`both login clients are ready, currently not authenticated => start authentication`)
    await authenticate()
  }
})


</script>

<style scoped>

</style>