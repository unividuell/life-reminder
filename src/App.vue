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
          @click="signOut"
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
            <GoogleLogin :callback="signIn" prompt/>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Main from '@/components/Main.vue';
import AddSoftEvent from "@/components/AddSoftEvent.vue";
import { useGoogleLoginStore } from "@/stores/main.js";
import {mapState, mapWritableState} from "pinia";
import { decodeCredential } from 'vue3-google-login'
import { googleLogout } from "vue3-google-login"

export default {
  name: 'App',

  components: {
    Main,
    AddSoftEvent,
  },

  data: () => ({
    isLoading: false,
  }),
  methods: {
    signIn(response) {
      // decodeCredential will retrive the JWT payload from the credential
      const userData = decodeCredential(response.credential)
      this.isAuthenticated = true
      this.currentUser = userData
    },
    signOut() {
      this.currentUser = null
      googleLogout()
    },
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    reload() {
      this.$refs.main.reload()
    }
  },
  computed: {
    ...mapWritableState(useGoogleLoginStore, ['authenticated', 'loading', 'currentUser']),
    isAuthenticated () {
      return this.authenticated
    },
  },
  watch: {
    isLoading(newValue) {
      this.loading = newValue
    }
  }
};
</script>
