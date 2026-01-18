"use client";

export default function Auth() {

  const handleLogin = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={handleLogin}
        className="px-6 py-3 text-white bg-black rounded-lg"
      >
        Login with GitHub
      </button>
    </div>
  );
}
