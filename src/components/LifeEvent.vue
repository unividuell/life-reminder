<template>
  <v-card class="mx-auto" outlined>
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
    <v-progress-linear
        color="pink"
        v-model="remainingTime"
        reverse
        height="12"
    ></v-progress-linear>
    <v-card-title class="headline">{{ endLabel }}</v-card-title>
    <v-card-subtitle>{{ event.redZone.start.toLocaleDateString() }} - {{ event.redZone.end.toLocaleDateString() }}</v-card-subtitle>
    <v-card-text>{{ event.description }}</v-card-text>
  </v-card>
</template>

<script>
import { formatDistanceToNow, isFuture, isWithinInterval, eachDayOfInterval, differenceInCalendarDays } from 'date-fns'

export default {
  name: "LifeEvent",
  props: ["event"],
  data: () => ({
    now: new Date()
  }),
  computed: {
    endLabel() {
      let ownPrefix = isFuture(this.event.redZone.end) ? 'ends' : 'ended'
      return `${ownPrefix} ${formatDistanceToNow(this.event.redZone.end, {addSuffix: true})}`
    },
    remainingTime() {
      // 10 days period
      // today is day 5
      // => 50%
      let inRedZone = isWithinInterval(this.now, {start: this.event.redZone.start, end: this.event.redZone.end})
      if (! inRedZone) {
        // we are currently not in this red-zone
        if (isFuture(this.event.redZone.end)) {
          return 100
        } else {
          return 0
        }
      }

      let redZoneDurationInDays = eachDayOfInterval({start: this.event.redZone.start, end: this.event.redZone.end}).length
      let daysLeft = differenceInCalendarDays(this.event.redZone.end, this.now)
      console.log(`${this.event.title}: ${daysLeft}/${redZoneDurationInDays}`)
      return 100 - ((daysLeft / redZoneDurationInDays) * 100)
    }
  }
}
</script>

<style scoped>

</style>