<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4" v-if="isAuthenticated">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to Agira
        </h1>

        <p class="subheading font-weight-regular">Your calendars:</p>

        <v-chip
            class="ma-2"
            color="primary"
            v-for="calendar in calendars" :key="calendar.id"
        >
          {{ calendar.name }}
        </v-chip>

      </v-col>
      <v-col cols="12" v-else>Please log in.</v-col>
    </v-row>
  </v-container>
</template>

<script>
import GoogleCalendarApi from "@/api/GoogleCalendarApi";
import { handlePromise } from "@/libs/common";

  export default {
    name: 'HelloWorld',
    props: {
      calendarId: {
        type: String,
        required: false,
        default: "primary"
      }
    },

    data: () => ({
      currentUser: null,
      googleCalendarApi: null,
      calendars: null
    }),
    async created() {
      if (this.isAuthenticated) {
        this.currentUser = this.$gapi.getUserData()
        await this.initGoogleCalendarApi()
        await this.retrieveCalendars()
      }
    },
    computed: {
      isAuthenticated() {
        return this.$store.state.authenticated
      }
    },
    methods: {
      async initGoogleCalendarApi() {
        let response = await handlePromise(this.$gapi.getGapiClient());
        if (response.success) {
          const client = response.data.client;
          this.googleCalendarApi = new GoogleCalendarApi(client);
        } else {
          // eslint-disable-next-line no-console
          console.error("Failed to get gapi client", response.err);
        }
      },
      async retrieveCalendars() {
        const calendar = this.googleCalendarApi;
        if (calendar) {
          try {
            const items = await calendar.retrieveCalendars();
            let calendars = [];
            // let primaryId = null;
            items.forEach(item => {
              let name = item.summary + (item.primary ? " (primary)" : "");
              calendars.push({
                id: item.id,
                name,
                primary: item.primary
              });
              // if (item.primary) primaryId = item.id;
            });
            // this.selectedCalendarId = this.calendarId || primaryId;
            this.calendars = calendars;
            console.log(calendars)
            // If we do not have a calendarId we need to emit an event to retrieve the calendar events
            // if (!this.calendarId) this.calendarChanged();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Failed to retrieve calendars", err);
          }
        }
      }
    }
  }
</script>
