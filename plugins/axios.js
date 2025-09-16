// axios.js
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';
import { useRouter, useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin((NuxtApp) => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const router = useRouter(); // Import useRouter from Nuxt's context

    axios.defaults.baseURL = config.public.API_BASE_URL;

    axios.interceptors.request.use(
        async (config) => {
            // Check if the user is authenticated
            const expirationThreshold = 30; // Threshold in seconds
            const accessTokenExpiry = authStore.accessTokenExpiry;
            const isRefreshTokenRequest = config.url === '/merchant/refresh';

            // Check if it's a refresh token request
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            if (accessTokenExpiry && (accessTokenExpiry - currentTimeInSeconds) <= expirationThreshold && !isRefreshTokenRequest) {
                try {
                    // Attempt to refresh the access token
                    await authStore.refreshAccessToken();
                    // Update the Authorization header with the new access token
                    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
                } catch (error) {
                    console.error('Error refreshing access token:', error);
                    authStore.$reset();
                    router.push('/auth/login');
                    // Handle refresh token failure (e.g., redirect to login page)
                }
            } else {
                // Attach access token to request headers
                config.headers.Authorization = `Bearer ${authStore.accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Do not intercept responses with 401 status
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Handle the 401 error without intercepting
                authStore.$reset();
                router.push('/auth/login');
                return Promise.reject(error);
            }
            return Promise.reject(error);
        }
    );
});
