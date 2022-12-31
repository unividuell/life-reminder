<template>
  <v-btn :disabled="!isReady" @click="() => login()" prepend-icon="mdi-login"><slot></slot></v-btn>
</template>

<script setup>
import { useTokenClient } from "vue3-google-signin";
import { useGoogleAuthorizationStore } from '../stores/GoogleAuthorizationStore.js'

const googleAuthorizationStore = useGoogleAuthorizationStore()
const handleOnSuccess = (response) => {
  googleAuthorizationStore.authorize(response)
};

const handleOnError = (errorResponse) => {
  console.log("Error: ", errorResponse);
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  scope: 'https://www.googleapis.com/auth/calendar'
  // other options
});
</script>
<style scoped>

</style>