"use client"

import React, { useEffect } from "react"
import { useRepoStore } from "@/store/useRepoStore"
import RepoCard from "@/components/cards/RepoCard"
import SpinnerLoad from "@/components/Spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from "@/components/ui/button"

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
  }, [getFromDb])

  return (
    <React.Fragment>
      <div className="justify-between m-16 flex items-center">
        <h1 className="font-bold text-2xl">My Projects to check</h1>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={dataFromDb.length === 0}
              className="bg-red-800 hover:bg-red-700 text-white font-bold cursor-pointer"
            >
              Clear List
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all
                repositories from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAllRepos} className="bg-red-800 hover:bg-red-800 cursor-pointer">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {loading ? (
        <SpinnerLoad />
      ) : dataFromDb.length > 0 ? (
        <section className="flex flex-wrap gap-5 m-16 justify-items-start">
          {dataFromDb.map((repo, index) => (
            <RepoCard
              key={index}
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
    </React.Fragment>
  )
}

export default Page
