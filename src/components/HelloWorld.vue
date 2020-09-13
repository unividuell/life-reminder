<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Agira
        </h1>

        <p class="subheading font-weight-regular">Just do it!</p>

        <v-btn v-if="! isAuthenticated" @click="signIn">Sign In</v-btn>
        <v-btn v-else @click="signOut">Sign Out</v-btn>

        <template v-if="isAuthenticated">
          <p>{{currentUser.email}}</p>
          <p>{{currentUser.fullName}}</p>
<!--          <button @click="listEvents">List Events</button>-->
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      currentUser: null,
      isAuthenticated: false,
    }),
    methods: {
      signIn() {
        if (! this.$gapi.isAuthenticated()) {
          this.$gapi
              .login(
                  () => {
                    this.isAuthenticated = true
                    this.currentUser = this.$gapi.getUserData()
                    console.log("User logged in:", this.currentUser)
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
                this.isAuthenticated = false
                this.currentUser = null
                console.log("User disconnected.")
              },
              (err) => {
                console.error(err.message)
              })
        }
      }
    },
    created() {
      this.isAuthenticated = this.$gapi.isAuthenticated()
      if (this.isAuthenticated) {
        this.currentUser = this.$gapi.getUserData()
      }
    }
  }
</script>
