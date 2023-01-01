<template>
 <v-container>
   <v-card class="mx-auto">
     <v-list>
       <v-list-item
           v-for="event in items"
           :key="event.id"
           color="primary"
           :active="currentlyInRedZone(event)"
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
           <v-btn @click="editEvent(event)" icon="mdi-pencil" variant="text" />
           <v-btn @click="deleteEvent(event)" icon="mdi-delete" variant="text" />
         </template>
       </v-list-item>
     </v-list>
   </v-card>

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
    test: []
  }),
  computed: {
    ...mapState(useGoogleCalendarStore, ['sortedEvents', 'pastEvents', 'nextMonthEvents', 'futureEvents']),
    items() {
      return this
          .sortedEvents
          .map(e => ({...e, isSelected: e.closed}))
          .reverse()
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