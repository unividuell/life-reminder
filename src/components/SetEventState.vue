<template>
  <v-dialog
      v-model="showDialog">
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
      let gState = this.desiredState === 'close' ? "transparent" : "opaque"
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${this.event.googleId}`,
        method: 'PATCH',
        body: {
          transparency: gState
        }
      })
      .then(() => {
        this.$emit('reload')
      })
      .catch(err => {
        console.log(err)
      })
      this.isLoading = false
      this.showDialog = false
    }
  },
  computed: {
    calendarId() {
      return this.$store.state.calendarBackendId
    }
  },
  watch: {
    isLoading(newValue) {
      this.$emit('loading', newValue)
    }
  }
}
</script>

<style scoped>

</style>