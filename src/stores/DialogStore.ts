import {defineStore} from "pinia";
import {ref} from "vue";

interface HandleEventState {
    event: LifeReminderEvent
    desiredState: string
}

export const useDialogStore = defineStore('DialogStore', () => {

    const handleState = ref<HandleEventState | null>(null)
    const handleEdit = ref<LifeReminderEvent | null>(null)
    const handleAdd = ref<boolean | null>(null)

    function handleEventState(event: LifeReminderEvent, desiredState: string) {
        handleState.value = { event: event, desiredState: desiredState }
    }
    function handleEventEditing(event: LifeReminderEvent) {
        handleEdit.value = event
    }
    function handleEventAdding() {
        handleAdd.value = true
    }

    return {
        handleState, handleEventState,
        handleEdit, handleEventEditing,
        handleAdd, handleEventAdding,
    }
})