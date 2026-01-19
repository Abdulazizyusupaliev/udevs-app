import React from 'react'
import { Link } from 'react-router-dom'
import '../scss/pages/notfound.scss'

export default function Notfound() {
  return (
    <main className="notfound">
      <div className="notfound__panel">
        <span className="notfound__tag">404</span>
        <h1>Ошибка!</h1>
        <p>К сожалению, удалось найти страницу.</p>
        <div className="notfound__actions">
          <Link to="/" className="notfound__btn">Домой</Link>
          <Link to="/home" className="notfound__ghost">Посты</Link>
        </div>
      </div>
      <div className="notfound__art" aria-hidden="true">
        <div className="notfound__orb" />
        <div className="notfound__grid" />
        <div className="notfound__cutout">404</div>
      </div>
    </main>
  )
}
