<template>
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

    <v-btn v-if="authenticated" @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>

    <v-avatar v-if="authenticated">
      <img
          :src="this.currentUser.picture"
          alt="Profile Picture"
          :height="42"
          :width="42"
      >
    </v-avatar>

    <v-btn
        v-if="authenticated"
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
  <AddSoftEvent ref="addSoftEvent" v-bind:key="'add-event-app'" />
</template>

<script>
import {mapActions, mapState} from "pinia";
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";

export default {
  name: "AppBar",
  data: () => ({
    loading: false
  }),
  computed: {
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'currentUser']),
  },
  methods: {
    ...mapActions(useGoogleAuthenticationStore, ['logout']),
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
  }
}
</script>

<style scoped>

</style>