import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";

const { authUser } = useAuthStore();
const useAuth = () => {

    const user = ref(null);

    let data = [0,4,6]
    const isLoggedIn = () => {
        return [10,20]
    }

    const authUserInfo = () => {
      
        return authUser.value?.user;
    }
    return {
        isLoggedIn, authUserInfo
    }
}

export default useAuth