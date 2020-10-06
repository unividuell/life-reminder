<template>
 <v-container>
   <h2>Your Life Reminder Events</h2>
   <v-container>
     <v-expansion-panels multiple v-model="panel">
       <v-expansion-panel>
         <v-expansion-panel-header>Past events</v-expansion-panel-header>
         <v-expansion-panel-content>
           <v-row dense>
             <v-col
                 cols="12" xs="12" md="6"
                 v-for="event in pastEvents"
                 :key="event.id">
               <v-card class="mx-auto">
                 <v-card-title class="headline">{{ event.title }}</v-card-title>
                 <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
                 <v-card-text>{{ event.description }}</v-card-text>
               </v-card>
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
               <v-card class="mx-auto">
                 <v-card-title class="headline">{{ event.title }}</v-card-title>
                 <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
                 <v-card-text>{{ event.description }}</v-card-text>
               </v-card>
             </v-col>
           </v-row>
         </v-expansion-panel-content>
       </v-expansion-panel>
     </v-expansion-panels>
   </v-container>
 </v-container>
</template>

<script>
export default {
  name: "LifeEventsListView",
  props: ["gEvents"],
  data: () => ({
    now: new Date(),
    panel: [1]
  }),
  computed: {
    calendarId() {
      return this.$store.state.calendarBackendId
    },
    events() {
      return this.gEvents.map((gEvent) => ({
        id: gEvent.id,
        title: gEvent.summary,
        redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
        note: gEvent.description
      }))
      .sort((a, b) => a.redZone.start - b.redZone.end)
    },
    pastEvents() {
      return this.events.filter((candidate) => candidate.redZone.end < this.now)
    },
    nextMonthEvents() {
      return this.events.filter((candidate) => candidate.redZone.end > this.now)
    }
  }
}
</script>

<style scoped>

</style>