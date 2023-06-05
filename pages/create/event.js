import React, { useState, useEffect, useCallback, useRef } from "react";
import { MdCancel } from "react-icons/md";
import { GrAttachment } from "react-icons/gr";
import AuthNav from "../../components/AuthNav";
import SideNav from "../../components/SideNav";
import Loading from "../../components/Loading";
import DatePicker from "react-datepicker";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { checkAuthStatus, createEvent } from "../../utils/functions";

const event = () => {
	const [user, setUser] = useState({});
	const [title, setTitle] = useState("");
	const [date, setDate] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState();
	const [time, setTime] = useState("");
	const [venue, setVenue] = useState("");
	const [description, setDescription] = useState("");
	const [note, setNote] = useState("");
	const [flier, setFlier] = useState(null);
	const fileName = useRef();
	const [buttonClicked, setButtonClicked] = useState(false);
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	const authenticateUser = useCallback(() => {
		checkAuthStatus(setUser, setLoading, router);
	}, []);

	useEffect(() => {
		authenticateUser();
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		setButtonClicked(true);
		createEvent(
			user.$id,
			title,
			date,
			time,
			venue,
			description,
			note,
			flier,
			router
		);
	};

	if (loading) return <Loading title='Authenticating...' />;

	return (
		<div>
			<Head>
				<title>Create New Event | EventTiz</title>
				<meta
					name='description'
					content='An event ticketing system built with NextJS and Firebase'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main>
				<AuthNav user={user} />
				<div className=' w-full flex items-center'>
					<div className='md:w-[20%] md:block hidden'>
						<SideNav />
					</div>
					<div className=' md:w-[80%] w-full min-h-[90vh] py-10 px-4'>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-2xl font-bold '>Create a new event</h2>
							<Link href='/dashboard'>
								<MdCancel className='text-4xl text-[#C07F00] cursor-pointer' />
							</Link>
						</div>

						<form className='flex flex-col' onSubmit={handleSubmit}>
							<label htmlFor='title'>Title</label>
							<input
								name='title'
								type='text'
								className='border-[1px] py-2 px-4 rounded-md mb-4'
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>

							<label htmlFor='venue'>Venue</label>
							<input
								name='venue'
								type='text'
								className='border-[1px] py-2 px-4 rounded-md mb-4'
								required
								value={venue}
								onChange={(e) => setVenue(e.target.value)}
								placeholder='Plot Address, Lagos, Nigeria'
							/>

							<div className='w-full flex justify-between mb-4'>
								<div className='w-1/2 flex flex-col'>
									<label htmlFor='time'>Time</label>
									<input
										name='time'
										type='time'
										className='border-[1px] py-2 px-4 rounded-md'
										required
										value={time}
										onChange={(e) => setTime(e.target.value)}
									/>
								</div>
								<div className='w-1/2 flex flex-col ml-[20px]'>
									<p> Date</p>
									<DatePicker
										selectsEnd
										selected={selectedDate}
										required
										onChange={(date) => setSelectedDate(date)}
										endDate={selectedDate}
										minDate={date}
										className='border-[1px] w-full py-2 px-4 rounded-md '
									/>
								</div>
							</div>

							<label htmlFor='description'>
								Event Description{" "}
								<span className='text-gray-500'>(optional)</span>
							</label>
							<textarea
								name='description'
								rows={4}
								className='border-[1px] py-2 px-4 rounded-md mb-4'
								placeholder='Any information or details about the event'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
							<label htmlFor='note'>
								Note to Attendees{" "}
								<span className='text-gray-500'>(optional)</span>
							</label>
							<textarea
								name='note'
								rows={4}
								value={note}
								onChange={(e) => setNote(e.target.value)}
								className='border-[1px] py-2 px-4 rounded-md mb-4'
								placeholder='Every attendee must take note of this'
							/>
							<label
								htmlFor='file'
								className='cursor-pointer border-[1px] bg-gray-200 py-2 px-4 rounded-lg flex items-center text-gray-600 md:w-1/3'
							>
								<GrAttachment className='mr-2' />
								{fileName.current?.files[0]?.name
									? fileName.current?.files[0]?.name
									: "Attach event flier (optional)"}
								<input
									type='file'
									name='file'
									ref={fileName}
									id='file'
									onChange={(e) => setFlier(e.target.files[0])}
									className='hidden'
									accept='image/png, image/jpeg'
								/>
								<span></span>
							</label>
							{buttonClicked ? (
								<Loading title='May take longer time for image uploads' />
							) : (
								<button className='p-4 bg-[#C07F00] w-[200px] mt-3 text-white rounded-md'>
									Create Event
								</button>
							)}
						</form>
					</div>
				</div>
			</main>
		</div>
	);
};

export default event;
