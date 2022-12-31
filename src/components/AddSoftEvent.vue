<template>
   <v-dialog
       v-model="show"
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
             <v-col cols="12">
               <div class="display-2">
                 Periode for clearance is
                 <template v-if="redZoneText">{{redZoneText}}</template>
               </div>
             </v-col>
           </v-row>
           <v-row>
             <v-col cols="12">
               <Datepicker
                   v-model="redZone"
                   model-type="yyyy-MM-dd"
                   inline
                   range
                   auto-apply
                   :start-date="initStartDate"
                   :enable-time-picker="false"
                   six-weeks
                   show-now-button
               />
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
         <v-btn :disabled="isLoading || !valid" type="submit" :form="formId" color="primary">{{actionLabel}}</v-btn>
       </v-card-actions>
     </v-card>
   </v-dialog>
</template>

<script>
import {addDays, formatISO, parseISO} from 'date-fns'
import format from '../plugins/date-fns-format'
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";

export default {
  name: "AddSoftEvent",
  props: ["event", "value"],
  data: () => ({
    valid: false,
    isLoading: false,
    googleId: null,
    summary: null,
    redZone: [ ],
    notes: '',
    edit: false,
    initStartDate: new Date()
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
      if (!await this.$refs.eventForm.validate()) {
        return
      }
      this.isLoading = true
      await useGoogleCalendarStore()
          .editEvent(
              this.event.googleId,
              this.summary,
              this.notes,
              this.redZone[0],
              this.redZone[1]
          )

      this.isLoading = false
      this.dialog = false
      await useGoogleCalendarStore().reload()
    },
    async addSimpleEvent() {
      if (!await this.$refs.eventForm.validate()) {
        return
      }
      this.isLoading = true
      if(this.redZone[0] > this.redZone[1]){
        let temp = this.redZone[0]
        this.redZone[0] = this.redZone[1]
        this.redZone[1] = temp
      }
      await useGoogleCalendarStore()
          .addEvent(
              this.summary,
              this.notes,
              this.startDateForGoogle,
              this.endDateForGoogle
          )
      this.clear()
      this.isLoading = false
      this.dialog = false
      await useGoogleCalendarStore().reload()
    },
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    formId() {
      return this.event ? this.event.googleId : 'add'
    },
    redZoneText() {
      try {
        return (this.startDateForGoogle ?? 'tbd') + ' -> ' + (this.endDateForGoogle ?? 'tbd')
      } catch (e) {
        return null
      }
    },
    startDateForGoogle() {
      return format(parseISO(this.redZone[0]), "yyyy-MM-dd")
    },
    endDateForGoogle() {
      if (this.redZone.length >= 2) {
        return format(parseISO(this.redZone[1]), "yyyy-MM-dd")
      }
      return null
    },
    actionLabel() {
      return this.edit ? "Edit Event" : "Add Event"
    }
  },
  watch: {
    redZone() {
      this.$refs.eventForm?.validate()
    }
  }
}
</script>

<style scoped>

</style>