"use client"
import { AnalyseCardProps } from "../../types/Analyse";

const AnalyseCard = ({id , logo , title , desc} : AnalyseCardProps ) => {

  return (

    <div className='max-h-64 min-w-80 gap-1 flex flex-col m-3.5 rounded-lg p-3.5 shadow' key={id}>
        <div className='h-12 w-12 rounded-lg'>
            {logo}
        </div>
        <div className='gap-1'>
            <h1 className="font-bold">{title}</h1>
            <p className="text-gray-800 ">{desc}</p>
        </div>
    </div>
  
)
}

export default AnalyseCard ;