// auth.js
import axios from 'axios';
import { defineStore } from 'pinia';
import { useRouter } from 'nuxt/app';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        accessToken: null, // Initialize accessToken as null initially
        refreshToken: null, // Initialize refreshToken as null initially
        accessTokenExpiry: null,
        authError: {
            username: null,
            password: null,
        },
        loading: false,
    }),
    getters: {
        isAuthenticated() {
            return !!this.accessToken;
        },
        getUser() {
            return this.user;
        },
    },
    actions: {
        async authorizedUser() {
            this.loading = true;
            try {
                const response = await axios.get('/merchant/auth-user');
                // console.log(response);
                const { user, authorization } = response.data.payload.data;

                return true;

            } catch (error) {
                // console.error('Login error:', error);
                this.loading = false;
                return false; // Return false if login fails
            }

        },
        async authenticateUser(credentials) {
            this.loading = true;
            try {
                // Send login request to obtain access token and refresh token
                const response = await axios.post('/merchant/login', credentials);
                const { admin, authorization } = response.data.payload.data;

                // Update store state with user data and tokens
                this.user = admin;
                this.accessToken = authorization.access_token;
                this.refreshToken = authorization.refresh_token;
                this.accessTokenExpiry = Math.floor(Date.now() / 1000) + authorization.expires_in * 60;

                return { loginSuccess: true, error: null };
            } catch (error) {
                if (error.response) {
                    const errors = error.response.data.errors.validation_error ?? error.response.data.errors.system_error ?? error.response.data.errors.request_error;
                    const formattedErrors = errors.map(err => `${err.message}`).join('\n');
                    return { loginSuccess: false, error: formattedErrors };
                } else {
                    return { loginSuccess: false, error: "An error occurred during login." };
                }
            } finally {
                this.loading = false;
            }
        },
        async authLogout() {
            this.loading = true;
            const router = useRouter();
            try {
                const response = await axios.post('/merchant/logout');
                // Clear tokens and user data
                this.user = null;
                this.accessToken = null;
                this.refreshToken = null;

                // Optionally redirect to the login page
                router.push('/auth/login');
            } catch (error) {
                console.error('Logout error:', error);
                this.user = null;
                this.accessToken = null;
                this.refreshToken = null;
                this.accessTokenExpiry = null;
                router.push('/auth/login');
                return false; // Return false if logout fails
            } finally {
                this.loading = false;
            }
        },
        async refreshAccessToken() {
            try {
                const response = await axios.post('/merchant/refresh');
                const { authorization } = response.data.payload.data;
                // Update store state with new access token and its expiry time
                this.accessToken = authorization.access_token;
                this.accessTokenExpiry = Math.floor(Date.now() / 1000) + authorization.expires_in * 60;;
            } catch (error) {
                console.error('Error refreshing access token:', error);
                throw error; // Propagate error for handling in axios.js
            }
        },
    },
    persist: true,
});