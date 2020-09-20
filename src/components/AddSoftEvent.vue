<template>
   <v-container>
     <v-card>
       <v-card-title>Add Life Reminder Event</v-card-title>
       <v-card-text>
         <v-form v-model="valid" id="addSimpleEvent" @submit.stop.prevent="onAddSimpleEvent" >
           <v-row>
             <v-col cols="12">
               <v-text-field v-model="summary" label="Summary" required></v-text-field>
             </v-col>
           </v-row>
           <v-row>
             <v-col cols="12" xs="8" sm="8">
               <p>Select the period you plan to solve this life event:</p>
             </v-col>
             <v-col cols="12" xs="4" sm="4">
               <v-menu
                   ref="redZoneStartPicker"
                   v-model="showRedZonePicker"
                   :close-on-content-click="false"
                   :return-value.sync="redZone"
                   transition="scale-transition"
                   offset-y
                   min-width="290px">
                 <template v-slot:activator="{ on, attrs }">
                   <v-text-field
                       v-model="redZoneText"
                       label="Period"
                       readonly
                       v-bind="attrs"
                       v-on="on"
                   ></v-text-field>
                 </template>
                 <v-date-picker v-model="redZone" no-title scrollable range>
                   <v-spacer></v-spacer>
                   <v-btn text color="primary" @click="showRedZonePicker = false">Cancel</v-btn>
                   <v-btn text color="primary" @click="$refs.redZoneStartPicker.save(redZone)">OK</v-btn>
                 </v-date-picker>
               </v-menu>
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
         <v-btn :disabled="loading" type="submit" form="addSimpleEvent" color="primary">Add Event</v-btn>
       </v-card-actions>
     </v-card>
   </v-container>
</template>

<script>
export default {
  name: "AddSoftEvent",
  data: () => ({
    valid: true,
    loading: false,
    summary: null,
    redZone: [ ],
    showRedZonePicker: false,
    notes: ''
  }),
  created() {

  },
  methods: {
    async onAddSimpleEvent() {
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
      await this.$gapi.getGapiClient()
        .then((gapi) => {
          return gapi.client.calendar.events.insert({
            calendarId: this.calendarId,
            resource: event
          })
        }).then((resp) => {
          console.log(resp)
        }).catch((err) => {
          console.warn(err)
        })
      this.loading = false
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