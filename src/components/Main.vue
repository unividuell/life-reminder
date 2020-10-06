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
    <v-container v-if="isAuthenticated">
      <v-row>
        <v-col class="mb-4">
          <h1 class="display-2 font-weight-bold mb-3 text-center">
            Welcome
          </h1>
          <LifeEventsListView :g-events="events"></LifeEventsListView>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <AddSoftEvent ref="addSoftEvent" v-on:softEventAdded="onEventAdded"></AddSoftEvent>
          <v-btn @click="addEvent">New Event</v-btn>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <p class="text-center">Please log in.</p>
        </v-col>
      </v-row>
    </v-container>
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
    }
  },
  methods: {
    async init() {
      this.isLoading = true
      if (this.isAuthenticated) {
        await this.createCalendarBackend()
        this.currentUser = this.$gapi.getUserData()
        await this.loadEvents()
      }
      this.isLoading = false
    },
    async loadEvents() {
      await this.$gapi.getGapiClient()
          .then((gapi) => {
            return gapi.client.calendar.events.list({
              calendarId: this.calendarId
            })
          }).then((resp) => {
            this.events = resp.result.items
          }).catch((err) => {
            console.log(err)
          })
    },
    onEventAdded() {
      this.loadEvents()
    },
    async createCalendarBackend() {
      let calendarId = 'Live Reminder by unividuell.org'
      await this.$gapi.getGapiClient()
          .then((gapi) => {
            return gapi.client.calendar.calendarList.list()
            }
          )
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
                return this.$gapi.getGapiClient()
              } else {
                // sooo ugly :/ don't know how to better break a promise chain
                throw new Error("expected")
              }
            }
          )
          .then((gapi) => {
            return gapi.client.calendar.calendars.insert({
              summary: calendarId
            })
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
    },
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
  }
}
</script>
