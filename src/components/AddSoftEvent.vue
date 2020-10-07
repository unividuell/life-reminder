<template>
   <v-container>
     <v-dialog
         v-model="dialog"
         max-width="600px"
     >
       <v-card>
         <v-card-title>Add Life Reminder Event</v-card-title>
         <v-card-text>
           <v-form
               v-model="valid"
               id="addSimpleEvent"
               ref="addSimpleEvent"
               @submit.stop.prevent="onAddSimpleEvent" >
             <v-row>
               <v-col cols="12">
                 <v-text-field
                     v-model="summary"
                     label="Summary"
                     :rules="[ v=>!!v || 'Please provide a summary (title) for this event.']"
                     required>
                 </v-text-field>
               </v-col>
             </v-row>
             <v-row>
               <v-col cols="12" xs="12" sm="12">
                 <h2>Start and end date:</h2>
               </v-col>
             </v-row>
             <v-row>
               <v-col cols="12" xs="12" sm="12">
                 <v-date-picker
                     v-model="redZone"
                     scrollable
                     no-title
                     range
                     first-day-of-week="1"
                     show-week
                     full-width
                     elevation="5">
                 </v-date-picker>
               </v-col>
             </v-row>
             <v-row>
               <v-col cols="12">
                 <v-text-field
                     v-model="redZoneText"
                     label="Period"
                     readonly
                     :rules="[ () => this.redZone.length === 2 || 'Please define the period for this event (start and end).']"
                 ></v-text-field>
               </v-col>
             </v-row>
             <v-row>
               <v-col cols="12" xs="12">
                 <v-textarea v-model="notes" label="Personal notes"></v-textarea>
               </v-col>
             </v-row>
           </v-form>
         </v-card-text>
         <v-card-actions>
           <v-spacer></v-spacer>
           <v-btn :disabled="loading || !valid" type="submit" form="addSimpleEvent" color="primary">Add Event</v-btn>
         </v-card-actions>
       </v-card>
     </v-dialog>
   </v-container>
</template>

<script>
export default {
  name: "AddSoftEvent",
  data: () => ({
    dialog: false,
    valid: true,
    loading: false,
    summary: null,
    redZone: [ ],
    notes: ''
  }),
  methods: {
    open() {
      this.dialog = true
    },
    async onAddSimpleEvent() {
      if (!this.$refs.addSimpleEvent.validate()) {
        return
      }
      if (this.redZone.length < 2) {
        console.log(this.redZone)
        return
      }
      this.loading = true
      let event = {
        summary: this.summary,
        description: this.notes,
        start: {
          date: this.redZone[0]
        },
        end: {
          date: this.redZone[1]
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 6 * 60 }
          ]
        }
      }
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
        method: 'POST',
        body: event
      })
      .then((resp) => {
        console.log(resp)
        this.summary = null
        this.redZone = []
        this.notes = ''
        this.valid = true
      }).catch((err) => {
          console.warn(err)
      })
      this.loading = false
      this.dialog = false
      this.$emit('softEventAdded')
    }
  },
  computed: {
    redZoneText () {
      return this.redZone.join(' ~ ')
    },
    calendarId() {
      return this.$store.state.calendarBackendId
    }
  },
}
</script>

<style scoped>

</style>