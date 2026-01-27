"use client" ; 
import { Spinner } from "./ui/spinner";

const SpinnerLoad = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white"><Spinner className="w-8 h-8"/></div>
  )
}

export default SpinnerLoad