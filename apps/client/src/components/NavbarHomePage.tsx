"use client"

const NavbarHomePage = () => {
  return (
    <div className="shadow w-full py-4 px-8 flex flex-col justify-between items-center md:flex-row ">
      <div className="flex items-center gap-3">
        <div className="logo w-10 h-10 ">
            <img src="/logo.png" alt="DevScan Logo" className="h-10 w-10 rounded-xl"/>
        </div>
        <div className="text">
         <h1 className="font-bold text-2xl">DevScan</h1>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center text-center md:text-right mt-4 md:mt-0 md:gap-6 gap-2">
        <a href="#features" className="mx-4 text-gray-700 hover:text-black">Features</a>
        <a href="#pricing" className="mx-4 text-gray-700 hover:text-black">Pricing</a>
        <a href="#contact" className="mx-4 text-gray-700 hover:text-black">Contact</a>
        <a href="/auth/login" className="mx-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Login</a>
        <a href="/#" className="mx-4 px-4 p-2 rounded-lg bg-black text-white hover:bg-gray-800  transition">Get Started free</a>
      </div>
        
    </div>
  )
}

export default NavbarHomePage
