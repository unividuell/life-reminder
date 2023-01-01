<template>
 <v-container fluid>
   <v-row>
     <v-col cols="12" md="4">
       <v-card>
         <v-card-text>
           <v-row>
             <v-col cols="12" sm="6" md="12" class="mx-auto">
               <v-switch
                   label="Show cleared items"
                   v-model="includeClearedEvents"
                   density="compact"
                   hide-details
               />
             </v-col>
             <v-col cols="12" sm="6" md="12" class="mx-auto">
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
             <template v-slot:prepend="{ isSelected }">
               <v-list-item-action start>
                 <v-checkbox-btn @click="toggleEventState(event)" :model-value="event.closed"></v-checkbox-btn>
               </v-list-item-action>
             </template>

             <v-list-item-title :class="event.closed ? 'text-decoration-line-through' : ''">{{event.title}}</v-list-item-title>

             <v-list-item-subtitle>
               Clear until {{ event.redZone.end.toLocaleDateString() }} (starting at {{ event.redZone.start.toLocaleDateString() }})
             </v-list-item-subtitle>

             <template v-slot:append>
               <v-tooltip location="bottom" v-if="event.note !== undefined">
                 <template v-slot:activator="{ props }">
                   <v-icon v-bind="props">mdi-message</v-icon>
                 </template>
                 <span style="white-space: pre-line;">{{event.note}}</span>
               </v-tooltip>
               <v-btn @click="editEvent(event)" icon="mdi-pencil" variant="text" />
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
import {isWithinInterval} from "date-fns";

export default {
  name: "LifeEventsListView",
  components: {LifeEvent},
  data: () => ({
    now: new Date(),
    loading: false,
    includeClearedEvents: false,
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
    ...mapActions(useDialogStore, ['handleEventState', 'handleEventDeletion', 'handleEventEditing'])
  }
}
</script>

<style scoped>

</style>