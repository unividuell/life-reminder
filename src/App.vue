<template>
  <v-app>
    <AppBar />

    <v-main>
      <Main v-if="isAuthenticated" ref="main" />

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

const store = useGoogleAuthenticationStore()
const loading = ref(false)
const { isAuthenticated } = storeToRefs(store)

</script>
