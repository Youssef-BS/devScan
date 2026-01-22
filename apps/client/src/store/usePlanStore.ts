import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Plan} from '@/types/Plan';
import {plans as mockPlans} from '@/data/plans.mock';

interface PlanStore {
    plans: Plan[];
    setPlans: (plans: Plan[]) => void;
}

export const usePlanStore = create<PlanStore>()(
    persist(
        (set)=> ({
            plans : mockPlans , 
            setPlans : (plans : Plan[]) => set({plans}) ,
        }) , {
            name : 'plan-store' ,
        }
    ) 
    
)