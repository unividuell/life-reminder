<template>
 <v-form v-model="valid">
   <v-container>
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
   </v-container>
 </v-form>
</template>

<script>
export default {
  name: "AddSoftEvent",
  data: () => ({
    valid: false,
    summary: null,
    redZone: [ ],
    showRedZonePicker: false,
    notes: ''
  }),
  created() {

  },
  computed: {
    redZoneText () {
      return this.redZone.join(' ~ ')
    },
  },
}
</script>

<style scoped>

</style>