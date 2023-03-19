<template>
  <v-dialog v-model="showDialog">
    <v-card v-if="desiredState === 'close'">
      <v-card-title>Mission Accomplished</v-card-title>
      <v-card-text>Nice job! :)</v-card-text>
    </v-card>
    <v-card v-else-if="desiredState === 're-open'">
      <v-card-title>Next try</v-card-title>
      <v-card-text>Okay, once again..</v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";
import {useDialogStore} from "../stores/DialogStore";
import {ref, watch} from "vue";

const event = ref<LifeReminderEvent | null>(null)
const showDialog = ref(false)
const isLoading = ref(false)
const desiredState = ref<string | null>(null)

const dialogStore = useDialogStore()

async function setEventState() {
  if (!event.value || ! desiredState.value) {
    console.warn(`cannot set event state!`, event.value, desiredState.value)
    return
  }
  isLoading.value = true
  showDialog.value = false // no user interruption
  await useGoogleCalendarStore()
      .setEventState(event.value.googleId, desiredState.value)
  await useGoogleCalendarStore().reload()
  isLoading.value = false
  showDialog.value = false
  dialogStore.handleState = null
}

watch(() => dialogStore.handleState, (newValue) => {
  if (newValue) {
    desiredState.value = newValue.desiredState
    event.value = newValue.event
    setEventState()
  }
})
</script>

<style scoped>

</style>