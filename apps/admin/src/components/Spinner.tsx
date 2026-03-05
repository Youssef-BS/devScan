"use client";
import { Spinner } from "./ui/spinner";

const SpinnerLoad = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-white">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

export default SpinnerLoad
