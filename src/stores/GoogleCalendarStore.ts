import {defineStore} from "pinia";
import axios, {AxiosResponse} from "axios";
import {addMonths, compareAsc} from "date-fns";

const calendarSummary = 'Live Reminder by unividuell.org'

export const useGoogleCalendarStore = defineStore("GoogleCalendar", {
    state: () => ({
        calendarId: null as String | null,
        now: new Date(),
        events: [] as LifeReminderEvent[]
    }),
    actions: {
        async reload() {
          await this.loadCalendarItems()
        },
        async loadCalendarItems() {
            if (! this.calendarId) {
                await this.setCalendarId()
            }

            if (this.calendarId === null) {
                throw Error('Did not get a valid calendar ID')
            }
            let response: AxiosResponse = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`)
            if (response.status !== 200) throw Error('could not load calendar-list')

            this.events = response.data.items.map((gEvent: GoogleEvent) => <LifeReminderEvent>{
                googleId: gEvent.id,
                title: gEvent.summary,
                redZone: <RedZone>{ start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
                note: gEvent.description,
                closed: gEvent.transparency === "transparent"
            })
        },
        async addEvent(summary: String, notes: String, start: string, end: string) {
            let event = <GoogleEvent>{
                summary: summary,
                description: notes,
                start: <GoogleEventDate>{ date: start },
                end: <GoogleEventDate>{ date: end },
                transparency: "opaque",
                reminders: <GoogleEventReminders>{
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 6 * 60 }
                    ]
                }
            }
            let response = await axios.post(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
                event,
            )
            if (response.status !== 200) throw Error(`could not edit calendar event, got http status ${response.status}`)
        },
        async editEvent(eventId: String, summary: String, notes: String, start: string, end: string) {
            let event = <GoogleEvent>{
                summary: summary,
                description: notes,
                start: { date: start },
                end: { date: end }
            }
            let response = await axios.patch(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
                event,
            )
            if (response.status !== 200) throw Error('could not edit calendar event')
        },
        async setEventState(eventId: String, desiredState: String) {
            let gState = desiredState === 'close' ? "transparent" : "opaque"
            let response = await axios.patch(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
                { transparency: gState },
            )
            if (response.status !== 200) throw Error('could not edit state of calendar event')
        },
        async deleteEvent(eventId: String) {
            let response = await axios.delete(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
            )
            if (response.status !== 204) throw Error('could not delete of calendar event')
        },
        async setCalendarId() {
            let response = await axios.get(
                'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            )
            if (response.status !== 200) throw Error(`could not load calendar-list, got http status ${response.status}`)

            let ourCalendar = response.data?.items
                ?.find((candidate: GoogleCalendar) => candidate.summary === calendarSummary)
            if (ourCalendar) {
                this.calendarId = ourCalendar.id
                console.log(`Calendar with summary ${calendarSummary} is present: ${ourCalendar.id}`)
            } else {
                let createdCalendar = await this.createCalendar()
                console.log(`Calendar with summary ${calendarSummary} was created: ${createdCalendar.id}`)
                this.calendarId = createdCalendar.id
            }
        },
        async createCalendar() {
            console.log("Did not found our calendar-backend - will create it..")
            let response = await axios.post(
                'https://www.googleapis.com/calendar/v3/calendars',
                <GoogleCalendar>{ summary: calendarSummary },
            )
            if (response.status !== 200) throw Error('could not create calendar')
            return response.data
        }
    },
    getters: {
        oneMonthAhead(): Date {
            return addMonths(this.now, 1)
        },
        sortedEvents: (state) => {
            return (sortBy: String) => [...state.events]
                ?.sort((a, b) => {
                    // first criteria: the date
                    let dateSort: number = 0
                    if (sortBy == 'end') {
                        dateSort = compareAsc(a.redZone.end, b.redZone.end)
                    } else if (sortBy == 'start') {
                        dateSort = compareAsc(a.redZone.start, b.redZone.start)
                    }
                    if (dateSort !== 0) return dateSort
                    // second criteria: the title
                    if (a.title > b.title) return 1
                    if (a.title < b.title) return -1
                    return 0
                }) as LifeReminderEvent[]
        }
    }
})