<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">
        <v-img
            alt="Life Reminder Logo"
            class="shrink mr-2"
            contain
            src="./assets/logo.png"
            transition="scale-transition"
            width="40"
        />

        <h1 class="hidden-sm-and-down">Life Reminder</h1>
      </div>
      <v-spacer></v-spacer>

      <v-btn v-if="isAuthenticated" @click="addEvent" text>New Event</v-btn>

      <v-avatar v-if="isAuthenticated">
        <img
            :src="this.$gapi.getUserData().imageUrl"
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
      <v-btn
          v-else
          @click="signIn"
          text
      >
        <span class="mr-2">Login</span>
        <v-icon>mdi-login</v-icon>
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
    <AddSoftEvent ref="addSoftEvent" v-on:softEventAdded="onEventAdded"></AddSoftEvent>
    <v-main>
      <Main ref="main" v-on:loading="onLoading"/>
    </v-main>
  </v-app>
</template>

<script>
import Main from './components/Main';
import AddSoftEvent from "@/components/AddSoftEvent";

export default {
  name: 'App',

  components: {
    Main,
    AddSoftEvent
  },

  data: () => ({
    currentUser: null,
    loading: true
  }),
  created() {
    if (this.$gapi.isAuthenticated()) {
      this.$store.commit('setAuthenticated', true)
      this.currentUser = this.$gapi.getUserData()
    }

    try {
      // NOTE: Google recommends 45 min refresh policy
      window.setInterval(this.$gapi.refreshToken(), 1000 * 60 * 45);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  },
  methods: {
    signIn() {
      if (!this.$gapi.isAuthenticated()) {
        this.loading = true
        this.$gapi
            .login(
                () => {
                  this.$store.commit('setAuthenticated', true)
                  this.currentUser = this.$gapi.getUserData()
                  this.loading = false
                },
                (err) => {
                  console.error(err)
                })
      }
    },
    signOut() {
      if (this.$gapi.isAuthenticated()) {
        this.$gapi.logout(
            () => {
              this.$store.commit('setAuthenticated', false)
              this.currentUser = null
            },
            (err) => {
              console.error(err.message)
            })
      }
    },
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    onEventAdded() {
      this.$refs.main.onEventAdded()
    },
    onLoading(value) {
      this.loading = value
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.state.authenticated
    }
  }
};
</script>
