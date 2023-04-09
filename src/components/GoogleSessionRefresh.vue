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
import {ref} from "vue";
import {storeToRefs} from "pinia";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";

const authenticationStore = useGoogleAuthenticationStore()
const authorizationStore = useGoogleAuthorizationStore()

const { currentUser } = storeToRefs(authenticationStore)

const showDialog = ref(false)

async function refresh() {
  if (currentUser.value?.email) {
    await authorizationStore.authorize(currentUser.value.email)
  } else {
    console.warn('no currentUser.email available for refresh!')
  }
}

</script>

<style scoped>

</style>