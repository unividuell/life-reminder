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
          <v-list-subheader class="pa-0 pa-sm-2">Current Todos <span v-if="filterTag">#{{ filterTag }}</span></v-list-subheader>
           <v-list-item
               v-for="event in events"
               :key="event.id"
               :class="isOverdue(event)?'text-red':''"
               @click="manageEvent(event)"
               class="pa-0 pa-sm-2"
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
           <v-list-item class="pa-0 pa-sm-2">
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

<script setup lang="ts">
import {computed, ref} from "vue";
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";
import {useCalendarFilterSettingsStore} from "../stores/CalendarFilterSettingsStore";
import {useDialogStore} from "../stores/DialogStore";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval, format,
  isFuture,
  isPast,
  isWithinInterval
} from "date-fns";

const googleCalendarStore = useGoogleCalendarStore()
const calendarFilterSettingsStore = useCalendarFilterSettingsStore()
const dialogStore = useDialogStore()

const now = ref(new Date())
const loading = ref(false)
const filterTag = ref<string | null>()
const newTodoTitle = ref<string>('')


const events = computed<LifeReminderEvent[]>(() => {
  return googleCalendarStore
      .sortedEvents(calendarFilterSettingsStore.sortBy)
      .filter(e => {
        if (calendarFilterSettingsStore.includeClearedEvents) return e
        else return e.closed === false
      })
      .filter(e => {
        if (calendarFilterSettingsStore.includeUpcomingEvents && isFuture(e.redZone.start)) return true
        if (! calendarFilterSettingsStore.includeUpcomingEvents && isFuture(e.redZone.start)) return false
        if (calendarFilterSettingsStore.includeUpcomingEvents && !isFuture(e.redZone.start)) return true
        if (! calendarFilterSettingsStore.includeUpcomingEvents && !isFuture(e.redZone.start)) return true
      })
      .filter(e => {
        if(!filterTag.value) return true
        if(e.title.includes("#"+filterTag.value)) return true
        return false
      })
})

const listOfCurrentTags = computed((): Set<string> => {
  let tagList = new Set(
      googleCalendarStore
          .sortedEvents(calendarFilterSettingsStore.sortBy)
          .filter(event => !event.closed)
          .map(event => event.title)
          .filter(title => title?.includes('#'))
          .flatMap(title => {
            let splitted = title.split('#')
            return splitted.splice(1, splitted.length - 1).map(tag => tag.trim())
          })
          .sort()
  )
  if (filterTag.value && !tagList.has(filterTag.value)) {
    // selected tag is not present in tag-list anymore (eg. after deleting last filtered item)
    filterTag.value = null
  }
  return tagList
})

function toggleEventState(event: LifeReminderEvent) {
  let desiredState = event.closed ? 're-open' : 'close'
  setEventState(event, desiredState)
}

function setEventState(event: LifeReminderEvent, desiredState: string) {
  dialogStore.handleEventState(event, desiredState)
}

function remainingTime(event: LifeReminderEvent) {
  if (! currentlyInRedZone(event)) {
    // we are currently not in this red-zone
    if (isFuture(event.redZone.start)) {
      //interval between now and start of event/365...
      let progress = 100 - differenceInCalendarDays(event.redZone.start, now.value) / 365 * 100;
      console.log(progress, '<- for future')
      return progress
    } else {
      //past Events
      return 100
    }
  }
  //in red-zone
  return (redZoneDaysLeft(event) / redZoneDurationInDays(event)) * 100
}

function getColor(event: LifeReminderEvent){
  if(event.closed){
    return 'green'
  } else {
    if(currentlyInRedZone(event)){
      return 'pink'
    } else {
      return 'blue'
    }
  }
}

function redZoneDaysLeft(event: LifeReminderEvent) {
  return differenceInCalendarDays(event.redZone.end, now.value)
}

function redZoneDurationInDays(event: LifeReminderEvent) {
  return eachDayOfInterval({start: event.redZone.start, end: event.redZone.end}).length
}

function manageEvent(event: LifeReminderEvent) {
  dialogStore.handleEventEditing(event)
}

function isOverdue(event: LifeReminderEvent) {
  return isPast(event.redZone.end) && !event.closed
}

async function saveTodo(event: LifeReminderEvent) {
  if (newTodoTitle.value.length <= 0) {
    return
  }
  let now = new Date()
  let startDate = format((now), "yyyy-MM-dd")
  //Set End to five days from now
  let endDate = format(addDays(now, 5), "yyyy-MM-dd")

  await useGoogleCalendarStore()
      .addEvent(
          newTodoTitle.value,
          "",
          startDate,
          endDate
      )

  newTodoTitle.value = ""

  await useGoogleCalendarStore().reload()
}

function currentlyInRedZone(event: LifeReminderEvent) {
  return isWithinInterval(now.value, {start: event.redZone.start, end: event.redZone.end})
}

</script>