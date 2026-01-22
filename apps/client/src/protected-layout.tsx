"use client"

import { ReactNode , useEffect} from "react";
import { useAuthContext } from "./auth-context";
import { useRouter } from "next/navigation";
import SpinnerLoad from "./components/Spinner";

export default function ProtectedLayout({
    children ,
} : {
   children :  ReactNode
}){
    const {user , loading} = useAuthContext()
    const router = useRouter()

    useEffect(()=> {
        if(!user && !loading)
            router.push("/") ;
    }, [loading , user , router])

    if(loading) return <SpinnerLoad />
    return children;
}