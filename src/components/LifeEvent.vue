<template>
  <v-card class="mx-auto" outlined>
    <v-app-bar flat color="deep-purple darken-2" dark>
      <v-icon>mdi-calendar</v-icon>
      <v-toolbar-title class="title pl-4">
        {{ event.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu bottom left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="setEventState('close')" v-if="! event.closed">
            <v-list-item-title>Finish</v-list-item-title>
          </v-list-item>
          <v-list-item @click="setEventState('re-open')" v-else>
            <v-list-item-title>Re-Open</v-list-item-title>
          </v-list-item>
          <v-list-item @click="editEvent">
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-list-item @click="deleteEvent">
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-progress-linear
        :color="event.closed ? 'green' : 'pink'"
        :value="remainingTime"
        reverse
        height="25">
      <strong v-if="currentlyInRedZone">{{ redZoneDaysLeft }} of {{ redZoneDurationInDays }} days left</strong>
    </v-progress-linear>
    <v-card-title class="headline">{{ endLabel }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.note }}</v-card-text>
    <DeleteEvent ref="deleteEvent" v-bind:key="'delete_'+event.googleId" :event="event" v-on:reload="$emit('reload')" />
    <SetEventState ref="setEventState" v-bind:key="'set-state_'+event.googleId" :event="event" v-on:reload="$emit('reload')" />
    <AddSoftEvent ref="editEvent" v-bind:key="'edit_'+event.googleId" :event="event" v-on:reload="$emit('reload')" />
  </v-card>
</template>

<script>
import { formatDistanceToNow, isFuture, isWithinInterval, eachDayOfInterval, differenceInCalendarDays } from 'date-fns'
import DeleteEvent from "@/components/DeleteEvent";
import SetEventState from "@/components/SetEventState";
import AddSoftEvent from "@/components/AddSoftEvent";

export default {
  name: "LifeEvent",
  components: {AddSoftEvent, SetEventState, DeleteEvent},
  props: ["event"],
  data: () => ({
    now: new Date(),
    isLoading: false
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
    deleteEvent() {
      this.$refs.deleteEvent.open(this.event)
    },
    setEventState(desiredState) {
      this.$refs.setEventState.setEventState(desiredState)
    },
    editEvent() {
      this.$refs.editEvent.open(this.event)
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