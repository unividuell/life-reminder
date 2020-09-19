<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4" v-if="isAuthenticated">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome
        </h1>

        <p class="subheading font-weight-regular">Your calendars:</p>

        <v-chip
            class="ma-2"
            color="primary"
            v-for="calendar in calendars" :key="calendar.id"
        >
          {{ calendar.summary }}
        </v-chip>

      </v-col>
      <v-col cols="12" v-else>Please log in.</v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    calendarId: {
      type: String,
      required: false,
      default: "primary"
    }
  },

  data: () => ({
    currentUser: null,
    googleCalendarApi: null,
    calendars: null
  }),
  async created() {
    if (this.isAuthenticated) {
      this.initBackend()
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.state.authenticated
    }
  },
  watch: {
    async isAuthenticated(newValue, oldValue) {
      if (!oldValue && newValue) {
        this.initBackend()
      } else {
        this.calendars = null
      }
    }
  },
  methods: {
    initBackend() {
      if (this.isAuthenticated) {
        this.currentUser = this.$gapi.getUserData()
        this.createCalendarBackend()
        this.calendars = this.retrieveCalendars()
      }
    },
    retrieveCalendars() {
      this.$gapi.getGapiClient().then((gapi) => {
        let maxResults = 10
        gapi.client.calendar.calendarList.list({
          maxResults
        }).execute((resp) => {
          this.calendars = resp.items.map(it => ({
            id: it.id,
            summary: it.summary
          }))
        })
      })
    },
    createCalendarBackend() {
      this.$gapi.getGapiClient().then((gapi) => {
        let calendarId = 'Live Reminder by unividuell.org'
        gapi.client.calendar.calendars.get({
          calendarId
        }).then(
            () => {
              console.log("all fine - calendar exists")
            },
            (err) => {
              if (err.status === 404) {
                console.log("lets create it")
              }
            }
        )
      })
    },
  }
}
</script>
