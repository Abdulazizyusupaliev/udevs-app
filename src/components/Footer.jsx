import React from 'react'
import '../scss/components/footer.scss'
import { Box, Container, Typography } from '@mui/material'
import FooterLogo from '../images/footer__logo.png'


export default function Footer() {
  return (
    <div className='footer'>
      <Container>
        <Box className='sc' sx={{display:'flex', justifyContent: 'space-between'}}>
          <div className="left">
            <img src={FooterLogo} alt="logo" />
            <p>Помощник в публикации статей, журналов.
              Список популярных международных конференций.
              Всё для студентов и преподавателей.</p>
          </div>
          <div className="table">
            <p className='table__text'>Ресурсы</p>
            <ul>
              <li>Статьи</li>
              <li>Журналы</li>
              <li>Газеты</li>
              <li>Диплом</li>
            </ul>
          </div>
          <div className="table">
            <p className='table__text'>О нас</p>
            <ul>
              <li>Контакты</li>
              <li>Помощь</li>
              <li>Заявки</li>
              <li>Политика</li>
            </ul>
          </div>
          <div className="table ">
            <p className='table__text'>Помощь</p>
            <ul>
              <li>Часто задаваемые вопросы</li>
            </ul>
          </div>
        </Box>
        <Typography className='copyright'>Copyright © 2020. LogoIpsum. All rights reserved.</Typography>
      </Container>
    </div>
  )
}
