export const useDebounce = () => {
    let timeout = null;
    return function (fn, delayMs = 500) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn();
        }, delayMs);
    };
};
