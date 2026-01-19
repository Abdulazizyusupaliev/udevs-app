// import { Box, Button, Container, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import '../scss/pages/saved.scss'
import { useState, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Notfound from './NotFound'
import { getItem } from '../hooks/useLocalStorage'
import CircularProgress from '@mui/material/CircularProgress';
import fallbackPostImage from '../images/post_fallback.svg'
import { Link } from 'react-router-dom'
import { Container } from '@mui/material'
import Register from './Register'
import { API_BASE_URL } from '../config/api'

const USER = gql`
  query GetUsers{
        admins{
            name,
            following,
            avatar,
            documentId,
            dateOfBirth,
            placeOfBirth,
            career,
            savedPosts,
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

export default function Saved() {

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = getItem('isLoggedIn');
    return stored || false; // or use [] for empty array
  });
  const id = isLoggedIn?.[0]?.documentId
  // const [pics, setPics] = useState([avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7, avaPic8])
  const { loading, error, data, refetch } = useQuery(USER, { fetchPolicy: 'network-only' })
  const [currentUser, setCurrentUser] = useState(() => {
    if (!data || !id) return { avatar: 7 }
    return data.admins.find((e) => e.documentId === id) || { avatar: 7 }
  })

  // const [posts, setPosts] = useState(data ? data.admin : null)
  const counter = useRef(0)
  const userFollowing = useRef([])
  const [dep, setDep] = useState(true)
  const [userPosts, setUserPosts] = useState([])
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
  const sortPosts = (posts = []) => [...posts].sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a))

  const following = (d = data) => {

    for (let i = 0; i < d?.admins?.length; i++) {
      if (d.admins[i]?.name === isLoggedIn?.[0]?.name) {
        counter.current = [i, d.admins[i].documentId]
        return userFollowing.current = d.admins[i].following || []

      }
    }
    // console.log('worked');
    // console.log(data);
  }
  useEffect(() => {
    following(data)
    const matchedUser = data?.admins?.find((e) => e.documentId === id) || { avatar: 7 }
    setCurrentUser(matchedUser)
    const savedIds = new Set(matchedUser?.savedPosts || [])
    const savedPosts = data?.posts?.filter((post) => savedIds.has(post.documentId)) || []
    setUserPosts(sortPosts(savedPosts))
    // console.log(currentUser);

  }, [dep, loading])


  const scrollToTheTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  console.log(userPosts);


  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}><CircularProgress enableTrackSlot size="3rem" /></div>
  // if (loading) return <CircularProgress color="inherit" />
  if (error) {
    console.log(error);
    return <p>Error</p>
  }

  if (isLoggedIn == false) return <Register/>
  if (!loading && userPosts.length === 0) {
    return (
      <Container>
        <div className="saved__empty">
          <div className="saved__empty-card">
            <span className="saved__empty-tag">Избранные</span>
            <h2>Пока избранных постов нет {'('}.</h2>
            <p>Добавьте постов что бы продолжать читать.</p>
            <Link to="/home" className="saved__empty-action">Посты</Link>
          </div>
          <div className="saved__empty-art" aria-hidden="true">
            <div className="saved__empty-ring" />
            <div className="saved__empty-dot" />
          </div>
        </div>
      </Container>
    )
  }


  return (

    <Container>
      <div className='saved'>
        <div className="posts__intro">
          {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "50vh" }}><CircularProgress enableTrackSlot size="3rem" /></div> : userPosts?.map((e) => {
            return (
              <div className="posts__content" key={e.documentId}>
                <img src={getPostImageUrl(e.image)} alt={e.title || 'Post image'} className="left" />
                <div className="right">
                  <h3 className="posts__title">{e.title}</h3>
                  <p className="posts__date-and-time">{e.time + ' ' + e.date}</p>
                  <p className="posts__descriptions">{e.descriptions.length > 280 ? e.descriptions.substring(0, 280) + '...' : e.descriptions}</p>
                  <div className="right__btns">
                    <Link onClick={scrollToTheTop} to={`/details/${e.documentId}`} className='read'>Читать</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Container>

  )
}

