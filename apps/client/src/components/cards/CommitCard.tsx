"use client";
import Link from "next/link";
import { 
  CalendarDays, 
  User, 
  GitBranch,
  ChevronRight 
} from "lucide-react";

interface Commit {
  sha: string;
  author: string;
  message: string;
  date: string;
}

interface CommitCardProps {
  commit: Commit;
}

const CommitCard = ({ commit }: CommitCardProps) => {
  return (
    <Link href={`/dashboard/commits/${commit.sha}`}>
      <div className="group bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-300 cursor-pointer">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{commit.author}</p>
              <p className="text-sm text-gray-300">Author</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-2 transition-transform" />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-300 mb-1">Commit Message</p>
            <p className="text-lg font-medium line-clamp-2">
              {commit.message}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-300">SHA</p>
                <p className="font-mono text-sm">
                  {commit.sha.substring(0, 12)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-300">Date</p>
                <p className="text-sm">
                  {new Date(commit.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Link>
  );
};

export default CommitCard;