interface LifeReminderEvent {
    googleId: String,
    title: String,
    redZone: RedZone,
    note: String,
    closed: Boolean
}

interface RedZone {
    start: Date
    end: Date
}
