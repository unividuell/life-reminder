import {defineStore} from "pinia";
import {ref} from "vue";

interface HandleEventState {
    event: LifeReminderEvent
    desiredState: string
}

export const useDialogStore = defineStore('DialogStore', () => {

    const handleState = ref<HandleEventState | null>(null)
    const handleDelete = ref<LifeReminderEvent | null>(null)
    const handleEdit = ref<LifeReminderEvent | null>(null)
    const handleAdd = ref<boolean | null>(null)

    function handleEventState(event: LifeReminderEvent, desiredState: string) {
        handleState.value = { event: event, desiredState: desiredState }
    }
    function handleEventDeletion(event: LifeReminderEvent) {
        handleDelete.value = event
    }
    function handleEventEditing(event: LifeReminderEvent) {
        handleEdit.value = event
    }
    function handleEventAdding() {
        handleAdd.value = true
    }

    return {
        handleState, handleEventState,
        handleDelete, handleEventDeletion,
        handleEdit, handleEventEditing,
        handleAdd, handleEventAdding,
    }
})