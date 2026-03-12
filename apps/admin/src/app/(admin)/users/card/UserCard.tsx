"use client";

import type { User } from "@/types/User";
import { useRouter } from "next/navigation";

const UserCard = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleView = (id : number) => {
    router.push(`/users/user-details/${id}`);
  } ;

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col items-center text-center">

        <img
          src={user.avatarUrl || "https://i.pravatar.cc/150"}
          alt={user.username}
          className="w-16 h-16 rounded-full mb-3 object-cover"
        />

        <h3 className="font-semibold text-lg text-black">
          {user.username || "Unknown User"}
        </h3>

        <p className="text-sm text-gray-500 mb-3">
          {user.email || "No email"}
        </p>

        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 text-xs border rounded-full">
            {user.role}
          </span>

          <span className="px-3 py-1 text-xs border rounded-full">
            {user.isBanned ? "Banned" : "Active"}
          </span>
        </div>

        <div className="flex gap-2 w-full">
          <button onClick={()=>handleView(user.id)} className="flex-1 border text-sm py-2 rounded-lg hover:bg-black hover:text-white transition">
            View
          </button>

          <button className="flex-1 border text-sm py-2 rounded-lg hover:bg-black hover:text-white transition">
            {user.isBanned ? "Unban" : "Ban"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserCard;