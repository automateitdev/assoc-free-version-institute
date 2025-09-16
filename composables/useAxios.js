
const useAxios = () =>{
    const nuxtApp = useNuxtApp()
    let ajax = useNuxtApp().$ajax;
    const axios = () => {
        return ajax;
    }

    return {axios}
}

export default useAxios;