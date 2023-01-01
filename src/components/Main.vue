<template>
    <LifeEventsListView />
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
  }
}
</script>
