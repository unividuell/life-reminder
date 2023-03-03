<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-progress-linear :model-value="remainingSession" :height="2" />
      <Main v-if="isAuthorized && !needsTokenRefresh" />
      <GoogleSessionRefresh v-if="needsTokenRefresh" />

      <AddSoftEvent />
      <SetEventState />
      <DeleteEvent />

    </v-main>
  </v-app>
</template>

<script setup>
import Main from './components/Main.vue';
import {mapState, storeToRefs} from "pinia";
import AppBar from "./components/AppBar.vue";
import SetEventState from "./components/SetEventState.vue";
import DeleteEvent from "./components/DeleteEvent.vue";
import AddSoftEvent from "./components/AddSoftEvent.vue";
import {computed, ref} from "vue";
import {useGoogleAuthorizationStore} from "./stores/GoogleAuthorizationStore";
import GoogleSessionRefresh from "./components/GoogleSessionRefresh.vue";

const authorizationStore = useGoogleAuthorizationStore()

const loading = ref(false)
const { isAuthorized, needsTokenRefresh, expiresIn } = storeToRefs(authorizationStore)

const remainingSession = computed(() => {
  let max = 3_600
  let remaining = (expiresIn.value / max) * 100
  // console.info(`remaining`, remaining)
  return remaining
})
</script>
