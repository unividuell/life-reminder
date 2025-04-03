import axios from "axios";

export type GoogleProfile = {
    email: string;
    family_name: string;
    given_name: string;
    id: string;
    name: string;
    picture: string;
    verified_email: boolean;
}

export const useGoogleProfile = () => {
    async function loadProfile() {
        const response = await axios
            .get<GoogleProfile>(`https://www.googleapis.com/oauth2/v1/userinfo`)
        return response.data
    }
    return {
        loadProfile
    }
}