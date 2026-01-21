"use client"
import React from 'react'
import { Plus } from 'lucide-react'

const IntroDashboard = ({path , changePath} : {path:string , changePath : (path : string) => void}) => {

  return (
    <React.Fragment>
              <section className='m-12 items-center justify-between flex'>
      <div>     
      <h1 className='font-bold text-4xl'>Your Repositories</h1>
      <p className='pt-2.5 text-gray-500'>Monitor and audit your code automatically</p>
      </div>
      <div className='p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg cursor-pointer text-white'>
        <div className='item-center flex justify-around'>
          <Plus />
          <span className='pl-2 font-medium'>Add Repository</span>
        </div>
      </div>
     </section>

     {/* filter */}
<section className="mx-12">
  <div className="bg-gray-200 p-1 flex items-center rounded-2xl gap-1.5 w-fit">
    <button className={`cursor-pointer px-11 py-1 font-semibold rounded-xl  ${path === "repositories" ? "bg-white" : "hover:bg-gray-100" }`}  onClick={()=>changePath("repositories")}>
      Repositories
    </button>
    <button className={`cursor-pointer px-11 py-1 font-semibold rounded-xl  ${path === "analytics" ? "bg-white" : "hover:bg-gray-100" }`} onClick={()=>changePath("analytics")}>
      Analytics
    </button>
  </div>
</section>

    </React.Fragment>
  )
}

export default IntroDashboard ;