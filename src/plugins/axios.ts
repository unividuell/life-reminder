import axios from "axios";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {App} from "vue";
import {useGoogleCalendarStore} from "../stores/GoogleCalendarStore";

interface AxiosOptions {
    // empty
}

// kudos: https://blog.logrocket.com/how-use-axios-vue-js/
const axiosPlugin = {
    install(app: App, options: AxiosOptions) {
        axios.defaults.headers.common['Accept'] = "application/json"
        axios.defaults.headers.common['Content-Type'] = "application/json"
        axios.interceptors.request.use(req => {
            useGoogleCalendarStore().activeHttpLoading = true
            let token = useGoogleAuthorizationStore().accessToken
            if (token) {
                req.headers['Authorization'] = `Bearer ${token}`
            }
            return req;
        });
        axios.interceptors.response.use(resp => {
            useGoogleCalendarStore().activeHttpLoading = false
            return resp
        }, async error => {
            if (error.response.status === 401) {
                console.warn(`init resetting token`)
                useGoogleAuthorizationStore().reset()
            }
            useGoogleCalendarStore().activeHttpLoading = false
            return Promise.reject(error);
        })
    }
}

export default axiosPlugin