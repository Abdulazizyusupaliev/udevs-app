import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../scss/overlays/editposts.scss'
import { apiUrl } from '../config/api'

export default function EditPosts({ title, descriptions, documentId, updateFunction }) {
  const [titleValue, setTitleValue] = useState(title || '')
  const [descriptionsValue, setDescriptionsValue] = useState(descriptions || '')
  const [error, setError] = useState('')

  useEffect(() => {
    setTitleValue(title || '')
    setDescriptionsValue(descriptions || '')
  }, [title, descriptions, documentId])

  const handleSave = async () => {
    const nextTitle = titleValue.trim()
    const nextDescriptions = descriptionsValue.trim()

    if (!documentId) {
      setError('Не удалось найти пост.')
      return
    }

    if (!nextTitle || !nextDescriptions) {
      setError('Пожалуйста, заполните все поля.')
      return
    }

    try {
      setError('')
      await axios.put(apiUrl(`/api/posts/${documentId}`), {
        data: {
          title: nextTitle,
          descriptions: nextDescriptions
        }
      })
      updateFunction('post', { documentId, title: nextTitle, descriptions: nextDescriptions }, { mode: 'replace' })
    } catch (err) {
      console.log(err)
      setError('Could not update the post.')
    }
  }

  return (
    <div className='edit'>
      <input
        value={titleValue}
        type="text"
        placeholder="Title"
        onChange={(e) => setTitleValue(e.target.value)}
      />
      <textarea
        value={descriptionsValue}
        placeholder="Post description"
        onChange={(e) => setDescriptionsValue(e.target.value)}
      />
      {error ? <div className='edit__error'>{error}</div> : null}
      <div className='edit__submit'>
        <button type="button" onClick={handleSave}>Update</button>
      </div>
    </div>
  )
}
