"use client"

import { ReactNode , useEffect} from "react";
import { useAuthContext } from "./auth-context";
import { useRouter } from "next/navigation";
import { Spinner } from "./components/ui/spinner";


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

    if(loading) return <div className="w-full h-[100vh] items-center justify-center flex"><Spinner className="w-8 h-8"/></div>

    return children;

}