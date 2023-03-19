<template>
  <v-navigation-drawer
      v-model="store.drawerVisible"
  >
    <v-list lines="three" density="compact" nav>
      <v-list-subheader>Event Filter</v-list-subheader>

      <v-list-item @click="store.includeClearedEvents = !store.includeClearedEvents" value="includeClearedEvents">
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-switch density="compact" hide-details :model-value="isActive"></v-switch>
          </v-list-item-action>
        </template>
        <v-list-item-title>Show cleared events</v-list-item-title>
        <v-list-item-subtitle v-if="store.includeClearedEvents">
          Cleared events are currently displayed
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else>
          Cleared events are currently hidden
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-item @click="store.includeUpcomingEvents = !store.includeUpcomingEvents" value="includeUpcomingEvents">
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-switch density="compact" hide-details :model-value="isActive"></v-switch>
          </v-list-item-action>
        </template>
        <v-list-item-title>Show upcoming events</v-list-item-title>
        <v-list-item-subtitle v-if="store.includeUpcomingEvents">
          Upcoming events are currently displayed
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else>
          Upcoming events are currently hidden
        </v-list-item-subtitle>
      </v-list-item>

      <v-list-subheader>Event Sorting</v-list-subheader>
      <v-list-item>
        <v-radio-group v-model="sortBy">
          <v-radio
              v-for="option in sortByOptions"
              :key="option.key"
              :label="option.text"
              :value="option.key"
          />
        </v-radio-group>
      </v-list-item>

    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useCalendarFilterSettingsStore } from "../stores/CalendarFilterSettingsStore";
import {storeToRefs} from "pinia";
import {reactive} from "vue";

const store = useCalendarFilterSettingsStore()
const sortByOptions = reactive([{ key: 'end', text: 'end date'}, {key: 'start', text: 'start date'}])

const { sortBy } = storeToRefs(store)

</script>

<style scoped>

</style>