import { UserProfile } from '@clerk/nextjs'
import React from 'react'

function ProfilePage() {
    return (
        <div className='p-10'>
            <h2 className='font-bold text-2xl'>Profile</h2>
            <UserProfile/>
        </div>
    )
}

export default ProfilePage