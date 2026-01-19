import React, { useMemo, useState } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import CircularProgress from '@mui/material/CircularProgress'
import avaPic1 from '../images/avatars/1.png'
import avaPic2 from '../images/avatars/two.png'
import avaPic3 from '../images/avatars/three.png'
import avaPic4 from '../images/avatars/four.png'
import avaPic5 from '../images/avatars/five.png'
import avaPic6 from '../images/avatars/six.png'
import avaPic7 from '../images/avatars/seven.png'
import avaPic8 from '../images/avatars/user__logo.png'
import { Link } from 'react-router-dom'
import '../scss/pages/users.scss'

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

export default function Users() {
  const { loading, error, data } = useQuery(ADMINS)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 12
  const pics = [avaPic1, avaPic2, avaPic3, avaPic4, avaPic5, avaPic6, avaPic7, avaPic8]

  const filteredAdmins = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const base = data?.admins || []
    const filtered = normalized
      ? base.filter((admin) =>
          admin?.name?.toLowerCase().includes(normalized) ||
          admin?.career?.toLowerCase().includes(normalized)
        )
      : base
    return [...filtered].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))
  }, [data?.admins, query])

  const pagedAdmins = useMemo(() => {
    const start = page * pageSize
    return filteredAdmins.slice(start, start + pageSize)
  }, [filteredAdmins, page])

  const canGoBack = page > 0
  const canGoForward = filteredAdmins.length > (page + 1) * pageSize

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: "70vh" }}>
        <CircularProgress enableTrackSlot size="3rem" />
      </div>
    )
  }
  if (error) return <p>Error</p>

  return (
    <Box className="users">
      <Container>
        <div className="users__header">
          <div>
            <span className="users__eyebrow">Directory</span>
            <h1>Все пользователи</h1>
          </div>
          <span className="users__count">{filteredAdmins.length} пользователя</span>
        </div>

        <div className="users__controls">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search by name or career"
            type="search"
          />
          <div className="users__pager">
            <button type="button" onClick={() => setPage(page - 1)} disabled={!canGoBack}>Prev</button>
            <button type="button" onClick={() => setPage(page + 1)} disabled={!canGoForward}>Next</button>
          </div>
        </div>

        <div className="users__grid">
          {pagedAdmins.map((admin) => (
            <Link key={admin.documentId} to={`/userdetails/${admin.documentId}`} className="users__card">
              <div className="users__avatar">
                <img src={pics[admin?.avatar] || pics[7]} alt={admin?.name || 'User'} />
              </div>
              <div className="users__info">
                <Typography variant="h5">{admin?.name || 'Unknown'}</Typography>
                <p>{admin?.career || 'No career set'}</p>
                <span>{admin?.placeOfBirth || 'Unknown location'}</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Box>
  )
}
