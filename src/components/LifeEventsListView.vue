<template>
 <v-container>
   <v-expansion-panels accordion multiple v-model="panel">
    
     <v-expansion-panel>
       <v-expansion-panel-title>Next up</v-expansion-panel-title>
       <v-expansion-panel-text>
         <v-row dense>
           <v-col
               cols="12" xs="12" md="12"
               v-for="event in nextMonthEvents"
               :key="event.id">
             <LifeEvent :event="event" v-bind:key="event.googleId" v-on:reload="reload" />
           </v-col>
         </v-row>
       </v-expansion-panel-text>
     </v-expansion-panel>
     <v-expansion-panel>
       <v-expansion-panel-title>The future</v-expansion-panel-title>
       <v-expansion-panel-text>
         <v-row dense>
           <v-col
               cols="12" xs="12" md="12"
               v-for="event in futureEvents"
               :key="event.id">
             <LifeEvent :event="event" v-bind:key="event.googleId" v-on:reload="reload" />
           </v-col>
         </v-row>
       </v-expansion-panel-text>
     </v-expansion-panel>
      <v-expansion-panel>
       <v-expansion-panel-title>Past events</v-expansion-panel-title>
       <v-expansion-panel-text>
         <v-row dense>
           <v-col
               cols="12" xs="12" md="6"
               v-for="event in pastEvents"
               :key="event.id">
             <LifeEvent :event="event" v-bind:key="event.googleId" v-on:reload="reload" />
           </v-col>
         </v-row>
       </v-expansion-panel-text>
     </v-expansion-panel>
   </v-expansion-panels>
 </v-container>
</template>

<script>
import LifeEvent from "@/components/LifeEvent.vue";
import {mapState} from "pinia";
import {useGoogleCalendarStore} from "@/stores/GoogleCalendarStore";

export default {
  name: "LifeEventsListView",
  components: {LifeEvent},
  data: () => ({
    now: new Date(),
    panel: [1]
  }),
  computed: {
    ...mapState(useGoogleCalendarStore, ['sortedEvents', 'pastEvents', 'nextMonthEvents', 'futureEvents'])
  },
  methods: {
    reload() {
      this.$emit('reload')
    }
  }
}
</script>

<style scoped>

</style>