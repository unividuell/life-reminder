import {defineStore} from "pinia";
import {ref} from "vue";

export const useCalendarFilterSettingsStore = defineStore("CalendarFilterSettingsStore", () => {
    const drawerVisible = ref(false)

    // event filter
    const includeClearedEvents = ref(false)
    const includeUpcomingEvents = ref(false)

    function toggleDrawer() {
        drawerVisible.value = !drawerVisible.value
    }

    return { drawerVisible, includeClearedEvents, includeUpcomingEvents, toggleDrawer }
})