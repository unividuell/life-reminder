<template>

</template>

<script setup>
import {useGoogleOneTapStore} from "../stores/GoogleOneTapStore";
import {onMounted, watch} from "vue";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {storeToRefs} from "pinia";

const googleAuthenticationStore = useGoogleOneTapStore()
const googleAuthorizationStore = useGoogleAuthorizationStore()

const {loginIsPossible, currentUser} = storeToRefs(googleAuthenticationStore)

async function authenticate() {
  console.info(currentUser.value)
  if (currentUser.value == null) {
    console.info(`need to login by one-tap`)
    await googleAuthenticationStore.authenticate()
  }
}

watch(loginIsPossible, async (newValue) => {
  if (newValue) {
    console.info(`both login clients are ready`)
    await authenticate()
  }
})


</script>

<style scoped>

</style>