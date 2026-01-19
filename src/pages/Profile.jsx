import { Box, Button, Container, Typography } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import avaPic8 from '../images/avatars/user__logo.png'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import Notfound from './NotFound'
import { getItem } from '../hooks/useLocalStorage'
import '../scss/pages/userdetails.scss'
import axios from 'axios'
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import Edit from '../overlays/Edit'
import fallbackPostImage from '../images/post_fallback.svg'
import { Link } from 'react-router-dom'
import EditPosts from '../overlays/EditPosts'
import AddPosts from '../overlays/AddPosts'
import Register from './Register'
import { API_BASE_URL, apiUrl } from '../config/api'

const USER = gql`
    query GetUsers{
        admins{
            name,
            following,
            avatar,
            documentId,
            savedPosts,
            dateOfBirth,
            placeOfBirth,
            career,
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
    }
`

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


export default function Profile() {


    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const stored = getItem('isLoggedIn');
        return stored || false; // or use [] for empty array
    });
    const id = isLoggedIn?.[0]?.documentId
    const [pics, setPics] = useState([avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7, avaPic8])
    const { loading, error, data, refetch } = useQuery(USER)
    const [currentUser, setCurrentUser] = useState(() => {
        if (!data || !id) return { avatar: 7 }
        return data.admins.find((e) => e.documentId === id) || { avatar: 7 }
    })

    // const [posts, setPosts] = useState(data ? data.admin : null)
    const [message, setMessage] = useState(null)
    const counter = useRef(0)
    const userFollowing = useRef([])
    const [dep, setDep] = useState(true)
    const [editProfile, setEditProfile] = useState(false)
    const [editPosts, setEditPosts] = useState(false)
    const [activePost, setActivePost] = useState(null)
    const [addPost, setAddPost] = useState(false)
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
    const formatBirthDate = (value) => {
        if (!value) return '-'
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
        if (match) {
            const [, year, month, day] = match
            return `${day}.${month}.${year.slice(2)}`
        }
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = String(date.getFullYear()).slice(2)
        return `${day}.${month}.${year}`
    }

    const updateFollowing = useCallback((d = data) => {

        for (let i = 0; i < d?.admins?.length; i++) {
            if (d.admins[i]?.name === isLoggedIn?.[0]?.name) {
                counter.current = [i, d.admins[i].documentId]
                userFollowing.current = d.admins[i].following || []
                return userFollowing.current

            }
        }
        return userFollowing.current
    }, [data, isLoggedIn])
    useEffect(() => {
        updateFollowing(data)
        setCurrentUser(data?.admins?.find((e) => e.documentId === id) || { avatar: 7 })
        setUserPosts(sortPosts(data?.admins?.find((e) => e.documentId === id)?.posts || []))
        // console.log(currentUser);

    }, [data, dep, id, loading, updateFollowing])


    const scrollToTheTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }

    const update = async (message, postOverride, options = {}) => {
        if (message === 'post' && postOverride) {
            const matchId = options.matchId || postOverride.documentId
            if (options.mode === 'add') {
                setUserPosts((prev) => sortPosts([...prev, postOverride]))
            } else if (options.mode === 'replace') {
                setUserPosts((prev) =>
                    sortPosts(
                        prev.map((post) =>
                            post.documentId === matchId ? { ...post, ...postOverride } : post
                        )
                    )
                )
            } else if (options.mode === 'remove') {
                setUserPosts((prev) => prev.filter((post) => post.documentId !== matchId))
            }
            if (!options.silent) {
                setMessage(options.mode === 'add' ? 'Post added' : 'Post updated')
                handleClick()
            }
            setOpenBackdrop(false);
            setEditProfile(false)
            setEditPosts(false)
            setAddPost(false)
            setActivePost(null)
            const body = document.querySelector('body')
            body.classList.remove('overflow__hidden')
            return
        }
        if (message === 'update' || message === 'post') {
            const res = await refetch()
            // console.log(res.data);
            updateFollowing(res.data)
            setUserPosts(sortPosts(res?.data?.admin?.posts || []))
            setMessage(message === 'post' ? 'Post updated' : 'Updated')
            handleClick()
            setOpenBackdrop(false);
            setEditProfile(false)
            setEditPosts(false)
            setAddPost(false)
            setActivePost(null)
            const body = document.querySelector('body')
            body.classList.remove('overflow__hidden')
            setDep(!dep)
            return res
        }
    }

    const deletePost = async (id) => {
        if (!id) return
        try {
            await axios.delete(apiUrl(`/api/posts/${id}`))
            setUserPosts((prev) => prev.filter((post) => post.documentId !== id))
            setMessage('Post deleted')
            handleClick()
        } catch (error) {
            console.log(error)
            setMessage('Could not delete the post.')
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

    // BACKDROP START

    const [openBackdrop, setOpenBackdrop] = React.useState(false);
    const handleCloseBackdrop = () => {
        setOpenBackdrop(false);
        const body = document.querySelector('body')
        body.classList.remove('overflow__hidden')
    };
    const handleOpenBackdrop = () => {
        setOpenBackdrop(true);
        const body = document.querySelector('body')
        body.classList.add('overflow__hidden')
    };

    // BACKDROP END


    // console.log(currentUser[0], loading, data?.admin);


    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}><CircularProgress enableTrackSlot size="3rem" /></div>
    // if (loading) return <CircularProgress color="inherit" />
    if (error) {
        console.log(error);
        return <p>Error</p>
    }

    if (!data && !data.admins.documentId.includes(id)) return <Notfound />

    if (isLoggedIn === false) return <Register/>

    return (
        <Container>
            <Box className="user__details">
                <Box sx={{ display: 'flex' }} className="user__details-content">
                    <img style={{borderRadius: '50%'}} src={pics[currentUser?.avatar]} alt="userImage" />
                    <div className="info">
                        <div className="name__and__btn">
                            <Typography variant='h3'>{currentUser?.name?.length > 23 ? currentUser.name.substring(0, 23) + '...' : currentUser.name}</Typography>
                            <button onClick={() => {
                                handleOpenBackdrop()
                                setEditProfile(true)
                            }} className='edit__btn'>edit</button>
                            <Backdrop
                                sx={(theme) => ({ color: '#fff', zIndex: 5 })}
                                open={openBackdrop}
                                onClick={() => {
                                    handleCloseBackdrop()
                                    setEditProfile(false)
                                    setEditPosts(false)
                                    setAddPost(false)
                                    setActivePost(null)
                                }}
                            >
                            </Backdrop>
                            <Box style={{ display: editProfile ? 'flex' : 'none', zIndex: 10 }} className='edit__overlay'>
                                <Edit
                                    name={currentUser?.name}
                                    career={currentUser?.career}
                                    initialDate={currentUser?.dateOfBirth?.slice(0, 10)}
                                    place={currentUser?.placeOfBirth}
                                    documentId={currentUser?.documentId}
                                    updateFunction={update}
                                />
                            </Box>
                            <Box style={{ display: editPosts ? 'flex' : 'none', zIndex: 10 }} className='edit__overlay'>
                                <EditPosts
                                    title={activePost?.title}
                                    descriptions={activePost?.descriptions}
                                    documentId={activePost?.documentId}
                                    updateFunction={update}
                                />
                            </Box>
                            <Box style={{ display: addPost ? 'flex' : 'none', zIndex: 10 }} className='edit__overlay'>
                                <AddPosts
                                    adminId={isLoggedIn?.[0]?.documentId}
                                    updateFunction={update}
                                />
                            </Box>
                            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={open} autoHideDuration={2000} onClose={handleClose}>
                                <Alert
                                    onClose={handleClose}
                                    severity={getItem('isLoggedIn') ? "success" : 'error'}
                                    variant="filled"
                                    sx={{ width: '100%' }}
                                >{message}</Alert>
                            </Snackbar>
                        </div>
                        <Box className='box'>
                            <div className="row row__1">
                                <p>Карьера</p>
                                <p>{currentUser?.career || '-'}</p>


                            </div>
                            <div className="row row__2">
                                <p>Дата рождения</p>
                                <p>{formatBirthDate(currentUser?.dateOfBirth)}</p>

                            </div>
                            <div className="row row__3">
                                <p>Место рождения</p>
                                <p>{currentUser?.placeOfBirth || '-'}</p>
                            </div>
                        </Box>
                    </div>
                </Box>
                <Box className='posts'>
                    <p className="title">ПУБЛИКАЦИИ</p>
                    {currentUser.documentId === isLoggedIn?.[0]?.documentId ? <Button onClick={() => {
                        handleOpenBackdrop()
                        setAddPost(true)
                    }} className='add__post'>Добавить Пост</Button> : null}
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
                                            {currentUser.documentId === isLoggedIn?.[0]?.documentId ? <Button onClick={() => {
                                                handleOpenBackdrop()
                                                setEditPosts(true)
                                                setActivePost(e)
                                            }} className='edit__btn'>Изменить</Button> : null}
                                            {currentUser.documentId === isLoggedIn?.[0]?.documentId ? <Button onClick={() => deletePost(e.documentId)} className='delete'>Удалить</Button> : null}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Box>
            </Box>
        </Container>
    )
}



