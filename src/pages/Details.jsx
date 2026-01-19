import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Container, Typography } from '@mui/material'
import fallbackPostImage from '../images/post_fallback.svg'
import { API_BASE_URL, apiUrl } from '../config/api'
import '../scss/pages/details.scss'
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useParams } from 'react-router-dom'
// import useFetch from '../hooks/useFetch'
// import useFetchId from '../hooks/useFetchId'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Notfound from './NotFound'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import { getItem } from '../hooks/useLocalStorage'
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios'
import { Link } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress';

const POSTS = gql`
    query GetPost($documentId: ID!){
        post(documentId: $documentId){
            documentId,
            title,
            descriptions,
            time,
            date,
            image{
                url
            },
            admin{
                name,
                avatar,
                documentId,
                following
            }
        },
        admins{
            name,
            following,
            avatar,
            documentId,
            savedPosts
        }
        posts{
            documentId
        }
    }
`

export default function Details() {
    const { id } = useParams()

    const pics = [avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7]
    const baseUrl = API_BASE_URL
    const getPostImageUrl = (image) => {
        const imageValue = Array.isArray(image) ? image[0] : image
        const url = imageValue?.url || imageValue?.data?.attributes?.url || imageValue?.data?.url
        if (!url) return fallbackPostImage
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
        if (url.startsWith('/uploads')) return `${baseUrl}${url}`
        return `${baseUrl}${url}`
    }


    const [isLoggedIn] = useState(() => {
        const stored = getItem('isLoggedIn');
        return stored || false; // or use [] for empty array
    })



    const [dep, setDep] = useState(false)
    const [message, setMessage] = useState(null)
    const [isFollowed, setIsFollowed] = useState(false)
    const counter = useRef(0)
    const userFollowing = useRef([])
    const userSavedPosts = useRef([])
    const [isSaved, setIsSaved] = useState(false)
    const { loading, error, data, refetch } = useQuery(POSTS, {
        variables: { documentId: id }
    })


    // console.log(data);

    const updateFollowing = useCallback((d = data) => {

        for (let i = 0; i < d?.admins?.length; i++) {
            if (d.admins[i]?.documentId === isLoggedIn?.[0]?.documentId) {
                counter.current = [i, d.admins[i].documentId]
                userFollowing.current = d.admins[i].following || []
                return userFollowing.current

            }
        }
        return userFollowing.current
    }, [data, isLoggedIn])

    const updateSaved = useCallback((d = data) => {
        for (let i = 0; i < d?.admins?.length; i++) {
            if (d?.admins[i]?.documentId === isLoggedIn?.[0]?.documentId) {
                // counter.current = [i, d.admins[i].documentId]
                userSavedPosts.current = d.admins[i].savedPosts || []
                return userSavedPosts.current

            }
        }
        return userSavedPosts.current

    }, [data, isLoggedIn])

    // console.log(isLoggedIn) 
    useEffect(() => {
        updateFollowing()
        updateSaved()
        // console.log(userSavedPosts.current);
        if (userFollowing.current.includes(data?.post?.admin?.documentId)) {
            // console.log('followed');
            setIsFollowed(true)
        } else {
            // console.log('unfollowed');
            setIsFollowed(false)
        }
        if (userSavedPosts.current.includes(data?.post?.documentId)) {
            setIsSaved(true)
        } else {
            setIsSaved(false)
        }
        // console.log(isSaved + ' :');
        // console.log( userSavedPosts.current);
    }, [data, dep, updateFollowing, updateSaved])

    const handleSave = async (id) => {
        if (getItem('isLoggedIn')) {
            try {
                if (userSavedPosts.current.includes(id)) {
                    setMessage('вы уже сохранили')
                    handleClick()
                } else {
                    await axios.put(apiUrl(`/api/admins/${counter.current[1]}`), {
                        data: {
                            savedPosts: [...userSavedPosts.current, id]
                        }
                    })
                }
            } catch (error) { console.log(error) }
            const res = await refetch()
            updateSaved(res.data)
            setMessage('пост сохранен')
            handleClick()
            setDep(!dep)
        } else {
            // console.log('danger');
            setMessage('Вы должны зарегестрироваться')
            handleClick()
        }
    }

    const handleUnsave = async (id) => {
        console.log(id);
        try {
            let updatedSavedPosts = []
            for (let i = 0; i < userSavedPosts.current.length; i++) {
                if (userSavedPosts.current[i] !== id) {
                    updatedSavedPosts = [...updatedSavedPosts, userSavedPosts.current[i]]
                }
            }
            await axios.put(apiUrl(`/api/admins/${counter.current[1]}`), {
                data: {
                    savedPosts: updatedSavedPosts
                }
            })
        } catch (error) { console.log(error) }
        const res = await refetch()
        updateSaved(res.data)
        // console.log(res.data.admins[counter.current[0]].following);
        setMessage('пост удален из сохраненных')
        handleClick()
        setDep(!dep)
    }

    const handleUnfollow = async (id) => {
        try {
            // console.log(id);
            // console.log(userFollowing.current);
            let updatedUsersId = []
            for (let i = 0; i < userFollowing.current.length; i++) {
                if (userFollowing.current[i] !== id) {
                    updatedUsersId = [...updatedUsersId, userFollowing.current[i]]
                }
            }
            await axios.put(apiUrl(`/api/admins/${counter.current[1]}`), {
                data: {
                    following: updatedUsersId
                }
            })
        } catch (error) { console.log(error); }
        console.log('unfollowed successfully');
        const res = await refetch()
        updateFollowing(res.data)
        // console.log(res.data.admins[counter.current[0]].following);
        setMessage('вы отписались')
        handleClick()
        setDep(!dep)
    }

    const handleFollow = async (id) => {
        if (getItem('isLoggedIn')) {

            try {
                // following()
                if (userFollowing.current.includes(id)) {
                    setMessage('вы уже подписаны')
                    handleClick()
                } else {
                    await axios.put(apiUrl(`/api/admins/${counter.current[1]}`), {
                        data: {
                            following: [...userFollowing.current, id]
                        }
                    })
                }

            } catch (error) { console.log(error); }
            const res = await refetch()
            updateFollowing(res.data)
            // console.log(res.data.admins[counter.current[0]].following);
            setMessage('вы подписались')
            handleClick()
            setDep(!dep)
        } else {
            // console.log('danger');
            setMessage('Вы должны зарегестрироваться')
            handleClick()
        }
    }

    // MESSAGE START

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    // MESSAGE END

    const scrollToTheTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

    // console.log(isFollowed);


    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}><CircularProgress enableTrackSlot size="3rem" /></div>
    if (error) {
        console.log(error);
        return <p>Error</p>
    }

    if (!data?.post) return <Notfound />
    if (!data.post?.admin) {
        return (
            <Container>
                <Box className='details'>
                    <Box className="user">
                        <Typography variant='h3' className='user__name'>User not found</Typography>
                    </Box>
                    <Box className='details__content'>
                        <img src={getPostImageUrl(data?.post?.image)} alt={data?.post?.title || 'Post image'} />
                        <Typography className='date' variant='p'>{data?.post?.time + ' ' + data?.post?.date}</Typography>
                        <Typography className='title' variant='h1'>{data?.post?.title}</Typography>
                        <Typography className='text'>This post belongs to a deleted user.</Typography>
                    </Box>
                </Box>
            </Container>
        )
    }

    return (

        <Container>
            <Box className='details'>
                <Box className="user">
                    <Link onClick={scrollToTheTop} to={`/userdetails/${data.post.admin.documentId}`}><img src={pics[data.post.admin.avatar]} alt="UserImage" /></Link>
                    <Typography variant='h3' className='user__name'>{data.post.admin.name.length > 10 ? data.post.admin.name.substring(0,10) + '..' : data.post.admin.name}</Typography>
                    {data.post.admin.documentId === isLoggedIn?.[0]?.documentId ? null : <div className="btns">
                        {!isFollowed ? <button onClick={() => {
                            handleFollow(data.post.admin.documentId)
                            // handleClick()
                        }} className="follow__btn">Follow</button> : <button onClick={() => handleUnfollow(data.post.admin.documentId)} className="unfollow__btn">Unfollow</button>}
                        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={open} autoHideDuration={2000} onClose={handleClose}>
                            <Alert
                                onClose={handleClose}
                                severity={getItem('isLoggedIn') ? "success" : 'error'}
                                variant="filled"
                                sx={{ width: '100%' }}
                            >{message}</Alert>
                        </Snackbar>
                        {!isSaved ? <button className="save__btn" onClick={() => handleSave(data.post.documentId)}>{<BookmarkIcon />}</button> : <button className="unsave__btn" onClick={() => handleUnsave(data.post.documentId)}>{<BookmarkIcon />}</button>}
                    </div>}
                </Box>
                <Box className='details__content'>
                    <img src={getPostImageUrl(data?.post?.image)} alt={data?.post?.title || 'Post image'} />
                    <Typography className='date' variant='p'>{data.post.time + ' ' + data.post.date}</Typography>
                    <Typography className='title' variant='h1'>{data.post.title}</Typography>
                    <Typography className='text'>{data.post.descriptions}</Typography>
                </Box>
            </Box>
        </Container>
    )
}

