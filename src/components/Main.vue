<template>
  <v-container>
    <template v-if="isLoading">
      <v-container>
        <v-layout justify-center align-center>
          <v-progress-circular
              indeterminate
              color="primary"
              :size="70">
          </v-progress-circular>
        </v-layout>
      </v-container>
    </template>

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
          {{ calendar.summary }} [{{ calendar.id }}]
        </v-chip>

      </v-col>
      <v-col cols="12" v-else>Please log in.</v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Main',
  props: {
    calendarId: {
      type: String,
      required: false,
      default: "primary"
    }
  },

  data: () => ({
    currentUser: null,
    calendars: null,
    isLoading: false
  }),
  async mounted() {
    if (this.isAuthenticated) {
      await this.initBackend()
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
        await this.initBackend()
      } else {
        this.calendars = null
      }
    }
  },
  methods: {
    async initBackend() {
      this.isLoading = true
      if (this.isAuthenticated) {
        await this.createCalendarBackend()
        this.calendars = this.retrieveCalendars()
        this.currentUser = this.$gapi.getUserData()
      }
      this.isLoading = false
    },
    async retrieveCalendars() {
      this.$gapi.getGapiClient().then((gapi) => {
        let maxResults = 10
        gapi.client.calendar.calendarList.list({
          maxResults: maxResults
        }).execute((resp) => {
          this.calendars = resp.items.map(it => ({
            id: it.id,
            summary: it.summary
          }))
        })
      })
    },
    async createCalendarBackend() {
      this.$gapi.getGapiClient().then((gapi) => {
        let calendarId = 'Live Reminder by unividuell.org'
        gapi.client.calendar.calendarList.list()
          .then(
            (resp) => {
              let present = resp.result.items.some((candidate) => {
                if (candidate.summary === calendarId) {
                  this.$store.commit('setCalendarBackendId', candidate.id)
                  console.log(`Calendar with summary ${calendarId} is present: ${candidate.id}`)
                  return true
                }
                return false
              })
              if (!present) {
                console.log("Did not found our calendar-backend - will create it..")
                gapi.client.calendar.calendars.insert({
                  summary: calendarId
                }).then(
                    (resp) => {
                      this.$store.commit('setCalendarBackendId', resp.result.id)
                      console.log("created life-reminder calendar-backend")
                    },
                    (err) => {
                      console.warn("could not create life-reminder calender-backend:", err)
                    }
                )
              }
            },
            (err) => {
              console.warn("could not list all calendars:", err)
            }
        )
      })
    },
  }
}
</script>
