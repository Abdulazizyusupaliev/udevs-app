import React, { useState } from 'react'
import { NavLink } from "react-router-dom";
import '../scss/components/header.scss'
import Udevs from '../images/udevs.png'
import { Container } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { deleteItem, getItem } from '../hooks/useLocalStorage';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'




export default function Header({ overlayState }) {
    const [isLoggedIn] = useState(() => {
        const stored = getItem('isLoggedIn');
        return stored || false; // or use [] for empty array
    })

    const [open, setOpen] = useState(true)
    const avas = [avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7]

    const navigationBar = () => {
        const navigationBar = document.querySelector('.navbar')
        const burgerBtn = document.querySelector('.burger__btn')
        const body = document.querySelector('body')
        navigationBar.classList.toggle('nav__active')
        burgerBtn.classList.toggle('.burger__active')
        open ? setOpen(false) : setOpen(true)
        if (open) {
            body.classList.add('overflow__hidden')
        } else if (!open) {
            body.classList.remove('overflow__hidden')
        }
    }

    // USER ICON BUTTON START



    // USER ICON BUTTON END

    // console.log(isLoggedIn);

    return (


        <div className='header' style={{ background: '#FAFAFC', padding: '20px 0px' }}>
            <Container>
                <div className="header__content">
                    <NavLink to='/'><img src={Udevs} alt='udevs' /></NavLink>
                    <nav /*  */ className="navbar">
                        <div onClick={navigationBar} className="backdrop"></div>
                        <ul>
                            <li>
                                <NavLink className="link" to="/home"><span>Все потоки</span></NavLink>
                            </li>
                            <li>
                                <NavLink className="link" to="/saved"><span>Избранные</span></NavLink>
                            </li>
                            <li>
                                <NavLink className="link" to="/administration"><span>Администрирование</span></NavLink>
                            </li>
                            <li>
                            </li>
                            <li>
                                <NavLink className="link" to="/profile"><span>Профиль</span></NavLink>
                            </li>
                            <li>
                                <NavLink className="link" to="/users"><span>Users</span></NavLink>
                            </li>
                            <li>
                                <NavLink className="link" to="/scientificpopular"><span>Научпоп</span></NavLink>
                            </li>
                        </ul>
                    </nav>
                    <div className="buttons">
                        {isLoggedIn ? <PopupState variant="popover" popupId="demo-popup-menu" classList="profile">
                            {(popupState) => (
                                <React.Fragment>
                                    <Button className='profile__pic' {...bindTrigger(popupState)}>
                                        <img style={{borderRadius: '50%'}} src={avas[isLoggedIn?.[0].avatar]} alt="" />
                                    </Button>
                                    <Menu {...bindMenu(popupState)}>
                                        <MenuItem onClick={() => {
                                            popupState.close()
                                            deleteItem('isLoggedIn')
                                            window.location.reload()
                                        }}>Выйти</MenuItem>
                                    </Menu>
                                </React.Fragment>
                            )}
                        </PopupState> : <button onClick={() => overlayState(true)} className='login'>Войти</button>}<button onClick={navigationBar} className="burger__btn">
                            {!open ? <CloseIcon sx={{ color: '#fff' }} /> : <MenuIcon sx={{ color: '#fff' }} />}
                        </button>
                    </div>

                </div>
            </Container>
        </div>




    )
}

