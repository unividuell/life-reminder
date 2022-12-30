<template>
  <v-container>
    <v-row>
      <v-col class="mb-4">
        <LifeEventsListView v-on:reload="reload" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LifeEventsListView from "@/components/LifeEventsListView.vue";

export default {
  name: 'Main',
  components: {LifeEventsListView},
  data: () => ({

  }),
  methods: {
    addEvent() {
      this.$refs.addSoftEvent.open()
    },
    reload() {
      // this.loadEvents()
    }
  }
}
</script>
