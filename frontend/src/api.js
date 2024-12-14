import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // تأكد من تعديل الرابط حسب الخادم الخاص بك
});

axiosInstance.interceptors.request.use(
    config => {
        // تحقق من أن الطلب ليس لتسجيل الدخول أو التسجيل قبل إضافة التوكن
        if (!config.url.startsWith('/auth/')) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Token ${token}`;
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
