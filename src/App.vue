<template>
  <v-app>
    <AppBar />

    <v-main>
      <Main v-if="isAuthorized" ref="main" />

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
import {useGoogleAuthenticationStore} from "./stores/GoogleAuthenticationStore";
import {ref} from "vue";
import {useGoogleAuthorizationStore} from "./stores/GoogleAuthorizationStore";

const store = useGoogleAuthorizationStore()
const loading = ref(false)
const { isAuthorized } = storeToRefs(store)

</script>
