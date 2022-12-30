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
import LifeEventsListView from "@/components/LifeEventsListView.vue";
import {mapState, mapWritableState} from "pinia";
import { useGoogleAuthenticationStore } from "@/stores/GoogleAuthenticationStore.js";

export default {
  name: 'Main',
  components: {LifeEventsListView},
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
    ...mapState(useGoogleAuthenticationStore, ['authenticated', 'calendarBackendId']),
    ...mapWritableState(useGoogleAuthenticationStore, ['loading']),
    isAuthenticated() {
      return this.authenticated
    },
    calendarId() {
      return this.calendarBackendId
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
      this.loading = newValue
    }
  },
  methods: {
    async init() {
      this.isLoading = true
      // this.$gapi.currentUser()
      //     .then(user => this.currentUser = user)
      // if (this.isAuthenticated) {
      //   await this.createCalendarBackend()
      //   await this.loadEvents()
      // }
      this.isLoading = false
    },
    async loadEvents() {
      this.isLoading = true
      // await this.$gapi.request({
      //   path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
      //   method: 'GET'
      // })
      // .then((resp) => {
      //   this.events = resp.result.items.map((gEvent) => ({
      //     googleId: gEvent.id,
      //     title: gEvent.summary,
      //     redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
      //     note: gEvent.description,
      //     closed: gEvent.transparency === "transparent"
      //   }))
      // }).catch((err) => {
      //   console.log(err)
      // })
      this.isLoading = false
    },
    async createCalendarBackend() {
      this.isLoading = true
      let calendarId = 'Live Reminder by unividuell.org'
      // await this.$gapi.request({
      //   path: `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
      //   method: 'GET'
      // })
      // .then(
      //   (resp) => {
      //     return resp.result.items.some((candidate) => {
      //       if (candidate.summary === calendarId) {
      //         this.calendarId = candidate.id
      //         console.log(`Calendar with summary ${calendarId} is present: ${candidate.id}`)
      //         return true
      //       }
      //       return false
      //     })
      //   }
      // )
      // .then(
      //   (present) => {
      //     if (! present) {
      //       console.log("Did not found our calendar-backend - will create it..")
      //       return this.$gapi.request({
      //         path: `https://www.googleapis.com/calendar/v3/calendars`,
      //         method: 'POST',
      //         body: {
      //           summary: calendarId
      //         }
      //       })
      //     } else {
      //       // sooo ugly :/ don't know how to better break a promise chain
      //       throw new Error("expected")
      //     }
      //   }
      // )
      // .then(
      //   (resp) => {
      //     this.calendarId = resp.result.id
      //     console.log("created life-reminder calendar-backend")
      //     return true
      //   }
      // )
      // .then(() => console.log("last then"))
      // .catch(
      //     (err) => (err.message !== "expected")
      //         ? console.warn("could not create life-reminder calender-backend:", err)
      //         : console.log("all done.")
      // )
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
