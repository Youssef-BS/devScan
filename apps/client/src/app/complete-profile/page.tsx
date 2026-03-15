"use client";

import { useState } from "react";
import { CompleteProfileApi } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {

  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    await CompleteProfileApi({
      firstName,
      lastName,
      password,
    });

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96 mx-auto mt-20">

      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e)=>setFirstName(e.target.value)}
      />

      <input
        placeholder="Last Name"
        value={lastName}
        onChange={(e)=>setLastName(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button type="submit">
        Complete Profile
      </button>

    </form>
  );
}