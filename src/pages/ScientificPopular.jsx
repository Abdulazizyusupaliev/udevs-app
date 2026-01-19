import React, { useMemo } from 'react'
import { Box, Container } from '@mui/material'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import CircularProgress from '@mui/material/CircularProgress'
import fallbackPostImage from '../images/post_fallback.svg'
import { Link } from 'react-router-dom'
import '../scss/pages/scientificpopular.scss'
import { API_BASE_URL } from '../config/api'

const POSTS = gql`
  query GetPosts{
    posts{
      documentId,
      title,
      descriptions,
      time,
      date,
      image{
        url
      }
    }
  }
`

export default function ScientificPopular() {
  const { loading, error, data } = useQuery(POSTS)
  const baseUrl = API_BASE_URL
  const getPostImageUrl = (image) => {
    const imageValue = Array.isArray(image) ? image[0] : image
    const url = imageValue?.url || imageValue?.data?.attributes?.url || imageValue?.data?.url
    if (!url) return fallbackPostImage
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads')) return `${baseUrl}${url}`
    return `${baseUrl}${url}`
  }

  const getPostTimestamp = (post) => {
    const dateValue = post?.date
    if (!dateValue) return 0
    const timeValue = post?.time && /^\d{2}:\d{2}/.test(post.time) ? post.time : '00:00'
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return new Date(`${dateValue}T${timeValue}:00`).getTime()
    }
    if (/^\d{2}\.\d{2}\.\d{2,4}$/.test(dateValue)) {
      const [day, month, yearRaw] = dateValue.split('.')
      const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw
      return new Date(`${year}-${month}-${day}T${timeValue}:00`).getTime()
    }
    const parsed = new Date(dateValue).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const recentPosts = useMemo(() => {
    const now = Date.now()
    const cutoff = now - 24 * 60 * 60 * 1000
    return (data?.posts || [])
      .filter((post) => getPostTimestamp(post) >= cutoff)
      .sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
  }, [data?.posts])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}>
        <CircularProgress enableTrackSlot size="3rem" />
      </div>
    )
  }
  if (error) return <p>Error</p>

  return (
    <Box className="scientific">
      <Container>
        <h2 className="scientific__title">Посты в последние 24 часа</h2>
        <div className="posts__intro">
          {recentPosts.length === 0 ? (
            <p className="posts__empty">Пусто{'('}</p>
          ) : recentPosts.map((e) => (
            <div className="posts__content" key={e.documentId}>
              <img src={getPostImageUrl(e.image)} alt={e.title || 'Post image'} className="left" />
              <div className="right">
                <h3 className="posts__title">{e.title}</h3>
                <p className="posts__date-and-time">{e.time + ' ' + e.date}</p>
                <p className="posts__descriptions">{e.descriptions.length > 280 ? e.descriptions.substring(0, 280) + '...' : e.descriptions}</p>
                <div className="right__btns">
                  <Link to={`/details/${e.documentId}`} className='read'>Читать</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Box>
  )
}
