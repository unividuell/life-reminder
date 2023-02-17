<template>
  <v-app>
    <AppBar />

    <v-main>
      <GoogleOneTapLogin />
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
import GoogleOneTapLogin from "./components/GoogleOneTapLogin.vue";

export default {
  name: 'App',

  components: {
    GoogleOneTapLogin,
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
