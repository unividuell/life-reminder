<template>
  <v-app-bar
      app
      color="primary"
      dark
  >
    <v-app-bar-nav-icon><v-icon size="32">mdi-account-check</v-icon></v-app-bar-nav-icon>
    <v-app-bar-title>Life Reminder 3000</v-app-bar-title>

    <template v-slot:append v-if="authenticated">
      <v-btn @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>
      <v-avatar>
        <img
            :src="this.currentUser.picture"
            alt="Profile Picture"
            :height="42"
            :width="42"
        >
      </v-avatar>
      <v-btn @click="logout" text>
        <span class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </template>
    <template v-slot:append v-if="!authenticated">
      <GoogleLogin>Login</GoogleLogin>
    </template>
  </v-app-bar>
</template>

<script>
import {mapActions, mapState} from "pinia";
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import AddSoftEvent from "./AddSoftEvent.vue";
import GoogleLogin from "./GoogleLogin.vue";
import {useDialogStore} from "../stores/DialogStore";

export default {
  name: "AppBar",
  components: {
    AddSoftEvent,
    GoogleLogin
  },
  data: () => ({
  }),
  computed: {
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'currentUser']),
  },
  methods: {
    ...mapActions(useGoogleAuthenticationStore, ['logout']),
    ...mapActions(useDialogStore, ['handleEventAdding']),
    addEvent() {
      this.handleEventAdding()
    },
  }
}
</script>

<style scoped>

</style>