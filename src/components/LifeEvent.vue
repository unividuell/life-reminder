<template>
  <v-card class="mx-auto">
    <v-app-bar flat color="deep-purple darken-2" dark>
      <v-icon>mdi-calendar</v-icon>

      <v-toolbar-title class="title pl-4">
        {{ event.title }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>
    <v-card-title class="headline">{{ endLabel }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.description }}</v-card-text>
  </v-card>
</template>

<script>
import { formatDistanceToNow, isFuture } from 'date-fns'

export default {
  name: "LifeEvent",
  props: ["event"],
  data: () => ({
    formatDistanceToNow
  }),
  computed: {
    endLabel() {
      let ownPrefix = isFuture(this.event.redZone.end) ? 'ends' : 'ended'
      return `${ownPrefix} ${formatDistanceToNow(this.event.redZone.end, {addSuffix: true})}`
    }
  }
}
</script>

<style scoped>

</style>