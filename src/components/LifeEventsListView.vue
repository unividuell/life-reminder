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
           <v-card-title class="headline">{{ event.summary }}</v-card-title>
           <v-card-subtitle>{{ event.start.date }} - {{ event.end.date }}</v-card-subtitle>
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
  props: ["events"],
  data: () => ({

  }),
  computed: {
    calendarId() {
      return this.$store.state.calendarBackendId
    }
  }
}
</script>

<style scoped>

</style>