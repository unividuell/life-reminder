import axios from "axios";
import {useGoogleAuthenticationStore} from "../stores/GoogleAuthenticationStore";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";
import {App} from "vue";

interface AxiosOptions {
    // empty
}

// kudos: https://blog.logrocket.com/how-use-axios-vue-js/
const axiosPlugin = {
    install(app: App, options: AxiosOptions) {
        axios.defaults.headers.common['Accept'] = "application/json"
        axios.defaults.headers.common['Content-Type'] = "application/json"
        axios.interceptors.request.use(req => {
            let token = useGoogleAuthorizationStore().accessToken
            if (token) {
                req.headers['Authorization'] = `Bearer ${token}`
            }
            return req;
        });
        axios.interceptors.response.use(resp => {
            return resp
        }, async error => {
            if (error.response.status === 401) {
                console.warn(`init resetting token`)
                await useGoogleAuthenticationStore().logout()
            }
            return Promise.reject(error);
        })
    }
}

export default axiosPlugin