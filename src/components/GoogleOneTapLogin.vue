<template>

</template>

<script setup>
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import {onMounted, watch} from "vue";
import {storeToRefs} from "pinia";

const googleAuthenticationStore = useGoogleAuthenticationStore()

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