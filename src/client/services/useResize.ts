import {useEffect, useState} from "react";

/**
 * A hook to get the current window size
 */
export const useResize = (): [number, number] => {
    const [, update] = useState();
    useEffect(() => {
        const listener = () => update({});
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    });

    return [window.innerWidth, window.innerWidth];
};
