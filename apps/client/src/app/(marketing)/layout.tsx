"use client"

import  NavbarHomePage  from "@/components/HomeNavbar"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarHomePage />
      {children}
    </>
  )
}