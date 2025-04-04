<template>
 <v-container fluid>
   <v-row>
     <v-col cols="12" md="3" class="pb-0">
      <div v-if="listOfCurrentTags.size < 1" class="text-disabled">No Tags present. You can create tags by adding "hashtags" to your event titles (#)</div>
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
       <v-card class="mx-auto" :loading="activeHttpLoading" :flat="display.xs.value">
<!--         <v-list-subheader class="pa-0 pa-sm-2">My Todos <span v-if="filterTag">#{{ filterTag }}</span></v-list-subheader>-->
         <v-list :items="events" :item-props="true" density="compact">
           <template v-slot:item="{ props: { type, value: event } }">
             <v-list-item
                 v-if="type === 'event'"
                 :class="isOverdue(event) ? 'text-red':''"
                 @click="manageEvent(event)"
                 class="mx-1 pa-0"
             >
              <template v-slot:prepend>
                <v-list-item-action start>
                   <!-- kudos: https://github.com/vuetifyjs/vuetify/issues/13026#issuecomment-977035686 -->
                  <v-checkbox-btn :model-value="event.closed" @update:model-value="(changed) => value = changed" @click.stop="toggleEventState(event)" />
                </v-list-item-action>
              </template>
              <v-list-item-title :class="event.closed ? 'text-decoration-line-through' : ''">
                <div class="d-flex justify-space-between">
                  <span class="text-truncate">{{event.title}}</span>
                  <v-chip
                      v-if="currentlyInRedZone(event) && !event.closed"
                      class="bg-light-blue lighten-3"
                      color="black"
                      size="x-small"
                  >
                    -{{ redZoneDaysLeft(event) }}d
                  </v-chip>
                </div>
              </v-list-item-title>
              <v-progress-linear
                  v-if="event.googleId && currentlyInRedZone(event) && !event.closed"
                  :model-value="remainingTime(event)"
                  color="light-blue lighten-3"
                  :striped="event.closed ? false : true"
                  :reverse="true"
                  :height="6"
                  class="mt-2"
              />
              <template v-slot:append>
                <v-chip v-if="isOverdue(event)" size="small" variant="outlined">
                  <v-icon :start="display.smAndUp.value" icon="mdi-alarm-light" size="14"></v-icon>
                  <span class="d-none d-sm-block">OVERDUE</span>
                </v-chip>
              </template>
             </v-list-item>
             <v-list-item
                 v-else-if="type === 'add-event'"
                 class="mx-1 pa-0">
               <template v-slot:prepend>
                 <v-list-item-action start>
                   <v-checkbox-btn disabled />
                 </v-list-item-action>
               </template>
               <v-text-field
                   @keyup.enter="saveTodo"
                   @blur="saveTodo"
                   v-model="newTodoTitle"
                   label="New reminder"
                   hide-details
               />
             </v-list-item>
           </template>
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
import {storeToRefs} from "pinia";
import {DateTime} from "luxon";
import {useDisplay} from "vuetify";

const display = useDisplay()
const googleCalendarStore = useGoogleCalendarStore()
const calendarFilterSettingsStore = useCalendarFilterSettingsStore()
const dialogStore = useDialogStore()

const now = ref(new Date())
const filterTag = ref<string | null>()
const newTodoTitle = ref<string>('')
const { activeHttpLoading } = storeToRefs(googleCalendarStore)

const events = computed<any>(() => {
  const alreadyHandledMonths = []
  const dividerItem = {type: 'divider'}
  const events =  googleCalendarStore
      .sortedEvents
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
      .flatMap(e => {
          // handle sub-title and dividers
          let date = calendarFilterSettingsStore.sortBy === 'end'
              ? DateTime.fromJSDate(e.redZone.end)
              : DateTime.fromJSDate(e.redZone.start)
          let divider = date.toFormat('yyyy-MM')
          if (alreadyHandledMonths.includes(divider)) {
              return ({type: 'event', value: e})
          } else {
              alreadyHandledMonths.push(divider)
              if (alreadyHandledMonths.length === 1) {
                  // first one - w/o divider
                  return [{type: 'subheader', title: divider}, {type: 'event', value: e}]
              } else {
                  // new month (w/ divider)
                  return [dividerItem, {type: 'subheader', title: divider}, {type: 'event', value: e}]
              }
          }
      })
    // add quick-add-event action
    events.splice(events.length, 0, dividerItem, {type: 'subheader', title: 'Add new reminder'}, {type: 'add-event', value: null})
    return events
})

const listOfCurrentTags = computed((): Set<string> => {
  let tagList = new Set<string>(
      googleCalendarStore
          .sortedEvents
          .filter(event => !event.closed)
          .map(event => event.title)
          .filter(title => title?.includes('#'))
          .flatMap(title => {
            let split: string[] = title.split('#')
            return split.splice(1, split.length - 1).map(tag => tag.trim())
          })
          .sort()
  )
  if (filterTag.value && !tagList.has(filterTag.value!)) {
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

async function saveTodo() {
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