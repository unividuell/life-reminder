<template>
  <v-app-bar
      app
      color="primary"
      dark
  >
    <v-app-bar-nav-icon @click.stop="toggleDrawer" varian="text" />
    <v-app-bar-title class="d-none d-sm-block">Life Reminder 3000</v-app-bar-title>

    <template v-slot:append>
      <template  v-if="isAuthorized && currentUser">
        <v-btn @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>
        <v-avatar>
          <img
              :src="currentUser!.picture"
              alt="Profile Picture"
              :height="42"
              :width="42"
          >
        </v-avatar>
      </template>
      <GoogleAuth />
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import {storeToRefs} from "pinia";
import {useDialogStore} from "../stores/DialogStore";
import {useGoogleAuthStore} from "../stores/GoogleAuthStore";
import {useCalendarFilterSettingsStore} from "../stores/CalendarFilterSettingsStore";
import GoogleAuth from "@/components/GoogleAuth.vue";

const dialogStore = useDialogStore()
const authStore = useGoogleAuthStore()
const calendarSettingsStore = useCalendarFilterSettingsStore()

const { isAuthorized, currentUser } = storeToRefs(authStore)
const { toggleDrawer } = calendarSettingsStore

function addEvent() {
  dialogStore.handleEventAdding()
}

</script>

<style scoped>

</style>