import { describe, it, expect, vi } from "vitest"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { mount, shallowMount } from "@vue/test-utils"
import LifeEvent from "@/components/LifeEvent.vue"
import {addDays, parseISO, subDays} from "date-fns";

describe("LiveEvent Component", () => {
    const vuetify = createVuetify({ components, directives})
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers()
    })
    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers()
    })

    it("renders properly", () => {
        let now = parseISO('2023-03-04T11:00:00')
        vi.setSystemTime(now)

        const wrapper = mount(LifeEvent, {
            global: {
                plugins: [vuetify]
            },
            props: {
                event: {
                    redZone: {
                        start: subDays(now, 2),
                        end: addDays(now, 4)
                    },
                    closed: false,
                    title: 'unit testing',
                    note: 'first unit test!'
                }
            },
        })
        expect(wrapper.get('.v-card-title').text()).toContain('unit testing')
        expect(wrapper.get('[data-test=note]').text()).toContain('first unit test!')
        expect(wrapper.get('.headline').text()).toContain('ends in 4 days')
    })
})