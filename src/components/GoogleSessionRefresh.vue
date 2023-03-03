<template>
  <v-container fluid>
    <v-card>
      <v-card-title>Your session expired :/</v-card-title>
      <v-card-text>Congratulations, you are a Life Reminder 3000 power user 🚤</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="refresh">Refresh</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import {ref} from "vue";
import {storeToRefs} from "pinia";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";

const authenticationStore = useGoogleAuthenticationStore()
const authorizationStore = useGoogleAuthorizationStore()

const { currentUser } = storeToRefs(authenticationStore)

const showDialog = ref(false)

async function refresh() {
  await authorizationStore.authorize(currentUser.value.email)
}

</script>

<style scoped>

</style>