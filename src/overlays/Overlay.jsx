import React, { useState } from 'react'
import '../scss/overlays/overlay.scss'
import Name from './Name'
import Login from './Login'

export default function Overlay({ currentState, overlayState, overlayType }) {
    const [currentOverlayType, setCurrentOverlayType] = useState(overlayType)
    
    if (!currentState) {
        return null
    }

    const changeOfOverlayType = (message) => {
        setCurrentOverlayType(message)
        // console.log('Changed to:', message);
    }

    return (
        <>
            <div onClick={() => overlayState(false)} className='overlay__backdrop'></div>
            <div className='overlay__content'>
                {currentOverlayType === 'login' ? 
                    <Login change={changeOfOverlayType}/> : 
                    <Name change={changeOfOverlayType}/>
                }
            </div>
        </>
    )
}