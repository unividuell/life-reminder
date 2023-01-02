// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

// kudos: https://next.vuetifyjs.com/en/features/theme/#changing-theme
const myCustomLightTheme = {
    dark: false,
    colors: {
        primary: '#000000',
    }
}

export default createVuetify({
    theme: {
        defaultTheme: 'myCustomLightTheme',
        themes: {
            myCustomLightTheme,
        }
    }
});

