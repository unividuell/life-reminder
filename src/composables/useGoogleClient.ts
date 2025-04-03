import {useGoogleAuthStore} from "../stores/GoogleAuthStore";

export type AccessTokenResponse = {
    access_token: string;
    authuser: string;
    expires_in: number;
    prompt: string;
    scope: string;
    token_type: string;
}

export const useGoogleClient = () => {
    const store = useGoogleAuthStore()
    // this uses the loaded script from index.html (https://accounts.google.com/gsi/client)
    const oauth2Client = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GAPI_CLIENT_ID,
        // doc: https://developers.google.com/identity/protocols/oauth2/scopes#people
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: any) => {
            if ("access_token" in response) {
                console.log(response)
                store.authorize(response)
                return
            }
            console.warn(`Ignoring this response:`, response)
        },
    });

    return {
        oauth2Client
    }
}