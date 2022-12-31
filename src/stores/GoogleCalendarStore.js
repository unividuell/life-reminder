import {defineStore} from "pinia";
import axios from "axios";
import {useGoogleAuthorizationStore} from "./GoogleAuthorizationStore";
import {addMonths, compareAsc} from "date-fns";

const calendarSummary = 'Live Reminder by unividuell.org'

export const useGoogleCalendarStore = defineStore("GoogleCalendar", {
    state: () => ({
        calendarId: null,
        now: new Date(),
        events: []
    }),
    actions: {
        async loadCalendarItems() {
            await this.setCalendarId()

            if (this.calendarId === null) {
                throw Error('Did not get a valid calendar ID')
            }
            let response = await axios.get(
                `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
                {
                    headers:
                        {
                            Accept : 'application/json',
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                }
            )
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
                {
                    headers:
                        {
                            Accept : 'application/json',
                            'Content-Type' : 'application/json',
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                }
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
                {
                    headers:
                        {
                            Accept : 'application/json',
                            'Content-Type' : 'application/json',
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                }
            )
            if (response.status !== 200) throw Error('could not edit calendar event')
        },
        async setCalendarId() {
            let response = await axios.get(
                'https://www.googleapis.com/calendar/v3/users/me/calendarList',
                {
                    headers:
                        {
                            Accept : 'application/json',
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                }
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
                {
                    headers:
                        {
                            Accept : 'application/json',
                            'Content-Type' : 'application/json',
                            Authorization: `Bearer ${useGoogleAuthorizationStore().accessToken}`
                        }
                }
            )
            if (response.status !== 200) throw Error('could not create calendar')

        }
    },
    getters: {
        oneMonthAhead() {
            return addMonths(this.now, 1)
        },
        sortedEvents() {
            return [...this.events]
                ?.sort((a, b) => {
                    // first criteria: the end date
                    let dateSort = compareAsc(a.redZone.end, b.redZone.end)
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