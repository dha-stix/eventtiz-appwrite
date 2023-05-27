import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import NoEvent from "../components/NoEvent";
import Loading from "../components/Loading";
import SideNav from "../components/SideNav";
import AuthNav from "../components/AuthNav";
import { checkAuthStatusDashboard } from "../utils/functions";
import { useRouter } from "next/router";
import Events from "../components/Events";

const dashboard = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState([]);
	const [user, setUser] = useState({});

	const authenticateUser = useCallback(() => {
		checkAuthStatusDashboard(setUser, setLoading, setEvents, router);
	}, []);

	useEffect(() => {
		authenticateUser();
	}, []);

	if (loading) return <Loading title='Authenticating...' />;

	return (
		<div>
			<Head>
				<title>Dashboard | EventTiz</title>
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
						{events.length > 0 ? <Events events={events} /> : <NoEvent />}
					</div>
				</div>
			</main>
		</div>
	);
};

export default dashboard;
