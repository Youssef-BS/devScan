import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnalyseCardProps = {
  id: number;
  logo: any;
  title: string;
  desc: string;
};

export type Service = AnalyseCardProps;

interface ServiceStore {
  services: Service[];
  setServices: (services: Service[]) => void;
}

export const useServiceStore = create<ServiceStore>()(
  persist(
    (set) => ({
      services: [],
      setServices: (services) => set({ services }),
    }),
    {
      name: 'service-store',
    }
  )
);