<template>
  <v-container>
    <template v-if="isAuthenticated">
      <v-row>
        <v-col class="mb-4">
          <LifeEventsListView
              :events="events"
              v-on:reload="reload"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <AddSoftEvent
              ref="addSoftEvent"
              v-bind:key="'add-event-main'"
              v-on:reload="reload"/>
          <v-btn @click="addEvent">New Event</v-btn>
        </v-col>
      </v-row>
    </template>
    <template v-else>
      <v-row>
        <v-col cols="12">
          <p class="text-center">Please log in.</p>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import AddSoftEvent from "@/components/AddSoftEvent";
import LifeEventsListView from "@/components/LifeEventsListView";
export default {
  name: 'Main',
  components: {LifeEventsListView, AddSoftEvent},
  data: () => ({
    currentUser: null,
    isLoading: false,
    events: []
  }),
  async mounted() {
    if (this.isAuthenticated) {
      await this.init()
    }
  },
  computed: {
    isAuthenticated() {
      return this.$store.state.authenticated
    },
    calendarId() {
      return this.$store.state.calendarBackendId
    }
  },
  watch: {
    async isAuthenticated(newValue, oldValue) {
      if (!oldValue && newValue) {
        await this.init()
      } else {
        this.events = []
      }
    },
    isLoading(newValue) {
      this.$store.commit('setLoading', newValue)
    }
  },
  methods: {
    async init() {
      this.isLoading = true
      this.$gapi.currentUser()
          .then(user => this.currentUser = user)
      if (this.isAuthenticated) {
        await this.createCalendarBackend()
        await this.loadEvents()
      }
      this.isLoading = false
    },
    async loadEvents() {
      this.isLoading = true
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        method: 'GET'
      })
      .then((resp) => {
        this.events = resp.result.items.map((gEvent) => ({
          googleId: gEvent.id,
          title: gEvent.summary,
          redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
          note: gEvent.description,
          closed: gEvent.transparency === "transparent"
        }))
      }).catch((err) => {
        console.log(err)
      })
      this.isLoading = false
    },
    async createCalendarBackend() {
      this.isLoading = true
      let calendarId = 'Live Reminder by unividuell.org'
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
        method: 'GET'
      })
      .then(
        (resp) => {
          return resp.result.items.some((candidate) => {
            if (candidate.summary === calendarId) {
              this.$store.commit('setCalendarBackendId', candidate.id)
              console.log(`Calendar with summary ${calendarId} is present: ${candidate.id}`)
              return true
            }
            return false
          })
        }
      )
      .then(
        (present) => {
          if (! present) {
            console.log("Did not found our calendar-backend - will create it..")
            return this.$gapi.request({
              path: `https://www.googleapis.com/calendar/v3/calendars`,
              method: 'POST',
              body: {
                summary: calendarId
              }
            })
          } else {
            // sooo ugly :/ don't know how to better break a promise chain
            throw new Error("expected")
          }
        }
      )
      .then(
        (resp) => {
          this.$store.commit('setCalendarBackendId', resp.result.id)
          console.log("created life-reminder calendar-backend")
          return true
        }
      )
      .then(() => console.log("last then"))
      .catch(
          (err) => (err.message !== "expected")
              ? console.warn("could not create life-reminder calender-backend:", err)
              : console.log("all done.")
      )
      this.isLoading = false
    },
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    reload() {
      this.loadEvents()
    }
  }
}
</script>
