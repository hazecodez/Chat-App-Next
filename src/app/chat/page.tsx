"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaRegUser } from "react-icons/fa";
import { LuGalleryVertical } from "react-icons/lu";
import ChatBox from "./components/ChatBox";
import { signOut } from "firebase/auth";
import { RiLogoutCircleLine } from "react-icons/ri";

export default function ChatPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      <header className="flex justify-between bg-white p-4 shadow-md">
        <div>
          <img src="logo.png" alt="logo" className="w-32" />
        </div>
        <div className="gap-2 flex">
        <RiLogoutCircleLine onClick={handleLogout} className="w-6 h-6"/>
          <LuGalleryVertical className="w-6 h-6" />
          <FaRegUser className="w-6 h-6" />
          
        </div>
      </header>
      <main
        className="flex-1 p-4 overflow-y-auto"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        {user && <ChatBox currentUser={user} />}
      </main>
    </div>
  );
}
