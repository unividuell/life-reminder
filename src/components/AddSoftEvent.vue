<template>
 <v-form v-model="valid">
   <v-container>
     <v-row>
       <v-col cols="12">
         <v-text-field v-model="summary" label="Summary" required></v-text-field>
       </v-col>
       <v-col cols="12" xs="12" sm="6">
         <v-menu
             ref="redZoneStartPicker"
             v-model="showRedZoneStartPicker"
             :close-on-content-click="false"
             :return-value.sync="redZoneStartDate"
             transition="scale-transition"
             offset-y
             min-width="290px">
           <template v-slot:activator="{ on, attrs }">
             <v-text-field
                 v-model="redZoneStartDate"
                 label="Start date"
                 readonly
                 v-bind="attrs"
                 v-on="on"
             ></v-text-field>
           </template>
           <v-date-picker v-model="redZoneStartDate" no-title scrollable>
             <v-spacer></v-spacer>
             <v-btn text color="primary" @click="showRedZoneStartPicker = false">Cancel</v-btn>
             <v-btn text color="primary" @click="$refs.redZoneStartPicker.save(redZoneStartDate)">OK</v-btn>
           </v-date-picker>
         </v-menu>
       </v-col>
       <v-col cols="12" xs="12" sm="6">
         <v-menu
             ref="redZoneEndPicker"
             v-model="showRedZoneEndPicker"
             :close-on-content-click="false"
             :return-value.sync="redZoneEndDate"
             transition="scale-transition"
             offset-y
             min-width="290px">
           <template v-slot:activator="{ on, attrs }">
             <v-text-field
                 v-model="redZoneEndDate"
                 label="End date"
                 readonly
                 v-bind="attrs"
                 v-on="on"
             ></v-text-field>
           </template>
           <v-date-picker v-model="redZoneEndDate" no-title scrollable>
             <v-spacer></v-spacer>
             <v-btn text color="primary" @click="showRedZoneEndPicker = false">Cancel</v-btn>
             <v-btn text color="primary" @click="$refs.redZoneEndPicker.save(redZoneEndDate)">OK</v-btn>
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
    redZoneStartDate: new Date().toISOString().substr(0, 10),
    showRedZoneStartPicker: false,
    redZoneEndDate: new Date().toISOString().substr(0, 10),
    showRedZoneEndPicker: false,
    redZoneDuration: [],
    notes: ''
  }),
  created() {

  }
}
</script>

<style scoped>

</style>