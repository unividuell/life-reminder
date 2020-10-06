<template>
  <v-card class="mx-auto">
    <v-card-title class="headline">{{ event.title }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.description }}</v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "LifeEvent",
  props: ["event"]
}
</script>

<style scoped>

</style>