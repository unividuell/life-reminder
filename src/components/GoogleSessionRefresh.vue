<template>
  <v-container fluid>
    <v-card>
      <v-card-title>Your session expired :/</v-card-title>
      <v-card-text>No worries — just do a refresh…</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="refresh">Refresh</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import {useGoogleClient} from "@/composables/useGoogleClient";

const {oauth2Client} = useGoogleClient()

async function refresh() {
  oauth2Client.requestAccessToken()
}

</script>

<style scoped>

</style>