import axios from "axios";
import {useGoogleAuthorizationStore} from "../stores/GoogleAuthorizationStore";

const axiosPlugin = {
    install(app, options) {
        axios.defaults.headers.common['Accept'] = "application/json"
        axios.defaults.headers.common['Content-Type'] = "application/json"
        axios.interceptors.request.use(req => {
            let token = useGoogleAuthorizationStore().accessToken
            if (token) {
                req.headers['Authorization'] = `Bearer ${token}`
            }
            return req;
        });
    }
}

export default axiosPlugin