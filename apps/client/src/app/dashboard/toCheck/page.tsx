"use client"

import React , {useEffect} from 'react'

import { useRepoStore } from '@/store/useRepoStore'
import RepoCard from '@/components/cards/RepoCard'

const page = () => {

  const {deleteAllRepos , getFromDb , toggleAutoAudit , saveRepo} = useRepoStore()

  const dataFromDb = useRepoStore((state)=>state.dataFromDb)

  console.log(dataFromDb)

  useEffect(()=> {
    getFromDb()
  },[dataFromDb])




  return (
    <React.Fragment>
      <div className='justify-between m-16 flex items-center'>
        <h1 className='font-bold text-2xl'>My Projects to check</h1>
        <button onClick={()=>deleteAllRepos()}
         className='bg-linear-to-br from-blue-600 to-purple-600 px-4 py-2 text-white p-1 rounded-lg cursor-pointer font-bold'>Clear List</button>
      </div>
      
      <section className="flex flex-wrap gap-5 m-16 justify-items-start">
        
        {
        dataFromDb?.map((repo) => (
        <RepoCard
          key={repo.full_name}
          repo={repo}
          toggleAutoAudit={toggleAutoAudit}
          addToCheck={()=>saveRepo(repo)}
        />
      ))}

      </section>
    </React.Fragment>
  )
}

export default page
