<template>
 <v-container>
   <h2>Your Life Reminder Events</h2>
   <v-container>
     <v-row dense>
       <v-col
           cols="12" xs="12" md="6"
           v-for="event in events"
           :key="event.id">
         <v-card class="mx-auto">
           <v-card-title class="headline">{{ event.title }}</v-card-title>
           <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
           <v-card-text>{{ event.description }}</v-card-text>
         </v-card>
       </v-col>
     </v-row>
   </v-container>
 </v-container>
</template>

<script>
export default {
  name: "LifeEventsListView",
  props: ["gEvents"],
  data: () => ({
  }),
  computed: {
    calendarId() {
      return this.$store.state.calendarBackendId
    },
    events() {
      return this.gEvents.map((gEvent) => ({
        title: gEvent.summary,
        redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
        note: gEvent.description
      }))
      .sort((a, b) => a.redZone.start - b.redZone.end)
    }
  }
}
</script>

<style scoped>

</style>