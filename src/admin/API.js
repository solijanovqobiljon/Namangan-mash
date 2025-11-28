import axios from "axios";

const baseURL = 'https://tokenized.pythonanywhere.com/api/'

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Faqat token mavjud bo'lganda Authorization headerini qo'shamiz
// Token bo'lmasa ham API so'rovlari ishlashi kerak
const token = localStorage.getItem("admin_access");
if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// Request interceptor - har so'rovdan oldin token tekshirish
api.interceptors.request.use(
    (config) => {
        // Har so'rovda yangi token tekshirish
        const currentToken = localStorage.getItem("admin_access");
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        } else {
            // Token bo'lmasa, Authorization headerini o'chirish
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - xatolarni qayta ishlash
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Agar 401 xato bo'lsa va hali qayta urinilmagan bo'lsa
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (refreshToken) {
                    // Token yangilash so'rovi
                    const response = await axios.post(baseURL + 'token/refresh/', {
                        refresh: refreshToken,
                    });
                    
                    const { access } = response.data;
                    
                    // Yangi tokenlarni saqlash
                    localStorage.setItem('admin_access', access);
                    
                    // Header yangilash
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    
                    // Original so'rovni qayta urinish
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token yangilash muvaffaqiyatsiz:', refreshError);
                
                // Tokenlarni tozalash
                localStorage.removeItem('admin_access');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('admin_username');
                
                // Login sahifasiga yo'naltirish
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        // Boshqa xatolarni qaytarish
        return Promise.reject(error);
    }
);

export default api;