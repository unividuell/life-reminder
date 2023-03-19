interface GoogleCalendar {
    summary: String
}

interface GoogleEvent {
    id?: String
    summary: String,
    description: String,
    start: GoogleEventDate,
    end: GoogleEventDate,
    transparency: String,
    reminders: GoogleEventReminders
}

interface GoogleEventDate {
    date: string // yyyy-MM-dd
}

interface GoogleEventReminders {
    useDefault: Boolean,
    overrides: Array<Object>
}