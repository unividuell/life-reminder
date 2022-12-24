import Vue from "vue";
import VueGoogleApi from './vue-google-api-patch/vue-google-api-patch';

const apiKey = import.meta.env.VITE_GAPI_KEY;
const clientId = import.meta.env.VITE_GAPI_CLIENT_ID;

if (!apiKey || !clientId) {
    throw new Error(
        "Has the .env file been setup? One or both variables are not set: " +
        "VITE_GAPI_API_KEY=" + apiKey +
        ", VITE_GAPI_CLIENT_ID=" + clientId
    );
}

// See all available scopes here: https://developers.google.com/identity/protocols/googlescopes"
const apiConfig = {
    apiKey,
    clientId,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    scope: "https://www.googleapis.com/auth/calendar profile"
};

if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log("apiConfig", apiConfig);
}

Vue.use(VueGoogleApi, apiConfig);