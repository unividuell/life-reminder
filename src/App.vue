<template>
  <v-app>
    <AppBar />
    <DrawerNavigation />
    <v-main>
      <v-progress-linear :model-value="remainingSession" :height="2" />
      <Main v-if="fullyUsable && !needsTokenRefresh" />
      <GoogleSessionRefresh v-if="needsTokenRefresh" />

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
import {computed, onMounted, ref} from "vue";
import {useGoogleAuthStore} from "./stores/GoogleAuthStore";
import GoogleSessionRefresh from "./components/GoogleSessionRefresh.vue";
import DrawerNavigation from "@/components/DrawerNavigation.vue";
import {useTheme} from "vuetify";

const authStore = useGoogleAuthStore()
const theme = useTheme()

const { isAuthorized, needsTokenRefresh, expiresIn } = storeToRefs(authStore)

const remainingSession = computed((): number => {
  let max = 3_600
  let remaining = ((expiresIn.value || 0) / max) * 100
  // console.info(`remaining`, remaining)
  return remaining
})

const fullyUsable = computed(() => isAuthorized.value)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // kudos: https://stackoverflow.com/a/57795518/810944
    theme.global.name.value = e.matches ? "darkTheme" : "lightTheme"
});
</script>
