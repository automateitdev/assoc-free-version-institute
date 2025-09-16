import { defineNuxtRouteMiddleware } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const { authorizedUser } = authStore;
  // console.log(authStore.isAuthenticated);
  // Check if user is authenticated
  const user_authorized = authorizedUser();
  if (!authStore.isAuthenticated || !user_authorized) {
    // Redirect to login or handle unauthenticated state
    return navigateTo('/auth/login');
  }
});