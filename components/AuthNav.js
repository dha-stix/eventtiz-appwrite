import React from "react";
import Link from "next/link";
import { logOut } from "../utils/functions";
import { AiFillBell } from "react-icons/ai";
import { useRouter } from "next/router";

const AuthNav = ({ user }) => {
	const router = useRouter();

	return (
		<nav className='w-full h-[10vh] px-8 py-2 border-b-[1px] border-gray-100 flex items-center justify-between sticky top-0 bg-white z-40'>
			<Link href='/'>
				<h2 className='font-bold text-xl'>EventTiz</h2>
			</Link>
			<div className='flex items-center space-x-5'>
				<p>{user?.name?.split(" ")[0] || " "}</p>

				<button
					onClick={() => logOut(router)}
					className='bg-[#835905] text-gray-50 py-2 px-6 rounded hover:bg-red-500'
				>
					Sign out
				</button>
			</div>
		</nav>
	);
};

export default AuthNav;
