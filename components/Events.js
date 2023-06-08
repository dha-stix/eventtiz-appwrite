import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/router";
import { BsFillShareFill } from "react-icons/bs";
import ShareEventModal from "./ShareEventModal";
import { deleteTicket, formatDate } from "../utils/functions";

const Events = ({ events }) => {
	const router = useRouter();
	const handleRoute = (slug, id) =>
		router.push({ pathname: `/events/${id}/${slug}` });

	return (
		<div className='w-full flex flex-wrap items-center justify-center'>
			{events.map((event) => (
				<div
					className='md:w-[450px] w-full hover:shadow border-[1px] rounded-2xl m-3'
					key={event.$id}
				>
					<div
						className='p-4 w-full cursor-pointer'
						onClick={() => handleRoute(event.slug, event.$id)}
					>
						<h2 className='text-xl font-medium mb-6'>{event.title}</h2>
						<p className='opacity-80'>
							{event?.attendees?.length > 0
								? `${event.attendees.length} person(s) registered`
								: `No attendee yet`}
						</p>
						<p className='opacity-50'>Time: {event.time}</p>
						<p className='opacity-50'>Date: {formatDate(event.date)}</p>
						<p className='opacity-50'>Venue: {event.venue}</p>
					</div>

					<div className='w-full py-6 bg-[#C07F00] rounded-b-2xl flex items-center px-4 justify-between'>
						<MdDelete
							className='text-gray-200 text-2xl cursor-pointer'
							onClick={() => deleteTicket(event.$id)}
						/>
					</div>
				</div>
			))}
		</div>
	);
};

export default Events;
