import { useEffect, useState } from "react";
import { getItem, setItem } from "./useLocalStorage";

export function usePersistedState(key, initialValue){
    const [value, setValue] = useState(()=> {
        const item = getItem(key);
        return item || initialValue;
    })
 
    useEffect(()=>{
        setItem(key, value)
    },[key, value])

    return [value, setValue]
}
