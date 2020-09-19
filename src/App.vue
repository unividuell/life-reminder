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
    </v-app-bar>

    <v-main>
      <Main/>
    </v-main>
  </v-app>
</template>

<script>
import Main from './components/Main';

export default {
  name: 'App',

  components: {
    Main,
  },

  data: () => ({
    currentUser: null
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
        this.$gapi
            .login(
                () => {
                  this.$store.commit('setAuthenticated', true)
                  this.currentUser = this.$gapi.getUserData()
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
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.state.authenticated
    }
  }
};
</script>
