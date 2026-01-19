export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || 'https://smiling-friend-077fdbe421.strapiapp.com'

export const apiUrl = (path = '') => {
    if (!path) return API_BASE_URL
    return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}
