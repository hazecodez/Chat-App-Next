import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-400" style={{ backgroundImage: "url('/')" }}>
      <h1 className="text-4xl font-bold">Welcome to Chat App</h1>
      <br />
      <Link href="/login">
        <button className="bg-black rounded-md h-8 w-40 uppercase hover:bg-white transition-colors duration-500 hover:text-black hover:border">Login</button>
      </Link>
    </div>
  );
}
