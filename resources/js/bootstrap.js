import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 允许 Axios 自动发送 XSRF-TOKEN Cookie
window.axios.defaults.withCredentials = true;

// 保持拦截器，处理万一发生的过期情况
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 419) {
            console.warn('CSRF Expired, refreshing...');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);