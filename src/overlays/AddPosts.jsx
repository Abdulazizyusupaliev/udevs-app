import React, { useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import '../scss/overlays/addposts.scss'
import { setItem } from '../hooks/useLocalStorage'

export default function AddPosts({ adminId, updateFunction }) {
  const [titleValue, setTitleValue] = useState('')
  const [descriptionsValue, setDescriptionsValue] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const nextTitle = titleValue.trim()
    const nextDescriptions = descriptionsValue.trim()

    if (!adminId) {
      setError('User not found.')
      return
    }

    if (!nextTitle || !nextDescriptions) {
      setError('Please fill in all fields.')
      return
    }

    if (!imageFile) {
      setError('Please upload an image.')
      return
    }

    if (!imageFile.type || !imageFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return
    }

    const now = new Date()
    const time = now.toTimeString().slice(0, 5)
    const date = now.toISOString().slice(0, 10)

    try {
      setError('')
      const formData = new FormData()
      formData.append('files', imageFile, imageFile.name)
      const uploadRes = await axios.post(apiUrl('/api/upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const uploadedId = uploadRes?.data?.[0]?.id
      if (!uploadedId) {
        setError('Could not upload the image.')
        return
      }

      const postRes = await axios.post(apiUrl('/api/posts'), {
        data: {
          title: nextTitle,
          descriptions: nextDescriptions,
          time,
          date,
          admin: adminId,
          image: uploadedId,
          publishedAt: new Date().toISOString()
        }
      })
      const postId = postRes?.data?.data?.id
      if (!postId) {
        setError('Could not create the post.')
        return
      }

      setTitleValue('')
      setDescriptionsValue('')
      setImageFile(null)
      setItem('postsRefresh', true)
      updateFunction('post')
    } catch (err) {
      console.log(err)
      const apiError = err?.response?.data?.error
      const details = apiError?.details?.errors?.[0]?.message
      const message = apiError?.message || details
      setError(message || 'Could not add the post.')
    }
  }

  return (
    <div className='add-posts'>
      <input
        value={titleValue}
        type="text"
        placeholder="Post title"
        onChange={(e) => setTitleValue(e.target.value)}
      />
      <textarea
        value={descriptionsValue}
        placeholder="Post description"
        onChange={(e) => setDescriptionsValue(e.target.value)}
      />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
      />
      {error ? <div className='add-posts__error'>{error}</div> : null}
      <div className='add-posts__submit'>
        <button type="button" onClick={handleSave}>Add post</button>
      </div>
    </div>
  )
}
