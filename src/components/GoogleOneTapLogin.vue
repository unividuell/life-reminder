<template>

</template>

<script setup>
import { useOneTap } from "vue3-google-signin";
import {useGoogleOneTapStore} from "../stores/GoogleOneTapStore";

const googleOneTapStore = useGoogleOneTapStore()

useOneTap({
  onSuccess: (response) => {
    googleOneTapStore.onAuthenticated(response)
  },
  onError: () => console.error("Error with One Tap Login"),
  autoSelect: true,
  cancelOnTapOutside: false,
  scope: 'https://www.googleapis.com/auth/calendar',
  // options
});

</script>

<style scoped>

</style>