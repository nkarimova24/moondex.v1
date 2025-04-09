"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function AuthStatus() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) return <div>Loading...</div>

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Signed in as <span className="font-semibold">{session.user.name || session.user.email}</span></p>
        <button 
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Link href="/auth/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition">
        Sign in
      </Link>
      <Link href="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
        Register
      </Link>
    </div>
  )
}