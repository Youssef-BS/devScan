"use client"

import React, { useEffect, useMemo } from "react"
import { useRepoStore } from "@/store/useRepoStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SpinnerLoad from "@/components/Spinner"

const Page = () => {
  const dataFromDb = useRepoStore(state => state.dataFromDb)
  const loading = useRepoStore(state => state.loading)
  const getFromDb = useRepoStore(state => state.getFromDb)

  useEffect(() => {
    if (dataFromDb.length === 0) {
      getFromDb()
    }
  }, [dataFromDb.length, getFromDb])


  const totalRepos = dataFromDb.length

  const privateRepos = useMemo(
    () => dataFromDb.filter(repo => repo.private).length,
    [dataFromDb]
  )

  const publicRepos = totalRepos - privateRepos

  const autoAuditEnabled = useMemo(
    () => dataFromDb.filter(repo => repo.auto_audit).length,
    [dataFromDb]
  )

  const languages = useMemo(() => {
    const map: Record<string, number> = {}

    dataFromDb.forEach(repo => {
      const lang = repo.language || "Unknown"
      map[lang] = (map[lang] || 0) + 1
    })

    return map
  }, [dataFromDb])



  if (loading) return <SpinnerLoad />

  return (
    <div className="p-16 space-y-12">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>


      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Repositories</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {totalRepos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Repositories</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {publicRepos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Private Repositories</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {privateRepos}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Audit Enabled</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {autoAuditEnabled}
          </CardContent>
        </Card>
      </div>


      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Language Distribution</h2>

        {Object.keys(languages).length === 0 ? (
          <p className="text-gray-500">No repository data available.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(languages).map(([lang, count]) => (
              <div
                key={lang}
                className="flex justify-between bg-muted p-4 rounded-lg"
              >
                <span>{lang}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
