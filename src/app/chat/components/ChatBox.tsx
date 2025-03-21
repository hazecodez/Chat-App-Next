"use client";
import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { User } from "firebase/auth";
import { IoMdCloseCircle } from "react-icons/io";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
}

export default function ChatBox({ currentUser }: { currentUser: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);

  // fetch all users except the current user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const usersData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.id !== currentUser.uid) as UserProfile[];

      setUsers(usersData);
    };

    fetchUsers();
  }, [currentUser]);

  // Fetch messages in real-time
  useEffect(() => {
    if (!currentUser || !receiverId) return;

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      const filteredMessages = messagesData.filter(
        (msg) =>
          (msg.senderId === currentUser.uid && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === currentUser.uid)
      ) as Message[];
      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [currentUser, receiverId]);

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !receiverId) return;

    await addDoc(collection(db, "messages"), {
      text: input,
      senderId: currentUser.uid,
      receiverId,
      timestamp: serverTimestamp(),
      read: false,
    });

    setInput("");
  };

  // Add a new user to Firestore (if not already added)
  const addUserToFirestore = async () => {
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        email: currentUser.email,
        displayName: currentUser.displayName || "Anonymous",
        photoURL: currentUser.photoURL || "",
        status: "online",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  };

  // Add the current user to Firestore when the component mounts
  useEffect(() => {
    if (currentUser) {
      addUserToFirestore();
    }
  }, [currentUser]);

  const clearSelectedUser = () => {
    setReceiverId("");
  };

  return (
    <div className="flex flex-cols-2 w-full h-full">
      {/* User list */}
      <div className="flex flex-col justify-start gap-2 bg-white opacity-85 backdrop-blur-xl w-12 lg:w-[600px] h-full p-2 rounded-3xl rounded-r-none border-3 border-r-0 ">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => setReceiverId(user.id)}
            className="flex w-full lg:border rounded-3xl gap-4 lg:p-2"
          >
            <FaUserCircle className="text-black w-8 h-8 cursor-pointer" />
            <p className="hidden text-black lg:flex items-center font-semibold text-lg">
              {user.displayName}
            </p>
          </div>
        ))}
      </div>

      {/* Chat box */}
      {receiverId ? (
        <div
          style={{ backgroundImage: "url('/chat.jpg')" }}
          className="bg-[#1B1B1B] opacity-85 w-full h-full p-4 rounded-3xl rounded-l-none backdrop-blur-xl border-3 border-l-0"
        >
          <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between bg-white p-2 rounded-3xl border">
              <div className="flex gap-4 items-center">
                <FaUserCircle className="text-black w-8 h-8 cursor-pointer" />
                <h2 className="text-black text-md font-bold">
                  {users.find((u) => u.id === receiverId)?.displayName}
                </h2>
              </div>
              <div
                onClick={clearSelectedUser}
                className="font-bold pr-4 flex items-center text-2xl cursor-pointer"
              >
                <IoMdCloseCircle />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-white rounded-3xl p-4 overflow-y-auto border">
              <div className="flex flex-col gap-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === currentUser?.uid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-3xl ${
                        msg.senderId === currentUser?.uid
                          ? "bg-gray-300 rounded-br-none"
                          : "bg-[#1B1B1B] rounded-bl-none"
                      }`}
                    >
                      <p
                        className={
                          msg.senderId === currentUser?.uid
                            ? "text-[#1B1B1B]"
                            : "text-white"
                        }
                      >
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-2 rounded-3xl bg-white border"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="bg-white text-black p-2 rounded-3xl border"
              >
                <IoSend className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="opacity-85 w-full h-full p-4 rounded-3xl rounded-l-none backdrop-blur-xl border-3 border-l-0"
          style={{ backgroundImage: "url('/chat.jpg')" }}
        ></div>
      )}
    </div>
  );
}
