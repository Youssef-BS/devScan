"use client"

import React, { useEffect } from "react"
import { useRepoStore } from "@/store/useRepoStore"
import RepoCard from "@/components/cards/RepoCard"
import SpinnerLoad from "@/components/Spinner"

const Page = () => {
  const {
    deleteAllRepos,
    getFromDb,
    toggleAutoAudit,
    saveRepo,
    loading,
    dataFromDb
  } = useRepoStore()

  useEffect(() => {
    getFromDb()
  }, [])

  return (
    <>
      <div className="justify-between m-16 flex items-center">
        <h1 className="font-bold text-2xl">My Projects to check</h1>
        <button
          onClick={deleteAllRepos}
          className={`
            bg-linear-to-br from-blue-600 to-purple-600 px-4 py-2 text-white rounded-lg  font-bold
            ${dataFromDb.length === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
          Clear List
        </button>
      </div>

      {loading ? (
        <SpinnerLoad />
      ) : dataFromDb.length > 0 ? (
        <section className="flex flex-wrap gap-5 m-16 justify-items-start">
          {dataFromDb.map((repo) => (
            <RepoCard
              key={repo.full_name}
              repo={repo}
              toggleAutoAudit={toggleAutoAudit}
              addToCheck={() => saveRepo(repo)}
            />
          ))}
        </section>
      ) : (
        <h1 className="text-center font-bold text-3xl text-gray-500">
          No repo found !
        </h1>
      )}
    </>
  )
}

export default Page
