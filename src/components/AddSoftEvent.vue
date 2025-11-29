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

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
import format from '@/plugins/date-fns-format'
import { useGoogleCalendarStore } from "@/stores/GoogleCalendarStore"
import { useDialogStore } from "@/stores/DialogStore"

defineOptions({
  name: "AddSoftEvent"
})

const googleCalendarStore = useGoogleCalendarStore()
const dialogStore = useDialogStore()
const { handleEdit, handleAdd } = storeToRefs(dialogStore)

const showDialog = ref(false)
const event = ref<any>(null)
const valid = ref(false)
const isLoading = ref(false)
const googleId = ref<string | null>(null)
const summary = ref<string | null>(null)
const redZone = ref<string[]>([])
const notes = ref<string | null>('')
const edit = ref(false)
const initStartDate = ref(new Date())
const inDeleteConfirmation = ref(false)
const eventForm = ref<any>(null)

const formId = computed(() => event.value ? event.value.googleId : 'add')

const startDateForGoogle = computed(() => {
  if (redZone.value.length > 0 && redZone.value[0]) {
    return format(parseISO(redZone.value[0]), "yyyy-MM-dd")
  }
  return null
})

const endDateForGoogle = computed(() => {
  if (redZone.value.length >= 2 && redZone.value[1]) {
    return format(parseISO(redZone.value[1]), "yyyy-MM-dd")
  }
  return null
})

const redZoneText = computed(() => {
  try {
    if (!startDateForGoogle.value || !endDateForGoogle.value) return null
    const period = (format(parseISO(startDateForGoogle.value), "dd.MM.yyyy") ?? 'tbd') + ' - ' + (format(parseISO(endDateForGoogle.value),"dd.MM.yyyy") ?? 'tbd')
    const duration = differenceInCalendarDays(parseISO(endDateForGoogle.value), parseISO(startDateForGoogle.value))

    return "Period: " + period + " (" + duration + "d)"
  } catch (e) {
    return null
  }
})

const actionLabel = computed(() => edit.value ? "Edit Event" : "Add Event")

function clear() {
  googleId.value = null
  summary.value = null
  redZone.value = []
  notes.value = null
  inDeleteConfirmation.value = false
  eventForm.value?.reset()
}

function init() {
  clear()
  inDeleteConfirmation.value = false
  if (event.value) {
    googleId.value = event.value.googleId
    summary.value = event.value.title
    redZone.value = [
      formatISO(event.value.redZone.start, { representation: 'date' }),
      formatISO(event.value.redZone.end, { representation: 'date' })
    ]
    notes.value = event.value.note
    edit.value = true
  } else {
    edit.value = false
  }
}

async function handleEvent() {
  if (edit.value) {
    await editSimpleEvent()
  } else {
    await addSimpleEvent()
  }
}

async function editSimpleEvent() {
  const validation = await eventForm.value?.validate()
  if (!validation?.valid) {
    return
  }
  isLoading.value = true
  await googleCalendarStore.editEvent(
      event.value.googleId,
      summary.value,
      notes.value,
      redZone.value[0],
      redZone.value[1]
  )

  isLoading.value = false
  showDialog.value = false
  await googleCalendarStore.reload()
}

async function addSimpleEvent() {
  const validation = await eventForm.value?.validate()
  if (!validation?.valid) {
    return
  }
  isLoading.value = true
  if (redZone.value[0] > redZone.value[1]) {
    const temp = redZone.value[0]
    redZone.value[0] = redZone.value[1]
    redZone.value[1] = temp
  }
  
  if (startDateForGoogle.value && endDateForGoogle.value) {
    await googleCalendarStore.addEvent(
        summary.value,
        notes.value,
        startDateForGoogle.value,
        endDateForGoogle.value
    )
  }
  clear()
  isLoading.value = false
  showDialog.value = false
  await googleCalendarStore.reload()
}

async function onDelete() {
  isLoading.value = true
  await googleCalendarStore.deleteEvent(event.value.googleId)
  await googleCalendarStore.reload()
  isLoading.value = false
  showDialog.value = false
}

watch(redZone, () => {
  // re-validate as soon as the clearance periode gets adjusted
  eventForm.value?.validate()
})

watch(notes, () => {
  // re-validate as soon as the summary gets adjusted
  eventForm.value?.validate()
})

watch(handleEdit, (newValue) => {
  if (newValue) {
    event.value = newValue
    init()
    showDialog.value = true
  }
})

watch(handleAdd, (newValue) => {
  if (newValue) {
    event.value = null
    init()
    showDialog.value = true
  }
})

watch(showDialog, async (newVal) => {
  // re-validate as soon as the dialog gets opened / closed
  await nextTick()
  eventForm.value?.validate()
  handleEdit.value = null
  handleAdd.value = null
  init()
})
</script>

<style scoped>

</style>