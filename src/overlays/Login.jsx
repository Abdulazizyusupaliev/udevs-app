import React, { useRef } from 'react'
import '../scss/overlays/login.scss'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button';
import { setItem } from '../hooks/useLocalStorage';
import loadingPic from '../images/loading.png'
import useFetch from '../hooks/useFetch'
import { apiUrl } from '../config/api'

// const USERS = gql`
//     query getUsers{
//         admins {
//             name,
//             password,
//             avatar
//   }
// }
// `

export default function Login({ change }) {
    const { loading, error, data } = useFetch(apiUrl('/api/admins'))

    const span = useRef()
    const name = useRef()
    const password = useRef()
    const btn = useRef()

    // console.log(data?.[0]);

    const handleClick = (name, password) => {
        // console.log(data.admins)
        if (name.value.trim().length === 0 && password.value.trim().length === 0) {
            name.style.outline = '1px solid red'
            password.style.outline = '1px solid red'
        } else if (name.value.trim().length === 0) {
            name.style.outline = '1px solid red'
            password.style.outline = 'none'
        } else if (password.value.trim().length === 0) {
            name.style.outline = 'none'
            password.style.outline = '1px solid red'
        } else {
            name.style.outline = 'none'
            password.style.outline = 'none'
            const currentUser = data?.filter(e => e.name === name.value.trim())

            if (currentUser.length === 0) {
                // console.log('no');
                name.style.outline = '1px solid red'
                password.style.outline = '1px solid red'
                span.current.classList.add('active')
            } else {
                // console.log(currentUser[0].name + ' ' + currentUser[0].password);
                if (currentUser[0].password === password.value.trim()) {

                    // console.log('success');
                    setItem('isLoggedIn', data?.filter(e => e.name === name.value.trim()))
                    btn.current.style.background = 'gray'
                    window.location.reload()
                } else {
                    // console.log(false);
                    name.style.outline = '1px solid red'
                    password.style.outline = '1px solid red'
                    span.current.classList.add('active')
                }
            }
        }
    }

    if (loading) return <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{
        width: '100px'
    }} src={loadingPic} alt="Loading ..." /></p>
    if (error) return <p>Error</p>

    return (
        <div className='login'>
            <Typography className='title'>Вход на udevs news</Typography>
            <div>
                <input ref={name} placeholder='Name' required type="text" />
                <input ref={password} placeholder='Пароль' requiredtype="password" />
                <span ref={span}>Имя или пароль неправильный</span>
                <button onClick={() => change('name')} className='login__page'>Создать аккаунт</button>
                <Button ref={btn} className='submit' onClick={() => handleClick(name.current, password.current)} >Войти</Button>
            </div>
        </div>
    )
}
