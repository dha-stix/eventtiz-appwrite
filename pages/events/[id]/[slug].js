import React, { useEffect, useState } from "react";
import ErrorPage from "../../../components/ErrorPage";
import Loading from "../../../components/Loading";
import { useRouter } from "next/router";
import ShareEventModal from "../../../components/ShareEventModal";
import Attendees from "../../../components/Attendees";
import { AiTwotoneHome } from "react-icons/ai";
import { BsFillShareFill } from "react-icons/bs";
import Head from "next/head";
import Link from "next/link";

import { db } from "../../../utils/appwrite";

export async function getServerSideProps(context) {
	let event = {};
	try {
		const promise = await db.getDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
			context.query.id
		);
		event = promise;
	} catch (err) {
		event = {};
	}

	return {
		props: { event },
	};
}

const Component = ({ event }) => {
	const router = useRouter();
	const [click, setClick] = useState(event.disableRegistration);
	const [showModal, setShowModal] = useState(false);
	const [disableRegModal, setDisableRegModal] = useState(false);
	const openModal = () => setShowModal(true);
	const closeModal = () => setShowModal(false);

	if (!event.$id) return <ErrorPage />;

	return (
		<div>
			<Head>
				<title>{`${event.title} | EventTiz`}</title>
				<meta
					name='description'
					content='An event ticketing system built with NextJS and Firebase'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main>
				<div className='h-[45vh] p-3 flex flex-col items-center justify-center bg-[#FFD95A] registergray w-full '>
					<h2 className='text-4xl font-extrabold mb-4 text-center text-white'>
						{event.title}
					</h2>
					{event.attendees.length > 0 && (
						<p className='text-xl font-extrabold mb-6 text-white'>
							Total Attendees:{" "}
							<span className='text-white'>{event.attendees.length}</span>
						</p>
					)}
				</div>
				<Attendees
					attendees={event.attendees}
					id={router.query.id}
					click={click}
					setClick={setClick}
					disableRegModal={disableRegModal}
					setDisableRegModal={setDisableRegModal}
				/>

				<Link href='/dashboard' className='absolute top-6 left-4 py-2 px-4'>
					<AiTwotoneHome className='text-4xl text-[#FFD95A]' />
				</Link>
				{!click && (
					<BsFillShareFill
						className=' absolute top-6 right-10 cursor-pointer text-2xl text-[#FFD95A]'
						onClick={openModal}
					/>
				)}
				{showModal && <ShareEventModal event={event} closeModal={closeModal} />}
			</main>
		</div>
	);
};

export default Component;
