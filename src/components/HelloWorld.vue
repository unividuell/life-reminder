<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h3>Agira - no more noooi</h3>
    <google-signin-btn v-if="!isSignIn" @click="signIn"></google-signin-btn>
    <google-signin-btn v-else label="Sign Out" @click="signOut"></google-signin-btn>

    <template v-if="isSignIn">
      <p>{{currentUser.email}}</p>
      <p>{{currentUser.name}}</p>
    </template>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      isSignIn: false,
      currentUser: null
    }
  },
  methods: {
    signIn() {
      this.$gapi.signIn()
        .then(user => {
          this.isSignIn = true
          this.currentUser = user
          console.log(user)
        })
        .catch(err => {
          console.error(err.error)
        })
    },
    signOut() {
      this.$gapi.signOut()
        .then(() => {
          this.isSignIn = false
          this.currentUser = null
          console.log("User disconnected.")
        })
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
