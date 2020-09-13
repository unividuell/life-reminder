<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h3>Agira - no more noooi</h3>
    <p>Authenticated: {{isAuthenticated}}</p>
    <p>Current User: {{currentUser}}</p>

    <button v-if="! isAuthenticated" @click="signIn">Sign In</button>
    <button v-else @click="signOut">Sign Out</button>

    <template v-if="isAuthenticated">
      <p>{{currentUser.email}}</p>
      <p>{{currentUser.fullName}}</p>
      <button @click="listEvents">List Events</button>
    </template>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
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
                  console.log("User logged in")
                  this.isAuthenticated = true
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
              this.isAuthenticated = false
              this.currentUser = null
              console.log("User disconnected.")
            },
            (err) => {
              console.error(err.message)
            })
      }
    },
    listEvents() {
      // this.$gapi.request({
      //   path: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      //   method: 'GET'
      // }).then(json => {
      //   json = JSON.stringify(json, undefined, 2);
      //   console.log(json)
      // })
      // .catch(err => {
      //   console.error(err.error)
      // })
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
