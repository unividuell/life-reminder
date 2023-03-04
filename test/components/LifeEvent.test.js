import { describe, it, expect } from "vitest"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { mount, shallowMount } from "@vue/test-utils"
import LifeEvent from "@/components/LifeEvent.vue"
import {parseISO} from "date-fns";

describe("LiveEvent Component", () => {
    const vuetify = createVuetify({ components, directives})

    it("renders properly", () => {
        const wrapper = mount(LifeEvent, {
            global: {
                plugins: [vuetify]
            },
            props: {
                event: {
                    redZone: {
                        start: parseISO('2023-03-04T10:28:00'),
                        end: parseISO('2023-03-04T10:28:00')
                    },
                    closed: false,
                    title: 'unit testing',
                    note: 'first unit test!'
                }
            },
        })
        expect(wrapper.get('[data-test=title]').text()).toContain('unit testing')
    })
})