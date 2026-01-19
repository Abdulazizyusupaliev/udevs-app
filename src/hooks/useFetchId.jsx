import React, {useEffect,useState} from 'react'

export default function useFetchId(url, n) {
    const [data,setData] = useState(null)
    const [error,setError] = useState(null)
    const [loading,setLoading] = useState(true)
    const [id, setId] = useState(null)
    
    useEffect(()=>{
        const fetchData = async() => {
            setLoading(true)
            try{
                const res = await fetch(url)
                const json = await res.json()
                const foundItem = json.data.filter(item => item.id === parseInt(n));
                setData(foundItem)
                setLoading(false)
            }catch(error){
                setError(true)
                setLoading(false)
                // setData('dsf')
            }
        }

        fetchData()
    }, [url])

    return {loading, error, data}
}
