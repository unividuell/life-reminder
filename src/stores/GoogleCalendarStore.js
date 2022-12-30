import {defineStore} from "pinia";
import axios from "axios";
import {useGoogleAuthorizationStore} from "./GoogleAuthorizationStore";

const calendarSummary = 'Live Reminder by unividuell.org'

export const useGoogleCalendarStore = defineStore("GoogleCalendar", {
    state: () => ({
        calendarId: null,
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
    }
})