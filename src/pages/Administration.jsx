import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import Backdrop from '@mui/material/Backdrop'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import Edit from '../overlays/Edit'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import avaPic8 from '../images/avatars/user__logo.png'
import '../scss/pages/administration.scss'
import { getItem } from '../hooks/useLocalStorage'
import Register from '../pages/Register'
import { apiUrl } from '../config/api'

const ADMINS = gql`
  query GetAdmins{
    admins{
      documentId,
      name,
      avatar,
      career,
      placeOfBirth,
      dateOfBirth
    }
  }
`

export default function Administration() {
  const { loading, error, data, refetch } = useQuery(ADMINS)
  const [adminsList, setAdminsList] = useState([])
  const [activeAdmin, setActiveAdmin] = useState(null)
  const [editAdmin, setEditAdmin] = useState(false)
  const [openBackdrop, setOpenBackdrop] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 8
  const pics = [avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7, avaPic8]
  const currentUserId = getItem('isLoggedIn')?.[0]?.documentId

  useEffect(() => {
    setAdminsList(data?.admins || [])
  }, [data?.admins])

  useEffect(() => {
    setPage(0)
  }, [query])

    const filteredAdmins = useMemo(() => {
        const normalized = query.trim().toLowerCase()
        const base = adminsList || []
        const filtered = normalized
          ? base.filter((admin) =>
              admin?.name?.toLowerCase().includes(normalized) ||
              admin?.career?.toLowerCase().includes(normalized)
            )
          : base
    return [...filtered].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
    }, [adminsList, query])

  const pagedAdmins = useMemo(() => {
    const start = page * pageSize
    return filteredAdmins.slice(start, start + pageSize)
  }, [filteredAdmins, page])

  const canGoBack = page > 0
  const canGoForward = filteredAdmins.length > (page + 1) * pageSize

  const formatBirthDate = (value) => {
    if (!value) return '-'
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      const [, year, month, day] = match
      return `${day}.${month}.${year}`
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear())
    return `${day}.${month}.${year}`
  }

  const handleOpenBackdrop = () => {
    setOpenBackdrop(true)
    const body = document.querySelector('body')
    body.classList.add('overflow__hidden')
  }

  const handleCloseBackdrop = () => {
    setOpenBackdrop(false)
    setEditAdmin(false)
    setActiveAdmin(null)
    const body = document.querySelector('body')
    body.classList.remove('overflow__hidden')
  }

  const handleDeleteAdmin = async (documentId) => {
    if (!documentId) return
    if (!window.confirm('Delete this user?')) return
    try {
      await axios.delete(apiUrl(`/api/admins/${documentId}`))
      setAdminsList((prev) => prev.filter((admin) => admin.documentId !== documentId))
      setMessage('User deleted')
      setOpen(true)
    } catch (err) {
      console.log(err)
      setMessage('Could not delete the user.')
      setOpen(true)
    }
  }

  const update = async (action) => {
    if (action !== 'update') return
    const res = await refetch()
    setAdminsList(res?.data?.admins || [])
    setMessage('User updated')
    setOpen(true)
    handleCloseBackdrop()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}>
        <CircularProgress enableTrackSlot size="3rem" />
      </div>
    )
  }
  if (error) return <p>Error</p>
  if(!getItem('isLoggedIn')) return <Register/>
  return (
    <Box className="administration">
      <Container>
        <div className="administration__header">
          <div>
            <span className="administration__eyebrow">Админ панель</span>
            <h1>Users</h1>
          </div>
          <div className="administration__stats">
            <span>{filteredAdmins.length} кол. ползователей</span>
          </div>
        </div>

        <div className="administration__controls">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or career"
            type="search"
          />
          <div className="administration__pager">
            <button type="button" onClick={() => setPage(page - 1)} disabled={!canGoBack}>Prev</button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={!canGoForward}>Next</button>
          </div>
        </div>

        <div className="administration__grid">
          {pagedAdmins.map((admin) => (
            <article className="administration__card" key={admin.documentId}>
              <div className="administration__avatar">
                <img src={pics[admin?.avatar] || pics[7]} alt={admin?.name || 'User'} />
              </div>
              <div className="administration__info">
                <Typography variant="h5">{admin?.name || 'Unknown'}</Typography>
                <p>{admin?.career || 'No career set'}</p>
                <span>{formatBirthDate(admin?.dateOfBirth)}</span>
              </div>
              <div className="administration__actions">
                <Button onClick={() => {
                  setActiveAdmin(admin)
                  setEditAdmin(true)
                  handleOpenBackdrop()
                }} className="edit">Edit</Button>
                <Button
                  onClick={() => handleDeleteAdmin(admin.documentId)}
                  className="delete"
                  disabled={admin.documentId === currentUserId}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <Backdrop
        sx={() => ({ color: '#fff', zIndex: 5 })}
        open={openBackdrop}
        onClick={handleCloseBackdrop}
      />
      <Box style={{ display: editAdmin ? 'flex' : 'none', zIndex: 10 }} className='edit__overlay'>
        <Edit
          name={activeAdmin?.name}
          career={activeAdmin?.career}
          initialDate={activeAdmin?.dateOfBirth?.slice(0, 10)}
          place={activeAdmin?.placeOfBirth}
          documentId={activeAdmin?.documentId}
          updateFunction={update}
        />
      </Box>

      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={open} autoHideDuration={2000} onClose={() => setOpen(false)}>
        <Alert onClose={() => setOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
