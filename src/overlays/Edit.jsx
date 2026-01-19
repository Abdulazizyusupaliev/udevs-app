import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import '../scss/overlays/edit.scss'
import { apiUrl } from '../config/api'

export default function Edit({ name, career, initialDate, place, documentId, updateFunction }) {
    const userName = useRef()
    const userCareer = useRef()
    const userPlace = useRef()
    const [date, setDate] = useState(initialDate || '')
    const [error, setError] = useState('')
    const today = new Date().toISOString().slice(0, 10)
    const minDate = '1940-01-01'
    const [dateWarning, setDateWarning] = useState('')

    const getDateWarning = (value) => {
        if (!value) return ''
        if (value < minDate) return `Год рождения должен быть после ${minDate}.`
        if (value > today) return 'Год рождения не может быть после сегодняшнего дня.'
        return ''
    }

    const clearDate = () => {
        setDate('')
        setDateWarning('')
    }

    useEffect(() => {
        setDate(initialDate || '')
        setDateWarning(getDateWarning(initialDate || ''))
    }, [getDateWarning, initialDate])

    const handleSave = async () => {
        const nameValue = userName.current?.value?.trim()
        const careerValue = userCareer.current?.value?.trim()
        const placeValue = userPlace.current?.value?.trim()
        const dateValue = date?.trim()

        if (!documentId) {
            setError('Не удалось найти пользователя.')
            return
        }

        if (!nameValue || !careerValue || !placeValue || !dateValue) {
            setError('Пожалуйста, заполните все поля.')
            return
        }

        const dateRangeWarning = getDateWarning(dateValue)
        if (dateRangeWarning) {
            setError(dateRangeWarning)
            return
        }

        try {
            setError('')
            await axios.put(apiUrl(`/api/admins/${documentId}`), {
                data: {
                    name: nameValue,
                    career: careerValue,
                    placeOfBirth: placeValue,
                    dateOfBirth: dateValue
                }
            })
            updateFunction('update')

        } catch (err) {
            console.log(err)
            setError('Не удалось изменить.')
        }
    }

    return (
        <div className='edit'>
            <input ref={userName} defaultValue={name} type="text" placeholder='Name' />
            <input ref={userCareer} defaultValue={career} type="text" placeholder='Career' />
            <input ref={userPlace} defaultValue={place} type="text" placeholder='Place of birth' />
            <div className='edit__calendar'>
                <label className='edit__label' htmlFor='edit-birthdate'>Дата рождения</label>
                <input
                    id="edit-birthdate"
                    type="date"
                    value={date}
                    onChange={(e) => {
                        const nextValue = e.target.value
                        setDate(nextValue)
                        setDateWarning(getDateWarning(nextValue))
                    }}
                    min={minDate}
                    max={today}
                />
                <div className='edit__hint'>Выберите дату рождения.</div>
                {dateWarning ? <div className='edit__warning'>{dateWarning}</div> : null}
                <div className='edit__calendar-actions'>
                    <button type="button" onClick={clearDate}>удалить</button>
                </div>
            </div>
            {error ? <div className='edit__error'>{error}</div> : null}
            <div className='edit__submit'>
                <button type="button" onClick={handleSave}>Изменить</button>
            </div>
        </div>
    )
}
