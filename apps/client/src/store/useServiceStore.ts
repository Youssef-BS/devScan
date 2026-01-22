import {create} from 'zustand' ; 
import { persist } from 'zustand/middleware';
import type { AnalyseCardProps } from '@/types/analyse';


export type Service = AnalyseCardProps ;

interface ServiceStore {
    services : Service[] ;
    setServices : (services : Service[]) => void ;
}

export const useServiceStore = create<ServiceStore>()(
    persist (
        (set)=> ({
            services : [] ,
            setServices : (services : Service[]) => set({services}) ,
        }) , 
        { name : 'service-store' }
    )
)