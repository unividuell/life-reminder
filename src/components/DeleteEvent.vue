<template>
  <v-dialog
      v-model="showDialog"
      persistent
      max-width="400">
    <v-card>
      <v-card-title class="headline">
        Really delete event {{ event.title }}?
      </v-card-title>
      <v-card-text>Do you really want to delete this event?</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="green darken-1"
            text
            @click="showDialog = false">Disagree</v-btn>
        <v-btn
            color="green darken-1"
            text
            @click="onDelete">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DeleteEvent",
  props: ["event"],
  data: () => ({
    showDialog: false,
    isLoading: false,
  }),
  methods: {
    open() {
      this.showDialog = true
    },
    async onDelete() {
      this.isLoading = true
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${this.event.googleId}`,
        method: 'DELETE'
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