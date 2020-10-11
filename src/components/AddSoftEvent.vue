<template>
   <v-dialog
       v-model="dialog"
       scrollable
       max-width="600px">
     <v-card>
       <v-card-title>Life Reminder Event</v-card-title>
       <v-card-text>
         <v-form
             v-model="valid"
             :id="formId"
             ref="eventForm"
             v-bind:key="event ? event.googleId : 'add'"
             @submit.stop.prevent="handleEvent" >
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
             <v-col cols="12" xs="12" sm="12" class="pt-0">
               <v-date-picker
                   v-model="redZone"
                   scrollable
                   no-title
                   range
                   first-day-of-week="1"
                   show-week
                   full-width
                   elevation="5">
                 <v-text-field
                     v-model="redZoneText"
                     label="Period"
                     readonly
                     :rules="[ () => this.redZone.length === 2 || 'Please define the period for this event (start and end).']"
                 ></v-text-field>
               </v-date-picker>
             </v-col>
           </v-row>
           <v-row>
             <v-col cols="12" xs="12" class="pt-0">
               <v-textarea v-model="notes" label="Personal notes"></v-textarea>
             </v-col>
           </v-row>
         </v-form>
       </v-card-text>
       <v-card-actions>
         <v-spacer></v-spacer>
         <v-btn :disabled="loading || !valid" type="submit" :form="formId" color="primary">{{actionLabel}}</v-btn>
       </v-card-actions>
     </v-card>
   </v-dialog>
</template>

<script>
import { formatISO, parseISO } from 'date-fns'
import format from '../plugins/date-fns-format'

export default {
  name: "AddSoftEvent",
  props: ["event"],
  data: () => ({
    dialog: false,
    valid: true,
    isLoading: false,
    googleId: null,
    summary: null,
    redZone: [ ],
    notes: '',
    edit: false
  }),
  created() {
    if (this.event) {
      this.googleId = this.event.googleId
      this.summary = this.event.title
      this.redZone = [
        formatISO(this.event.redZone.start, { representation: 'date' }),
        formatISO(this.event.redZone.end, { representation: 'date' })
      ]
      this.notes = this.event.note
      this.edit = true
    } else {
      this.edit = false
    }
  },
  methods: {
    open() {
      this.dialog = true
    },
    clear() {
      this.summary = []
      this.redZone = []
      this.notes = null
      this.$refs.eventForm.reset()
    },
    async handleEvent() {
      if (this.edit) {
        await this.editSimpleEvent()
      } else {
        await this.addSimpleEvent()
      }
    },
    async editSimpleEvent() {
      if (!this.$refs.eventForm.validate()) {
        return
      }
      this.isLoading = true
      let event = {
        summary: this.summary,
        description: this.notes,
        start: {
          date: this.redZone[0]
        },
        end: {
          date: this.redZone[1]
        }
      }
      await this.$gapi.request({
        path: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${this.event.googleId}`,
        method: 'PATCH',
        body: event
      })
      .then(() => {
        // no-op
      }).catch((err) => {
        console.warn(err)
      })
      this.isLoading = false
      this.dialog = false
      this.$emit('reload')
    },
    async addSimpleEvent() {
      if (!this.$refs.eventForm.validate()) {
        return
      }
      this.isLoading = true
      if(this.redZone[0] > this.redZone[1]){
        let temp = this.redZone[0]
        this.redZone[0] = this.redZone[1]
        this.redZone[1] = temp
      }
      let event = {
        summary: this.summary,
        description: this.notes,
        start: {
          date: this.redZone[0]
        },
        end: {
          date: this.redZone[1]
        },
        transparency: "opaque",
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
      .then(() => {
        this.clear()
      }).catch((err) => {
          console.warn(err)
      })
      this.isLoading = false
      this.dialog = false
      this.$emit('reload')
    }
  },
  computed: {
    formId() {
      return this.event ? this.event.googleId : 'add'
    },
    redZoneText: {
      get() {
        return this.redZone.map(date => format(parseISO(date))).join(' -> ')
      },
      set(newValue) {
        // w/o `this.$refs.eventForm.reset()` will throw an error :/
        console.log(newValue)
      }
    },
    calendarId() {
      return this.$store.state.calendarBackendId
    },
    loading() {
      return this.$store.state.loading
    },
    actionLabel() {
      return this.edit ? "Edit Event" : "Add Event"
    }
  },
  watch: {
    isLoading(newValue) {
      this.$store.commit('setLoading', newValue)
    }
  }
}
</script>

<style scoped>

</style>