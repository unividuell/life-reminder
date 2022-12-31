<template>
  <v-card class="mx-auto" outlined prepend-icon="mdi-calendar">
    <template v-slot:title>{{ event.title }}</template>
    <v-progress-linear
        :color="getColor"
        :value="remainingTime"
        :striped="event.closed ? false : true"
        :reverse="currentlyInRedZone ? true : false"
        height="15">
      <strong v-if="currentlyInRedZone">{{ redZoneDaysLeft }} of {{ redZoneDurationInDays }} days left to perform task</strong>
      <strong v-if="currentlyBeforeRedZone">{{ redZoneStartDaysLeft }} days before task starts</strong>
    </v-progress-linear>
    <v-card-title class="headline">{{ endLabel }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.note }}</v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="setEventState('close')" v-if="! event.closed">
        Finish
      </v-btn>
      <v-btn @click="setEventState('re-open')" v-else>
        Re-Open
      </v-btn>
      <v-btn @click="editEvent">
        Edit
      </v-btn>
      <v-btn @click="deleteEvent">
        Delete
      </v-btn>
    </v-card-actions>
    <DeleteEvent ref="deleteEvent" v-bind:key="'delete_'+event.googleId" :event="event" v-on:reload="$emit('reload')" />
    <SetEventState ref="setEventState" v-bind:key="'set-state_'+event.googleId" :event="event" />
    <AddSoftEvent ref="editEvent" v-bind:key="'edit_'+event.googleId" :event="event" />
  </v-card>
</template>

<script>
import { formatDistanceToNow, isFuture, isWithinInterval, eachDayOfInterval, differenceInCalendarDays } from 'date-fns'
import DeleteEvent from "@/components/DeleteEvent.vue";
import SetEventState from "@/components/SetEventState.vue";
import AddSoftEvent from "@/components/AddSoftEvent.vue";

export default {
  name: "LifeEvent",
  components: {AddSoftEvent, SetEventState, DeleteEvent},
  props: ["event"],
  data: () => ({
    now: new Date(),
    isLoading: false,
  }),
  computed: {
    endLabel() {
      let ownPrefix = isFuture(this.event.redZone.end) ? 'ends' : 'ended'
      return `${ownPrefix} ${formatDistanceToNow(this.event.redZone.end, {addSuffix: true})}`
    },
    remainingTime() {
      if (! this.currentlyInRedZone) {
        // we are currently not in this red-zone
        if (isFuture(this.event.redZone.start)) {
          //interval between now and start of event/365...
          var progress = 100-differenceInCalendarDays(this.event.redZone.start, this.now)/365*100
          return progress
        } else {
          //past Events
          return 100
        }
      }
      //in red-zone
      return (this.redZoneDaysLeft / this.redZoneDurationInDays) * 100
    },
    getColor(){
      if(this.event.closed){
        return 'green'
      } else {
        if(this.currentlyInRedZone){
          return 'pink'
        } else {
          return 'blue'
        }
      } 
    },
    redZoneDurationInDays() {
      return eachDayOfInterval({start: this.event.redZone.start, end: this.event.redZone.end}).length
    },
    redZoneDaysLeft() {
      return differenceInCalendarDays(this.event.redZone.end, this.now)
    },
    redZoneStartDaysLeft() {
      return differenceInCalendarDays(this.event.redZone.start, this.now)
    },
    currentlyInRedZone() {
      return isWithinInterval(this.now, {start: this.event.redZone.start, end: this.event.redZone.end})
    },
    currentlyBeforeRedZone() {
      return (!this.currentlyInRedZone && isFuture(this.event.redZone.start))
    },
    currentlyOverDue() {
      return (!this.currentlyInRedZone && !isFuture(this.event.redZone.end))
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