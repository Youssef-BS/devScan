"use client"

import React from 'react'

import { useRepoStore } from '@/store/useRepoStore'

const page = () => {

  const {deleteAllRepos} = useRepoStore()

  return (
    <React.Fragment>
      <div className='justify-between m-16 flex items-center'>
        <h1 className='font-bold text-2xl'>My Projects to check</h1>
        <button onClick={()=>deleteAllRepos()}
         className='bg-linear-to-br from-blue-600 to-purple-600 px-4 py-2 text-white p-1 rounded-lg cursor-pointer font-bold'>Clear List</button>
      </div>
    </React.Fragment>
  )
}

export default page
