<template>
  <v-app-bar
      app
      color="primary"
      dark
  >
    <v-app-bar-nav-icon @click.stop="toggleDrawer" varian="text" />
    <v-app-bar-title class="d-none d-sm-block">Life Reminder 3000</v-app-bar-title>

    <template v-slot:append v-if="isAuthorized && currentUser">
      <v-btn @click="addEvent" text><span class="mr-3">New Event</span><v-icon>mdi-calendar-plus</v-icon></v-btn>
      <v-avatar>
        <img
            :src="currentUser!.picture"
            alt="Profile Picture"
            :height="42"
            :width="42"
        >
      </v-avatar>
      <v-btn @click="logout" text>
        <span class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </template>
    <template v-slot:append v-if="!isAuthorized">
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

function logout() {
  authStore.reset()
}

</script>

<style scoped>

</style>