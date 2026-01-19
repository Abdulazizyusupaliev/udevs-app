import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Typography, Grid } from '@mui/material'
import fallbackPostImage from '../images/post_fallback.svg'
import { API_BASE_URL } from '../config/api'
import loadingPic from '../images/loading.png'
import '../scss/pages/blogs.scss'
// import useFetch from '../hooks/useFetch'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress';
import { deleteItem, getItem } from '../hooks/useLocalStorage'

const POSTS = gql`
  query GetPosts{
    posts(sort: "createdAt:desc", pagination: { page: 1, pageSize: 100 }){
      documentId,
      title,
      descriptions,
      time,
      date
      image{
        url
      }
    }
  }
`

export default function Blogs() {

  const {loading, error, data, refetch} = useQuery(POSTS, { fetchPolicy: 'network-only', pollInterval: 15000 })
  const baseUrl = API_BASE_URL
  const getPostImageUrl = (image) => {
    const imageValue = Array.isArray(image) ? image[0] : image
    const url = imageValue?.url || imageValue?.data?.attributes?.url || imageValue?.data?.url
    if (!url) return fallbackPostImage
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
    if (url.startsWith('/uploads')) return `${baseUrl}${url}`
    return `${baseUrl}${url}`
  }

  const [index, SetIndex] = useState(0)
  const pageSize = 6
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
  const sortedPosts = useMemo(() => {
    return [...(data?.posts || [])].sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))
  }, [data?.posts])
  const visiblePosts = sortedPosts.slice(index, index + pageSize)
  const canGoBack = index > 0
  const canGoForward = sortedPosts.length > index + pageSize

  const scrollToTheTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  useEffect(() => {
    if (getItem('postsRefresh')) {
      deleteItem('postsRefresh')
      refetch && refetch()
    }
  }, [refetch])

  useEffect(() => {
    SetIndex(0)
  }, [sortedPosts.length])


  useEffect(() => {
    SetIndex(0)
  }, [data?.posts?.length])

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}><CircularProgress enableTrackSlot size="3rem" /></div>
  if (error) return <p>Error</p>

  // console.log(data);
  return (
    <Box className="blogs__body">
      <Container>
        <Grid container className="blogs">
          {visiblePosts.map(e => (
            <Grid item xs={12} sm={6} md={4} key={e.documentId}>
              <Link onClick={() => scrollToTheTop()} to={`/details/${e.documentId}`} className="blog">
                <img src={getPostImageUrl(e.image)} alt={e.title || 'Post image'} className='blog__pic' />
                <Typography className='date'>{e.date + ' ' + e.time}</Typography>
                <Typography variant='h4' className='description'>{e.title.length < 60 ? e.title : e.title.substring(0, 30) + '...'}</Typography>
              </Link>
            </Grid>
          ))}
        </Grid>
        <div className="blogs__pagination">
          <button type="button" onClick={() => SetIndex(index - pageSize)} disabled={!canGoBack}>
            Prev
          </button>
          <button type="button" onClick={() => SetIndex(index + pageSize)} disabled={!canGoForward}>
            Next
          </button>
        </div>
      </Container>
    </Box>
  )
}
