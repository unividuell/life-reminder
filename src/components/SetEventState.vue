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

<script>
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";

export default {
  name: "SetEventState",
  props: ["event"],
  data: () => ({
    showDialog: false,
    isLoading: false,
    desiredState: null
  }),
  methods: {
    async setEventState(desiredState) {
      this.desiredState = desiredState
      this.isLoading = true
      this.showDialog = false // no user interruption
      await useGoogleCalendarStore()
          .setEventState(this.event.googleId, this.desiredState)
      await useGoogleCalendarStore().reload()
      this.isLoading = false
      this.showDialog = false
    }
  },
}
</script>

<style scoped>

</style>