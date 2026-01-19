import React from 'react'
import '../scss/pages/register.scss'

export default function Register() {
  return (
    <main className="register">
      <div className="register__veil" aria-hidden="true" />
      <div className="register__signal">
        <div className="register__glow" aria-hidden="true" />
        <h1>Вам нужно зарегестрироваться.</h1>
      </div>
      <div className="register__grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
    </main>
  )
}
