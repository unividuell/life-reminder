<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">
        <v-icon size="32">mdi-account-check</v-icon>

        <h1 class="hidden-sm-and-down pl-4">Life Reminder 3000</h1>
      </div>
      <v-spacer></v-spacer>

      <v-btn v-if="isAuthenticated" @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>

      <v-avatar v-if="isAuthenticated">
        <img
            :src="this.currentUser.picture"
            alt="Profile Picture"
        >
      </v-avatar>

      <v-btn
          v-if="isAuthenticated"
          @click="logout"
          text
      >
        <span class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>

      <v-progress-linear
          :active="loading"
          :indeterminate="loading"
          absolute
          bottom
          color="deep-orange accent-4"
          height="4"
      ></v-progress-linear>
    </v-app-bar>
    <AddSoftEvent ref="addSoftEvent" v-bind:key="'add-event-app'" v-on:reload="reload"></AddSoftEvent>
    <v-main>
      <Main v-if="isAuthenticated" ref="main" />

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
import AddSoftEvent from "./components/AddSoftEvent.vue";
import { useGoogleAuthenticationStore } from "./stores/GoogleAuthenticationStore.js";
import {mapActions, mapState, mapWritableState} from "pinia";
import GoogleLogin from "./components/GoogleLogin.vue";

export default {
  name: 'App',

  components: {
    GoogleLogin,
    Main,
    AddSoftEvent,
  },

  data: () => ({
    loading: false,
  }),
  methods: {
    ...mapActions(useGoogleAuthenticationStore, ['logout']),
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    reload() {
      this.$refs.main.reload()
    }
  },
  computed: {
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'currentUser']),
    isAuthenticated () {
      return this.authenticated
    },
  }
};
</script>
