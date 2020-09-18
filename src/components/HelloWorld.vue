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
        this.currentUser = this.$gapi.getUserData()
        this.calendars = await this.retrieveCalendars()
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
          this.calendars = await this.retrieveCalendars()
        }
      }
    },
    methods: {
      async retrieveCalendars() {
        this.$gapi.getGapiClient().then((gapi) => {
          let maxResults = 10
          gapi.client.calendar.calendarList.list({
            maxResults
          }).execute((resp) => {
            console.log(resp.items)
            this.calendars = resp.items.map(it => ({
              id: it.id,
              summary: it.summary
            }))
          })
        })
      }
    }
  }
</script>
