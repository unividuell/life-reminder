import { setActivePinia, createPinia } from "pinia";
import { useGoogleCalendarStore } from "@/stores/GoogleCalendarStore";
import {describe, expect, vi} from "vitest";
import {parseISO} from "date-fns";
import axios from "axios";

vi.mock('axios')

describe('Google Calendar Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        axios.get.mockReset()
        axios.post.mockReset()
    })
    describe('set calendar id', () => {
        it('reuses our calendar at google', async () => {
            // prepare
            const sut = useGoogleCalendarStore()

            const googleCalendars = [{summary: 'noise'},{id: 'expected', summary: 'Live Reminder by unividuell.org'}]
            axios.get.mockImplementation((url) => {
                switch (url) {
                    case 'https://www.googleapis.com/calendar/v3/users/me/calendarList':
                        return Promise.resolve({
                            status: 200,
                            data: { items: googleCalendars }
                        })
                    default:
                        return Promise.resolve({
                            status: 200,
                            data: { items: [] }
                        })
                }
            })

            // execute
            await sut.loadCalendarItems()

            // verify
            // assert to NOT created a new calendar at google
            expect(axios.post).not.toHaveBeenCalled()
        })
        it ('creates our calendar at google if not already present', async () => {
            // prepare
            const sut = useGoogleCalendarStore()

            axios.get.mockImplementation((url) => {
                switch (url) {
                    case 'https://www.googleapis.com/calendar/v3/users/me/calendarList':
                        return Promise.resolve({
                            status: 200,
                            data: { items: [{summary: 'noise'}]}
                        })
                    default:
                        return Promise.resolve({
                            status: 200,
                            data: { items: [] }
                        })
                }
            })
            axios.post.mockResolvedValue({
                status: 200,
                data: { id: 'expected' }
            })

            // execute
            await sut.loadCalendarItems()

            // verify
            expect(axios.post).toHaveBeenCalledWith(
                `https://www.googleapis.com/calendar/v3/calendars`,
                { summary: 'Live Reminder by unividuell.org' }
            )
        })
    })

    describe('add event', () => {
        it('makes a POST request to google', async () => {
            // prepare
            const sut = useGoogleCalendarStore()
            const googleCalendars = [{id: 'calendar-id', summary: 'Live Reminder by unividuell.org'}]
            axios.get.mockImplementation((url) => {
                switch (url) {
                    case 'https://www.googleapis.com/calendar/v3/users/me/calendarList':
                        return Promise.resolve({
                            status: 200,
                            data: { items: googleCalendars }
                        })
                    default:
                        return Promise.resolve({
                            status: 200,
                            data: { items: [] }
                        })
                }
            })
            await sut.loadCalendarItems()

            const payload = {
                summary: 'summary',
                description: 'note',
                start: { date: parseISO('2023-03-04T10:50:12') },
                end:   { date: parseISO('2023-03-12T10:50:12') },
                transparency: "opaque",
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 6 * 60 }
                    ]
                }
            }
            axios.post.mockResolvedValue({
                status: 200,
                data: payload
            })

            // execute
            await sut
                .addEvent(
                    'summary',
                    'note',
                    parseISO('2023-03-04T10:50:12'),
                    parseISO('2023-03-12T10:50:12'),
                )

            // verify
            expect(axios.post).toHaveBeenCalledWith(`https://www.googleapis.com/calendar/v3/calendars/calendar-id/events`, payload)
        })
    })
})