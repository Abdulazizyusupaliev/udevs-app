import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Blogs from '../pages/Blogs'
import Saved from '../pages/Saved'
import Administration from '../pages/Administration'
import Design from '../pages/Design'
import Profile from '../pages/Profile'
import Users from '../pages/Users'
import ScientificPopular from '../pages/ScientificPopular'
import Details from '../pages/Details'
import NotFound from '../pages/NotFound'
import '../scss/components/main.scss'
import UserDetails from '../pages/UserDetails'


export default function Main() {
    return (
        <div className='main'>
            <Routes>
                <Route path='/' element={<Blogs />} />
                <Route path='/home' element={<Blogs />} />
                <Route path='/saved' element={<Saved/>} />
                <Route path='/administration' element={<Administration />} />
                <Route path='/design' element={<Design />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/users' element={<Users />} />
                <Route path='/scientificpopular' element={<ScientificPopular />} />
                <Route path='/details/:id' element={<Details />} />
                <Route path='/userdetails/:id' element={<UserDetails />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </div>
    )
}
