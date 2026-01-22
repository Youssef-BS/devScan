"use client" ; 

import { toast } from 'sonner';

const SonnerAlert = ({type , message} : {type: string, message: string}) => {
  return (
    <div>
      {type === "success" && toast.success(message)}
      {type === "error" && toast.error(message)}
    </div>
  )
}

export default SonnerAlert
