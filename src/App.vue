<template>
  <v-app>
    <AppBar />
    <DrawerNavigation />
    <v-main>
      <v-progress-linear :model-value="remainingSession" :height="2" />
      <Main v-if="fullyUsable && !needsTokenRefresh" />
      <GoogleSessionRefresh v-if="needsTokenRefresh && isAuthenticated" />

      <AddSoftEvent v-if="fullyUsable" />
      <SetEventState v-if="fullyUsable" />

    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import Main from './components/Main.vue';
import {storeToRefs} from "pinia";
import AppBar from "./components/AppBar.vue";
import SetEventState from "./components/SetEventState.vue";
import AddSoftEvent from "./components/AddSoftEvent.vue";
import {computed, ref} from "vue";
import {useGoogleAuthorizationStore} from "./stores/GoogleAuthorizationStore";
import GoogleSessionRefresh from "./components/GoogleSessionRefresh.vue";
import {useGoogleAuthenticationStore} from "./stores/GoogleAuthenticationStore";
import DrawerNavigation from "@/components/DrawerNavigation.vue";

const authenticationStore = useGoogleAuthenticationStore()
const authorizationStore = useGoogleAuthorizationStore()

const loading = ref(false)
const { isAuthenticated } = storeToRefs(authenticationStore)
const { isAuthorized, needsTokenRefresh, expiresIn } = storeToRefs(authorizationStore)

const remainingSession = computed(() => {
  let max = 3_600
  let remaining = (expiresIn.value ?? 0 / max) * 100
  // console.info(`remaining`, remaining)
  return remaining
})

const fullyUsable = computed(() => isAuthenticated.value && isAuthorized.value)
</script>
