import { describe, it, expect } from "vitest"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

import { mount, shallowMount } from "@vue/test-utils"
import LifeEvent from "@/components/LifeEvent.vue"
import {addDays, subDays} from "date-fns";

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
                        start: subDays(new Date(), 2),
                        end: addDays(new Date(), 4)
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