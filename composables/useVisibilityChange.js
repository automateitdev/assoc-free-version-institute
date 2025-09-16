// composables/useVisibilityChange.js
import { onMounted, onUnmounted } from 'vue';

export default function useVisibilityChange(callback) {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      callback();
    }
  };

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });
}
