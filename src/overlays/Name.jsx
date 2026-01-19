import { Box, Button } from '@mui/material'
import React, { useRef, useState } from 'react'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import '../scss/overlays/name.scss'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import loadingPic from '../images/loading.png'
import axios from 'axios'
import { setItem } from '../hooks/useLocalStorage'
import { apiUrl } from '../config/api'


const USERS = gql`
    query getUsers{
        admins {
            name,
            password,
            avatar,
            documentId
  }
}
`

export default function Name({ change }) {

  const { loading, error, data, refetch } = useQuery(USERS)

  const [page, setPage] = useState(true)
  const avas = [avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7]
  // const [activePic, setActivePic] = useState(null)
  const [spanT, setSpanT] = useState('')
  // const [userInfo, setUserInfo] = useState({
  //   name: '',
  //   password: '',
  //   avatar: null
  // })
  const firstPassword = useRef()
  const secondPassword = useRef()
  const name = useRef()
  const activePic = useRef(-1)
  const userInfo = useRef({
    name: '',
    password: '',
    avatar: null
  })
  // console.log(avas.length);

  const createAccountAndLogin = async (name, password, ava) => {
    await axios.post(apiUrl('/api/admins'), {
      data: {
        name: name,
        password: password,
        avatar: ava,
      }
    });
    console.log(name, password, ava);
    const res = await refetch()
    console.log(res);

    setItem('isLoggedIn', res.data.admins.filter(e => e.name === name.trim())) 
    window.location.reload()
    // console.log(res);
  };

  // const logIn = async (obj) => {
  //   const res = await refetch()
  //   console.log(res);

  //   // setItem('isLoggedIn', res.data.admins.filter(e => e.name === name.value.trim())) 
  //   console.log(res);

  // }

  const handleClick = (i = -1) => {
    // 
    activePic.current = i
    // 

    const allPics = document.querySelectorAll('.profile__pics')

    const pickedPic = document.getElementById(i)

    for (let j = 0; j < avas.length; j++) {
      allPics[j].style.outline = 'none'
      allPics[j].style.border = 'none'
    }

    pickedPic.style.outline = '2px solid black'
    pickedPic.style.border = '2px solid white'
    // console.log('Current click:', i)  // This will be correct
    // console.log('State (old):', activePic.current)  // This will be behind by 1 click
    // console.log(pickedPic);
  }

  const handleNext = (name) => {
    // console.log(activePic);
    setSpanT('')
    name.style.outline = 'none'

    if (name.value.trim().length <= 2) {
      name.style.outline = '1px solid red'
      if (activePic < 0) {
        setSpanT('выберите фото')
      } else {
        setSpanT('')
      }
    }else if(data.admins.find(e => e.name === name.value.trim())){
      name.style.outline = '1px solid red'
      setSpanT('пользователь с таким именем существует')
    } else {
      name.style.outline = 'none'
      if (activePic < 0) {
        setSpanT('выберите фото')
      } else {
        setSpanT('')
        setPage(false)
        userInfo.current = {
          
          name: name.value,
          password: userInfo.current.password,
          avatar: activePic.current
        }
        // console.log(userInfo.current + ': without password');
        // console.log(userInfo.current);

      }

    }
  }

  const handleCreateAccount = async () => {
    const span = document.querySelector('.password__span')
    firstPassword.current.style.outline = 'none'
    secondPassword.current.style.outline = 'none'
    span.textContent = ''
    // const btn = document.querySelector('.create__account-btn')
    await secondPassword.current.value.trim()

    if (firstPassword.current.value.trim().length <= 5 || secondPassword.current.value.trim().length <= 5) {
      firstPassword.current.style.outline = '2px solid red';
      secondPassword.current.style.outline = '2px solid red';
      span.textContent = 'пароль должен содержать больше 5 букв'
      return;
    }

    try {
      // setUserInfo({
      //   ...userInfo,
      //   password: secondPassword.current.value.trim()
      // })

      // await createAccount(userInfo.name, userInfo.password, userInfo.avatar);
      // await logIn(userInfo.name);

      if (firstPassword.current.value.trim() === secondPassword.current.value.trim()) {

        userInfo.current = {
          name: userInfo.current.name,
          password: secondPassword.current.value.trim(),
          avatar: userInfo.current.avatar 
        }
        // setTimeout(() => {
        //   console.log(userInfo, secondPassword.current.value.trim());
        // }, 2000);

        // console.log(userInfo.current);
        createAccountAndLogin(userInfo.current.name, userInfo.current.password, userInfo.current.avatar)

      } else {
        firstPassword.current.style.outline = '2px solid red';
        secondPassword.current.style.outline = '2px solid red';
        span.textContent = 'пароли не совпадают'
      }
    } catch (err) {
      console.error(err.response?.data);
    }
  }

  if (loading) return <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img style={{
    width: '100px'
  }} src={loadingPic} alt="Loading ..." /></p>
  if (error) return <p>Error</p>

  return (
    <div className='account'>
      {page ? <Box className='name'>
        <p className="title">Как вас зовут?</p>
        <input ref={name} type="text" placeholder='Введите имя' value={userInfo.name} onChange={e => {
          userInfo.current = { ...userInfo, name: e.target.value }
        }} />
        <Box className='name__intro'>
          <p className="inner__title">Выберите аватар</p>
          <Box className='name__intro-content'>
            {avas.map((e, i) => {
              return <img src={e} alt="pic" className='profile__pics' key={i} id={i} onClick={() => handleClick(i)} />
            })}


          </Box>
          <span className='span'>{spanT}</span>
        </Box>
        <button onClick={() => change('login')} className='login__page'>Войти</button>
      </Box> : <Box className='create__password'>
        <p className="title">Придумай пароль для входа</p>
        <div className="inputs">
          <input ref={firstPassword} type="text" placeholder='Придумайте пароль' />
          <input ref={secondPassword} type="text" placeholder='Подтвердите пароль' />
          <span className='password__span'>Пароль должен содержать больше 5 букв</span>
        </div>
      </Box>}




      <Box className='btns'>
        {!page ? <Button className='back__btn' onClick={() => setPage(true)}>Назад</Button> : null}
        {/* <button className='switch__btn' onClick={() => setPage(false)}>{page ? 'Следующий' : 'Создать аккаунт'}</button> */}
        {page ? <Button onClick={() => handleNext(name.current)} className='next__btn'>Следующий</Button> : <Button onClick={() => handleCreateAccount()} className='create__account-btn'>Создать аккаунт</Button>}
      </Box>
    </div>
  )
}
