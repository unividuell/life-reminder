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
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";
import {mapState, mapWritableState} from "pinia";
import {useDialogStore} from "../stores/DialogStore";

export default {
  name: "DeleteEvent",
  data: () => ({
    showDialog: false,
    isLoading: false,
    event: null
  }),
  computed: {
    ...mapWritableState(useDialogStore, ['handleDelete'])
  },
  methods: {
    open() {
      this.showDialog = true
    },
    async onDelete() {
      this.isLoading = true
      await useGoogleCalendarStore().deleteEvent(this.event.googleId)
      await useGoogleCalendarStore().reload()
      this.isLoading = false
      this.showDialog = false
    }
  },
  watch: {
    handleDelete(newValue) {
      if (newValue) {
        this.event = newValue
        this.showDialog = true
      }
    },
    showDialog(newValue) {
      if (! newValue) {
        this.handleDelete = null
      }
    }
  }
}
</script>

<style scoped>

</style>