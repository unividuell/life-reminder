<template>
  <v-app>
    <AppBar />

    <v-main>
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
import {ref} from "vue";
import {useGoogleAuthorizationStore} from "./stores/GoogleAuthorizationStore";
import GoogleSessionRefresh from "./components/GoogleSessionRefresh.vue";

const authorizationStore = useGoogleAuthorizationStore()

const loading = ref(false)
const { isAuthorized, needsTokenRefresh } = storeToRefs(authorizationStore)

</script>
