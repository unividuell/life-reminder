<template>
 <v-container fluid>
   <v-row>
     <v-col cols="12" md="3" class="pb-0">
      <v-chip-group
        v-model="filterTag"
        column
      >
        <v-chip
          v-for="tag in listOfCurrentTags"
          filter
          :value="tag"
          :key="tag"
          size="small"
        >
        #{{ tag }}
        </v-chip>
      </v-chip-group>
     </v-col>
     <v-col cols="12" md="9" class="pa-0 pa-sm-2">
       <v-card class="mx-auto" :loading="loading" :flat="$vuetify.display.xs">
         <v-list>
          <v-list-subheader>Current Todos <span v-if="this.filterTag">#{{ filterTag }}</span></v-list-subheader>
           <v-list-item
               v-for="event in events"
               :key="event.id"
               :class="isOverdue(event)?'text-red':''"
               @click="manageEvent(event)"
           >
             <template v-slot:prepend>
               <v-list-item-action start>
                  <!-- kudos: https://github.com/vuetifyjs/vuetify/issues/13026#issuecomment-977035686 -->
                 <v-checkbox-btn :model-value="event.closed" @update:model-value="(changed) => value = changed" @click.stop="toggleEventState(event)" />
               </v-list-item-action>
             </template>
             <v-list-item-title :class="event.closed ? 'text-decoration-line-through' : ''">
               <div class="d-flex justify-space-between">
                 <span class="me-1">{{event.title}}</span>
                 <div>
                   <v-chip v-if="isOverdue(event)" size="small" variant="outlined">
                     <v-icon :start="$vuetify.display.smAndUp" icon="mdi-alarm-light"></v-icon>
                     <span class="d-none d-sm-block">OVERDUE</span>
                   </v-chip>
                   <v-chip
                       v-if="currentlyInRedZone(event) && !event.closed"
                       class="bg-light-blue lighten-3"
                       color="black"
                       size="x-small">-{{ redZoneDaysLeft(event) }}d
                   </v-chip>
                 </div>
               </div>
             </v-list-item-title>
             <v-progress-linear
                 v-if="currentlyInRedZone(event) && !event.closed"
                 :model-value="remainingTime(event)"
                 color="light-blue lighten-3"
                 :striped="event.closed ? false : true"
                 :reverse="true"
                 :height="6"
                 class="mt-2"
             />
           </v-list-item>
           <v-list-item>
            <div class="d-flex">
              <v-checkbox-btn
                class="pr-2"
                disabled
              ></v-checkbox-btn>
              <v-text-field
                @keyup.enter="saveTodo"
                @blur="saveTodo"
                v-model="newTodoTitle"
                label="New Todo"
                hide-details
              ></v-text-field>
            </div>
           </v-list-item>
         </v-list>
       </v-card>
     </v-col>
    </v-row>
 </v-container>
</template>

<script>
import {mapActions, mapState} from "pinia";
import {useGoogleCalendarStore} from "@/stores/GoogleCalendarStore";
import {useDialogStore} from "@/stores/DialogStore";
import {useCalendarFilterSettingsStore} from "@/stores/CalendarFilterSettingsStore";
import {differenceInCalendarDays, eachDayOfInterval, format, isFuture, isPast, isWithinInterval, addDays} from "date-fns";

export default {
  name: "LifeEventsListView",
  components: {},
  data: () => ({
    now: new Date(),
    loading: false,
    filterTag: undefined,
    newTodo: undefined,
    newTodoTitle: ''
  }),
  computed: {
    ...mapState(useGoogleCalendarStore, ['sortedEvents']),
    ...mapState(useCalendarFilterSettingsStore, ['includeClearedEvents', 'includeUpcomingEvents', 'sortBy']),
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
          .filter(e => {
            if(this.filterTag === undefined) return true
            console.log(this.filterTag)
            if(e.title.includes("#"+this.filterTag)) return true
            return false
          })
    },
    listOfCurrentTags() {
      return new Set(
          this
            .sortedEvents(this.sortBy)
            .filter(event => !event.closed)
            .map(event => event.title)
            .filter(title => title?.includes('#'))
            .flatMap(title => {
              let splitted = title.split('#')
              return splitted.splice(1, splitted.length - 1).map(tag => tag.trim())
            })
            .sort()
      )
    }
  },
  methods: {
    currentlyInRedZone(event) {
      return isWithinInterval(this.now, {start: event.redZone.start, end: event.redZone.end})
    },
    toggleEventState(event) {
      let desiredState = event.closed ? 're-open' : 'close'
      this.setEventState(event, desiredState)
    },
    setEventState(event, desiredState) {
      this.handleEventState(event, desiredState)
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
    manageEvent(event) {
      this.handleEventEditing(event)
    },
    isOverdue(event) {
      return isPast(event.redZone.end) && !event.closed
    },
    async saveTodo(event){
      if (this.newTodoTitle.length <= 0) {
        return
      }
      let now = new Date()
      let startDate = format((now), "yyyy-MM-dd")
      //Set End to five days from now
      let endDate = format(addDays(now, 5), "yyyy-MM-dd")

      await useGoogleCalendarStore()
          .addEvent(
              this.newTodoTitle,
              "",
              startDate,
              endDate
          )
      
      this.newTodoTitle = ""
        
      await useGoogleCalendarStore().reload()
    },
    ...mapActions(useDialogStore, ['handleEventState', 'handleEventDeletion', 'handleEventEditing'])
  }
}
</script>

<style scoped>

</style>