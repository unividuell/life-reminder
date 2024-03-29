<template>
   <v-dialog
       v-model="showDialog"
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
               <p class="text-black-50 pl-4">
                 {{redZoneText}}
               </p>
             </v-col>
           </v-row>
           <v-row>
             <v-col cols="12" xs="12" class="pt-0">
               <v-textarea v-model="notes" label="Personal notes"></v-textarea>
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
         </v-form>
       </v-card-text>
       <v-card-actions v-if="! inDeleteConfirmation">
         <v-spacer></v-spacer>
         <v-btn :form="formId" v-if="edit" color="error" @click="inDeleteConfirmation = true">delete</v-btn>
         <v-btn :disabled="isLoading || !valid" type="submit" :form="formId" color="primary">{{actionLabel}}</v-btn>
       </v-card-actions>
       <v-card-actions v-else>
         <strong class="text-error">Are you sure to delete it?</strong>
         <v-spacer />
         <v-btn color="error" @click="onDelete">yes</v-btn>
         <v-btn @click="inDeleteConfirmation = false">no</v-btn>
       </v-card-actions>
     </v-card>
   </v-dialog>
</template>

<script>
import {differenceInCalendarDays, formatISO, parseISO} from 'date-fns'
import format from '../plugins/date-fns-format'
import {useGoogleCalendarStore} from "@/stores/GoogleCalendarStore";
import {mapWritableState} from "pinia";
import {useDialogStore} from "@/stores/DialogStore";

export default {
  name: "AddSoftEvent",
  data: () => ({
    showDialog: false,
    event: null,
    valid: false,
    isLoading: false,
    googleId: null,
    summary: null,
    redZone: [ ],
    notes: '',
    edit: false,
    initStartDate: new Date(),
    inDeleteConfirmation: false
  }),
  methods: {
    init() {
      this.clear()
      this.inDeleteConfirmation = false
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
    clear() {
      this.googleId = null
      this.summary = null
      this.redZone = []
      this.notes = null
      this.inDeleteConfirmation = false
      this.$refs.eventForm?.reset()
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
      this.showDialog = false
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
      this.showDialog = false
      await useGoogleCalendarStore().reload()
    },
    async onDelete() {
      this.isLoading = true
      await useGoogleCalendarStore().deleteEvent(this.event.googleId)
      await useGoogleCalendarStore().reload()
      this.isLoading = false
      this.showDialog = false
    }
  },
  computed: {
    ...mapWritableState(useDialogStore, ['handleEdit', 'handleAdd']),
    formId() {
      return this.event ? this.event.googleId : 'add'
    },
    redZoneText() {
      try {

        let period = (format(parseISO(this.startDateForGoogle), "dd.MM.yyyy") ?? 'tbd') + ' - ' + (format(parseISO(this.endDateForGoogle),"dd.MM.yyyy") ?? 'tbd')
        let duration = differenceInCalendarDays(parseISO(this.endDateForGoogle), parseISO(this.startDateForGoogle))

        return "Period: " + period + " (" + duration + "d)"
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
      // re-validate as soon as the clearance periode gets adjusted
      this.$refs.eventForm?.validate()
    },
    notes() {
      // re-validate as soon as the summary gets adjusted
      this.$refs.eventForm?.validate()
    },
    handleEdit(newValue) {
      if (newValue) {
        this.event = newValue
        this.init()
        this.showDialog = true
      }
    },
    handleAdd(newValue) {
      if (newValue) {
        this.event = null
        this.init()
        this.showDialog = true
      }
    },
    showDialog() {
      // re-validate as soon as the dialog gets opened / closed
      this.$refs.eventForm?.validate()
      this.handleEdit = null
      this.handleAdd = null
      this.init()
    }
  }
}
</script>

<style scoped>

</style>