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

<script setup>
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";
import {useDialogStore} from "../stores/DialogStore";
import {ref, watch} from "vue";

const event = ref(null)
const showDialog = ref(false)
const isLoading = ref(false)
const desiredState = ref(null)

const dialogStore = useDialogStore()

async function setEventState() {
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