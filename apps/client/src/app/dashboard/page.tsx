"use client"

import React , {useState , useEffect} from 'react'
import {  Search , ListFilterPlus} from 'lucide-react'
import { useRouter  } from 'next/navigation'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import IntroDashboard from '@/components/intro-dashboard'

const fakeRepos = [
  {name: "awesome-project", description: "An awesome project repository", language: "JavaScript" , state : "public", issues : 16 , lastScan: "2 days ago" , auto_audit : true},
  {name: "nextjs-app", description: "A Next.js application", language: "TypeScript", state : "private", issues : 16 , lastScan: "1 day ago" , auto_audit : false},
  {name: "java-backend", description: "Backend services in Java", language: "Java", state : "private", issues : 16, lastScan: "3 days ago" , auto_audit : true},
  {name: "react-library", description: "A reusable React component library", language: "JavaScript", state : "public", issues : 16, lastScan: "5 days ago" , auto_audit : false},
  {name: "typescript-utils", description: "Utility functions in TypeScript", language: "TypeScript", state : "public", issues : 16, lastScan: "4 days ago" , auto_audit : true},
  {name: "spring-boot-api", description: "RESTful API with Spring Boot", language: "Java", state : "public", issues : 16, lastScan: "2 weeks ago" , auto_audit : false},
]

const Dashboard = ()=> {

  const router = useRouter()
  const [currentPath, setCurrentPath] = useState<string>("repositories");
  const [search, setSearch] = useState<string>("");
  const [language, setLanguage] = useState<string>("all");

  const changePath = (path:string) => {
    console.log("Current path:", path);
    if (path === "repositories") {
      router.push("?homeType=repositories");
      setCurrentPath("repositories");
    } 
    else if (path === "analytics") {
      router.push("?homeType=analytics");
      setCurrentPath("analytics");
      setLanguage("all");
      setSearch("");
    }
  }


useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  const homeType = params.get("homeType");
  const searchParam = params.get("search");
  const languageParam = params.get("language");

  if (homeType === "repositories" || homeType === "analytics") {
    setCurrentPath(homeType);
  }

  if (searchParam) {
    setSearch(searchParam);
  }

  if (languageParam) {
    setLanguage(languageParam);
  }
}, []);


useEffect(() => {
  const timeout = setTimeout(() => {
    const params = new URLSearchParams(window.location.search);

    if (search) params.set("search", search);
    else params.delete("search");

    router.replace(`?${params.toString()}`);
  }, 400);

  return () => clearTimeout(timeout);
}, [search]);

const onLanguageChange = (value: string) => {
  setLanguage(value)

  const params = new URLSearchParams(window.location.search)
  params.set("language", value)

  router.replace(`?${params.toString()}`)
}



return (
<React.Fragment>

<IntroDashboard path={currentPath} changePath={changePath} />

<section className="mx-16 my-8">
  <div className="flex items-center w-full rounded-2xl bg-gray-100 px-4 py-2">
    <Search className="text-gray-400 mr-3 shrink-0" />
    <Input
      placeholder="Search repositories..."
      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
      onChange={(e)=>setSearch(e.target.value)}
    />
    <div className="mx-4 h-6 w-px bg-gray-300" />
    <ListFilterPlus className="text-gray-500 mr-2 shrink-0" />
    <Select
  value={language}
  defaultValue="all"
  onValueChange={onLanguageChange}
>
      <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent >
        <SelectItem value="all">All Languages</SelectItem>
        <SelectItem value="js">JavaScript</SelectItem>
        <SelectItem value="ts">TypeScript</SelectItem>
        <SelectItem value="java">Java</SelectItem>
      </SelectContent>
    </Select>

  </div>
</section>

<section className='flex flex-wrap gap-5 m-16 justify-items-start'>
  {
    fakeRepos.map((repo, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 basis-[31%] min-h-[250px] w-60 m-auto hover:shadow-sm transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-lg">{repo.name}</h2>
            <p className="text-gray-500 text-sm">{repo.description}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.state === "public" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {repo.state}
          </span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-gray-500 text-sm">{repo.language}</span>
          <span className="text-gray-500 text-sm">{repo.lastScan}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-gray-500 text-sm">Issues: {repo.issues}</span>
          <span className={`text-xs font-medium ${repo.auto_audit ? "text-green-600" : "text-red-600"}`}>
            {repo.auto_audit ? "Auto Audit Enabled" : "Auto Audit Disabled"}
          </span>
        </div>
      </div>
    ))
  }
  
</section>

    </React.Fragment>
  )
}

export default Dashboard ;