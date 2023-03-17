<template>
  <v-navigation-drawer
      v-model="store.drawerVisible"
  >
    <v-list lines="three" density="compact" nav>
      <v-list-subheader>Event Filter</v-list-subheader>

      <v-list-item @click="includeClearedEvents = !includeClearedEvents" value="clearedEvents">
        <template v-slot:prepend="{ isActive }">
          <v-list-item-action start>
            <v-switch density="compact" hide-details :model-value="isActive"></v-switch>
          </v-list-item-action>
        </template>
        <v-list-item-title>Show cleared events</v-list-item-title>
        <v-list-item-subtitle v-if="includeClearedEvents">
          Cleared events are currently displayed
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else>
          Cleared events are currently hidden
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { useCalendarFilterSettingsStore } from "@/stores/CalendarFilterSettingsStore";
import {storeToRefs} from "pinia";

const store = useCalendarFilterSettingsStore()

const { includeClearedEvents } = storeToRefs(store)

</script>

<style scoped>

</style>