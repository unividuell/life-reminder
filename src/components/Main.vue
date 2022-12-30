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
