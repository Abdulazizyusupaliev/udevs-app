import { Box, Button, Container, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import avaPic8 from '../images/avatars/user__logo.png'
import { useState, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import loadingPic from '../images/loading.png'
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
import { API_BASE_URL, apiUrl } from '../config/api'

const USER = gql`
    query GetUsers($documentId: ID!){
        admin(documentId: $documentId){
            documentId,
            name,
            avatar,
            dateOfBirth,
            placeOfBirth,
            career
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
        admins{
            name,
            following,
            avatar,
            documentId,
            savedPosts
        }
    }
`


export default function UserDetails() {
    const { id } = useParams()
    const [pics, setPics] = useState([avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7, avaPic8])
    const { loading, error, data, refetch } = useQuery(USER, {
        variables: { documentId: id }
    })
    const [currentUser, setCurrentUser] = useState(data ? data.admin : { avatar: 7 })
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const stored = getItem('isLoggedIn');
        return stored || false; // or use [] for empty array
    })

    // const [posts, setPosts] = useState(data ? data.admin : null)
    const [message, setMessage] = useState(null)
    const [isFollowed, setIsFollowed] = useState(null)
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
        setCurrentUser(data ? data.admin : { avatar: 7 })
        setUserPosts(sortPosts(data?.admin?.posts || []))
        console.log(currentUser);

        if (userFollowing.current.includes(id)) {
            // console.log('followed');
            setIsFollowed(true)
        } else {
            // console.log('unfollowed');
            setIsFollowed(false)
            // console.log(userFollowing.current);
        }

    }, [dep, loading])



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
        // console.log('unfollowed successfully');
        const res = await refetch()
        following(res.data)
        // console.log(res.data.admins[counter.current[0]].following);
        setMessage('Вы отписались')
        handleClick()
        setDep(!dep)
    }

    const handleFollow = async (id) => {
        if (getItem('isLoggedIn')) {

            try {
                // following()    
                if (userFollowing.current.includes(id)) {
                    setMessage('Already following')
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
            // console.log(res.data);
            following(res.data)
            setMessage('Вы подписались')
            handleClick()
            setDep(!dep)
        } else {
            // console.log('danger');
            setMessage('Зарегестрируйтесь.')
            handleClick()
        }
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
            following(res.data)
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

    const scrollToTheTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

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
    // console.log(currentUser);


    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}><CircularProgress enableTrackSlot size="3rem" /></div>
    // if (loading) return <CircularProgress color="inherit" />
    if (error) {
        console.log(error);
        return <p>Error</p>
    }

    if (data.admin.documentId !== id) return <Notfound />

    return (
        <Container>
            <Box className="user__details">
                <Box sx={{ display: 'flex' }} className="user__details-content">
                    <img src={pics[currentUser?.avatar]} alt="userImage" />
                    <div className="info">
                        <div className="name__and__btn">
                            <Typography variant='h3'>{currentUser?.name?.length > 23 ? currentUser.name.substring(0, 23) + '...' : currentUser.name}</Typography>
                            {currentUser.documentId === isLoggedIn?.[0]?.documentId ? <button onClick={() => {
                                handleOpenBackdrop()
                                setEditProfile(true)
                            }} className='edit__btn'>edit</button> : (!isFollowed ? <button onClick={() => {
                                handleFollow(currentUser.documentId)
                                // handleClick()
                            }} className="follow__btn">Follow</button> : <button onClick={() => handleUnfollow(currentUser.documentId)} className="unfollow__btn">Unfollow</button>)}
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
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "50vh" }}>
                                <CircularProgress enableTrackSlot size="3rem" />
                            </div>
                        ) : userPosts.length === 0 ? (
                            <p className="posts__empty">Пока публикации нет.</p>
                        ) : userPosts?.map((e) => {
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
