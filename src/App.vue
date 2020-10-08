<template>
  <v-app>
    <v-app-bar
        app
        color="primary"
        dark
    >
      <div class="d-flex align-center">
        <v-icon size="32">mdi-account-check</v-icon>

        <h1 class="hidden-sm-and-down pl-4">Life Reminder</h1>
      </div>
      <v-spacer></v-spacer>

      <v-btn v-if="isAuthenticated" @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>

      <v-avatar v-if="isAuthenticated">
        <img
            :src="this.currentUser.image"
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
    <AddSoftEvent ref="addSoftEvent" v-bind:key="'add-event-app'" v-on:reload="reload"></AddSoftEvent>
    <v-main>
      <Main ref="main" />
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
    isLoading: false
  }),
  created() {
    this.$gapi.isSignedIn()
      .then((result) => {
        if (result) {
          this.$store.commit('setAuthenticated', true)
        }
      })
    this.$gapi.currentUser()
      .then(user => this.currentUser = user)
  },
  methods: {
    signIn() {
      if (!this.isAuthenticated) {
        this.isLoading = true
        this.$gapi.signIn()
            .then((user) => {
              this.$store.commit('setAuthenticated', true)
              this.currentUser = user
            })
            .catch((err) => {
              console.error(err)
            })
        this.isLoading = false
      }
    },
    signOut() {
      if (this.isAuthenticated) {
        this.isLoading = true
        this.$gapi.signOut()
            .then(() => {
              this.$store.commit('setAuthenticated', false)
              this.currentUser = null
            })
            .catch((err) => {
              console.error(err.message)
            })
        this.isLoading = false
      }
    },
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    reload() {
      this.$refs.main.reload()
    }
  },
  computed: {
    isAuthenticated () {
      return this.$store.state.authenticated
    },
    loading() {
      return this.$store.state.loading
    }
  },
  watch: {
    isLoading(newValue) {
      this.$store.commit('setLoading', newValue)
    }
  }
};
</script>
