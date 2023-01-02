<template>
 <v-container fluid>
   <v-row>
     <v-col cols="12" md="4">
       <v-card>
         <v-card-text>
           <v-row>
             <v-col cols="12" sm="6" md="12" class="mx-auto">
               <v-switch
                   label="Show cleared"
                   v-model="includeClearedEvents"
                   density="compact"
                   hide-details
               />
             </v-col>
             <v-col cols="12" sm="6" md="12" class="mx-auto">
               <v-switch
                   label="Show upcoming"
                   v-model="includeUpcomingEvents"
                   density="compact"
                   hide-details
               />
             </v-col>
             <v-col cols="12" sm="12" md="12" class="mx-auto">
               <v-select
                   label="Sort by"
                   :items="sortByOptions"
                   item-title="text"
                   item-value="key"
                   v-model="sortBy"
                   density="compact"
               />
             </v-col>
           </v-row>
         </v-card-text>
       </v-card>
     </v-col>
     <v-col cols="12" md="8">
       <v-card class="mx-auto" :loading="loading">
         <v-list>
           <v-list-item
               v-for="event in events"
               :key="event.id"
               color="primary"
               :active="currentlyInRedZone(event) && !event.closed"
           >
             <template v-slot:prepend>
               <v-list-item-action start>
                  <!-- kudos: https://github.com/vuetifyjs/vuetify/issues/13026#issuecomment-977035686 -->
                 <v-checkbox-btn :model-value="event.closed" @update:model-value="(changed) => value = changed" @change="toggleEventState(event)" />
               </v-list-item-action>
             </template>

             <v-list-item-title :class="event.closed ? 'text-decoration-line-through' : ''">
               <v-row>
                 <v-col cols="10">
                  {{event.title}}
                 </v-col>
                 <v-col cols="2" class="text-end">
                  <v-chip v-if="currentlyInRedZone(event) && !event.closed" color="red" size="x-small">{{ redZoneDaysLeft(event) }} / {{ redZoneDurationInDays(event) }}</v-chip>
                 </v-col>
               </v-row>
             </v-list-item-title>

             <v-list-item-subtitle>
               Clear until {{ event.redZone.end.toLocaleDateString() }} (starting at {{ event.redZone.start.toLocaleDateString() }})
             </v-list-item-subtitle>

             <v-progress-linear
                 v-if="currentlyInRedZone(event) && !event.closed"
                 :model-value="remainingTime(event)"
                 color="red"
                 :striped="event.closed ? false : true"
                 :reverse="true"
                 :height="6"
                 class="mt-2"
             />

             <template v-slot:append>
               <v-tooltip location="bottom" v-if="event.note !== undefined">
                 <template v-slot:activator="{ props }">
                   <v-icon v-bind="props">mdi-message</v-icon>
                 </template>
                 <span style="white-space: pre-line;">{{event.note}}</span>
               </v-tooltip>
               <v-btn @click="editEvent(event)" icon="mdi-pencil" variant="text" :class="event.note === undefined ? 'ms-14' : ''" />
               <v-btn @click="deleteEvent(event)" icon="mdi-delete" variant="text" />
             </template>
           </v-list-item>
         </v-list>
       </v-card>
     </v-col>
   </v-row>
 </v-container>
</template>

<script>
import LifeEvent from "@/components/LifeEvent.vue";
import {mapActions, mapState} from "pinia";
import {useGoogleCalendarStore} from "@/stores/GoogleCalendarStore";
import {useDialogStore} from "../stores/DialogStore";
import {differenceInCalendarDays, eachDayOfInterval, isFuture, isWithinInterval} from "date-fns";

export default {
  name: "LifeEventsListView",
  components: {LifeEvent},
  data: () => ({
    now: new Date(),
    loading: false,
    includeClearedEvents: false,
    includeUpcomingEvents: false,
    sortByOptions: [{ key: 'end', text: 'end date'}, {key: 'start', text: 'start date'}],
    sortBy: 'end'
  }),
  computed: {
    ...mapState(useGoogleCalendarStore, ['sortedEvents']),
    events() {
      return this
          .sortedEvents(this.sortBy)
          .filter(e => {
            if (this.includeClearedEvents) return e
            else return e.closed === false
          })
          .filter(e => {
            if (this.includeUpcomingEvents && isFuture(e.redZone.start)) return true
            if (! this.includeUpcomingEvents && isFuture(e.redZone.start)) return false
            if (this.includeUpcomingEvents && !isFuture(e.redZone.start)) return true
            if (! this.includeUpcomingEvents && !isFuture(e.redZone.start)) return true
          })
    }
  },
  methods: {
    currentlyInRedZone(event) {
      return isWithinInterval(this.now, {start: event.redZone.start, end: event.redZone.end})
    },
    deleteEvent(event) {
      this.handleEventDeletion(event)
    },
    toggleEventState(event) {
      let desiredState = event.closed ? 're-open' : 'close'
      this.setEventState(event, desiredState)
    },
    setEventState(event, desiredState) {
      this.handleEventState(event, desiredState)
    },
    editEvent(event) {
      this.handleEventEditing(event)
    },
    remainingTime(event) {
      if (! this.currentlyInRedZone(event)) {
        // we are currently not in this red-zone
        if (isFuture(event.redZone.start)) {
          //interval between now and start of event/365...
          let progress = 100 - differenceInCalendarDays(event.redZone.start, this.now) / 365 * 100;
          console.log(progress, '<- for future')
          return progress
        } else {
          //past Events
          return 100
        }
      }
      //in red-zone
      return (this.redZoneDaysLeft(event) / this.redZoneDurationInDays(event)) * 100
    },
    getColor(event){
      if(event.closed){
        return 'green'
      } else {
        if(this.currentlyInRedZone(event)){
          return 'pink'
        } else {
          return 'blue'
        }
      }
    },
    redZoneDaysLeft(event) {
      return differenceInCalendarDays(event.redZone.end, this.now)
    },
    redZoneDurationInDays(event) {
      return eachDayOfInterval({start: event.redZone.start, end: event.redZone.end}).length
    },

    ...mapActions(useDialogStore, ['handleEventState', 'handleEventDeletion', 'handleEventEditing'])
  }
}
</script>

<style scoped>

</style>