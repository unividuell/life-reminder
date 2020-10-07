<template>
  <v-card class="mx-auto" outlined>
    <v-app-bar flat color="deep-purple darken-2" dark>
      <v-icon>mdi-calendar</v-icon>

      <v-toolbar-title class="title pl-4">
        {{ event.title }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-menu
          bottom
          left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
              dark
              icon
              v-bind="attrs"
              v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="deleteDialog = true">
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-progress-linear
        color="pink"
        v-model="remainingTime"
        reverse
        height="25">
      <strong v-if="currentlyInRedZone">{{ redZoneDaysLeft }} of {{ redZoneDurationInDays }} days left</strong>
    </v-progress-linear>
    <v-card-title class="headline">{{ endLabel }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.description }}</v-card-text>
    <template>
      <v-row justify="center">
        <v-dialog
            v-model="deleteDialog"
            persistent
            max-width="290">
          <v-card>
            <v-card-title class="headline">
              Really delete Event <b>{{ event.title }}</b>?
            </v-card-title>
            <v-card-text>Do you really want to delete this event?</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="green darken-1"
                  text
                  @click="deleteDialog = false">Disagree</v-btn>
              <v-btn
                  color="green darken-1"
                  text
                  @click="onDelete">Agree</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </template>
  </v-card>
</template>

<script>
import { formatDistanceToNow, isFuture, isWithinInterval, eachDayOfInterval, differenceInCalendarDays } from 'date-fns'

export default {
  name: "LifeEvent",
  props: ["event"],
  data: () => ({
    now: new Date(),
    isLoading: false,
    deleteDialog: false
  }),
  computed: {
    endLabel() {
      let ownPrefix = isFuture(this.event.redZone.end) ? 'ends' : 'ended'
      return `${ownPrefix} ${formatDistanceToNow(this.event.redZone.end, {addSuffix: true})}`
    },
    remainingTime() {
      if (! this.currentlyInRedZone) {
        // we are currently not in this red-zone
        if (isFuture(this.event.redZone.end)) {
          return 100
        } else {
          return 0
        }
      }

      return (this.redZoneDaysLeft / this.redZoneDurationInDays) * 100
    },
    redZoneDurationInDays() {
      return eachDayOfInterval({start: this.event.redZone.start, end: this.event.redZone.end}).length
    },
    redZoneDaysLeft() {
      return differenceInCalendarDays(this.event.redZone.end, this.now)
    },
    currentlyInRedZone() {
      return isWithinInterval(this.now, {start: this.event.redZone.start, end: this.event.redZone.end})
    },
    calendarId() {
      return this.$store.state.calendarBackendId
    }
  },
  methods: {
    async onDelete() {
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${this.event.googleId}`,
        method: 'DELETE'
      })
      .then(() => {
        this.$emit('reload')
      })
      .catch(err => {
        console.log(err)
      })
      this.isLoading = false
      this.deleteDialog = false
    }
  },
  watch: {
    isLoading(newValue) {
      this.$emit('loading', newValue)
    }
  }
}
</script>

<style scoped>

</style>