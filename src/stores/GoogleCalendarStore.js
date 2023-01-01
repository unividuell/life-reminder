import {defineStore} from "pinia";
import axios from "axios";
import {addMonths, compareAsc, compareDesc} from "date-fns";

const calendarSummary = 'Live Reminder by unividuell.org'

export const useGoogleCalendarStore = defineStore("GoogleCalendar", {
    state: () => ({
        calendarId: null,
        now: new Date(),
        events: []
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
            let response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`)
            if (response.status !== 200) throw Error('could not load calendar-list')

            this.events = response.data.items.map((gEvent) => ({
                googleId: gEvent.id,
                title: gEvent.summary,
                redZone: { start: new Date(gEvent.start.date), end: new Date(gEvent.end.date) },
                note: gEvent.description,
                closed: gEvent.transparency === "transparent"
            }))
        },
        async addEvent(summary, notes, start, end) {
            let event = {
                summary: summary,
                description: notes,
                start: { date: start },
                end: { date: end },
                transparency: "opaque",
                reminders: {
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
            if (response.status !== 200) throw Error('could not edit calendar event')
        },
        async editEvent(eventId, summary, notes, start, end) {
            let event = {
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
        async setEventState(eventId, desiredState) {
            let gState = desiredState === 'close' ? "transparent" : "opaque"
            let response = await axios.patch(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
                { transparency: gState },
            )
            if (response.status !== 200) throw Error('could not edit state of calendar event')
        },
        async deleteEvent(eventId) {
            let response = await axios.delete(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${eventId}`,
            )
            if (response.status !== 204) throw Error('could not delete of calendar event')
        },
        async setCalendarId() {
            let response = await axios.get(
                'https://www.googleapis.com/calendar/v3/users/me/calendarList',
            )
            if (response.status !== 200) throw Error('could not load calendar-list')

            let ourCalendar = response.data?.items?.find(candidate => candidate.summary === calendarSummary)
            if (ourCalendar) {
                this.calendarId = ourCalendar.id
                console.log(`Calendar with summary ${calendarSummary} is present: ${ourCalendar.id}`)
            } else {
                await this.createCalendar()
                console.log(`Calendar with summary ${calendarSummary} was created: ${ourCalendar.id}`)
            }
        },
        async createCalendar() {
            console.log("Did not found our calendar-backend - will create it..")
            let response = await axios.post(
                'https://www.googleapis.com/calendar/v3/calendars',
                { summary: calendarSummary },
            )
            if (response.status !== 200) throw Error('could not create calendar')

        }
    },
    getters: {
        oneMonthAhead() {
            return addMonths(this.now, 1)
        },
        sortedEvents: (state) => {
            return (sortBy) => [...state.events]
                ?.sort((a, b) => {
                    // first criteria: the date
                    let dateSort
                    if (sortBy == 'end') {
                        dateSort = compareDesc(a.redZone.end, b.redZone.end)
                    } else if (sortBy == 'start') {
                        dateSort = compareDesc(a.redZone.start, b.redZone.start)
                    }
                    if (dateSort !== 0) return dateSort
                    // second criteria: the title
                    if (a.title > b.title) return 1;
                    if (a.title < b.title) return -1;
                })
        },
        pastEvents() {
            return this.sortedEvents.filter((candidate) => candidate.redZone.end < this.now)
        },
        nextMonthEvents() {
            return this.sortedEvents.filter((candidate) => candidate.redZone.end > this.now && candidate.redZone.end < this.oneMonthAhead)
        },
        futureEvents() {
            return this.sortedEvents.filter((candidate) => candidate.redZone.end > this.oneMonthAhead)
        }
    }
})