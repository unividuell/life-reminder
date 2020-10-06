<template>
 <v-container>
   <h2>Your Life Reminder Events</h2>
   <v-container>
     <v-expansion-panels accordion multiple v-model="panel">
       <v-expansion-panel>
         <v-expansion-panel-header>Past events</v-expansion-panel-header>
         <v-expansion-panel-content>
           <v-row dense>
             <v-col
                 cols="12" xs="12" md="6"
                 v-for="event in pastEvents"
                 :key="event.id">
               <LifeEvent :event="event" />
             </v-col>
           </v-row>
         </v-expansion-panel-content>
       </v-expansion-panel>
       <v-expansion-panel>
         <v-expansion-panel-header>Next up</v-expansion-panel-header>
         <v-expansion-panel-content>
           <v-row dense>
             <v-col
                 cols="12" xs="12" md="6"
                 v-for="event in nextMonthEvents"
                 :key="event.id">
               <LifeEvent :event="event" />
             </v-col>
           </v-row>
         </v-expansion-panel-content>
       </v-expansion-panel>
       <v-expansion-panel>
         <v-expansion-panel-header>The future</v-expansion-panel-header>
         <v-expansion-panel-content>
           <v-row dense>
             <v-col
                 cols="12" xs="12" md="6"
                 v-for="event in futureEvents"
                 :key="event.id">
               <LifeEvent :event="event" />
             </v-col>
           </v-row>
         </v-expansion-panel-content>
       </v-expansion-panel>
     </v-expansion-panels>
   </v-container>
 </v-container>
</template>

<script>
import { compareAsc, addMonths } from 'date-fns'
import LifeEvent from "@/components/LifeEvent";

export default {
  name: "LifeEventsListView",
  components: {LifeEvent},
  props: ["gEvents"],
  data: () => ({
    now: new Date(),
    panel: [1]
  }),
  computed: {
    calendarId() {
      return this.$store.state.calendarBackendId
    },
    oneMonthAhead() {
      return addMonths(this.now, 1)
    },
    events() {
      return this.gEvents.map((gEvent) => ({
        id: gEvent.id,
        title: gEvent.summary,
        redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
        note: gEvent.description
      }))
      .sort((a, b) => {
        // first criteria: the end date
        let dateSort = compareAsc(a.redZone.end, b.redZone.end)
        if (dateSort !== 0) return dateSort
        // second criteria: the title
        if (a.title > b.title) return 1;
        if (a.title < b.title) return -1;
      })
    },
    pastEvents() {
      return this.events.filter((candidate) => candidate.redZone.end < this.now)
    },
    nextMonthEvents() {
      return this.events.filter((candidate) => candidate.redZone.end > this.now && candidate.redZone.end < this.oneMonthAhead)
    },
    futureEvents() {
      return this.events.filter((candidate) => candidate.redZone.end > this.oneMonthAhead)
    }
  }
}
</script>

<style scoped>

</style>