<template>
  <v-app>
    <AppBar />

    <v-main>
      <Main v-if="authenticated" ref="main" />

      <AddSoftEvent />
      <SetEventState />
      <DeleteEvent />

    </v-main>
  </v-app>
</template>

<script>
import Main from './components/Main.vue';
import { useGoogleAuthenticationStore } from "./stores/GoogleAuthenticationStore.js";
import { mapState } from "pinia";
import AppBar from "./components/AppBar.vue";
import SetEventState from "./components/SetEventState.vue";
import DeleteEvent from "./components/DeleteEvent.vue";
import AddSoftEvent from "./components/AddSoftEvent.vue";

export default {
  name: 'App',

  components: {
    AddSoftEvent,
    DeleteEvent,
    AppBar,
    Main,
    SetEventState
  },

  data: () => ({
    loading: false,
  }),
  computed: {
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'currentUser']),
  }
};
</script>
