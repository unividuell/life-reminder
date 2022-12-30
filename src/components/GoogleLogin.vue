<template>
  <button :disabled="!isReady" @click="() => login()">Login with Google</button>
</template>

<script setup>
import {
  useTokenClient
} from "vue3-google-signin";
import { useGoogleAuthorizationStore } from '../stores/GoogleAuthorizationStore.js'
import { useGoogleAuthenticationStore } from "../stores/GoogleAuthenticationStore";
import { useGoogleCalendarStore } from "../stores/GoogleCalendarStore";

const authorizationStore = useGoogleAuthorizationStore()
const authenticationStore = useGoogleAuthenticationStore()
const calendarStore = useGoogleCalendarStore()

const handleOnSuccess = (response) => {
  authorizationStore.authorize(response)
  authenticationStore.getUserProfile()
  calendarStore.loadCalendarItems()
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