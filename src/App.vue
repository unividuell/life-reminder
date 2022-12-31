<template>
  <v-app>
    <AppBar />

    <v-main>
      <Main v-if="authenticated" ref="main" />

      <v-container v-else>
        <v-row>
          <v-col cols="12">
            <GoogleLogin />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Main from './components/Main.vue';
import { useGoogleAuthenticationStore } from "./stores/GoogleAuthenticationStore.js";
import { mapState } from "pinia";
import GoogleLogin from "./components/GoogleLogin.vue";
import AppBar from "./components/AppBar.vue";

export default {
  name: 'App',

  components: {
    AppBar,
    GoogleLogin,
    Main,
  },

  data: () => ({
    loading: false,
  }),
  computed: {
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'currentUser']),
  }
};
</script>
