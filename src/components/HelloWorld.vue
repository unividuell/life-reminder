<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4" v-if="isAuthenticated">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Agira
        </h1>

        <p class="subheading font-weight-regular">Your upcoming TODOs:</p>

      </v-col>
      <v-col cols="12" v-else>Please log in.</v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      currentUser: null,
    }),
    created() {
      if (this.isAuthenticated) {
        this.currentUser = this.$gapi.getUserData()
      }
    },
    computed: {
      isAuthenticated() {
        return this.$store.state.authenticated
      }
    }
  }
</script>
