import {defineStore} from "pinia";
import {ref} from "vue";

export const useDialogStore = defineStore('DialogStore', () => {

    const handleState = ref(null)
    const handleDelete = ref(null)
    const handleEdit = ref(null)
    const handleAdd = ref(null)

    function handleEventState(event, desiredState) {
        handleState.value = { event: event, desiredState: desiredState }
    }
    function handleEventDeletion(event) {
        handleDelete.value = event
    }
    function handleEventEditing(event) {
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