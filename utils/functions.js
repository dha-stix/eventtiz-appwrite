import { account, db, storage } from "./appwrite";
import { toast } from "react-toastify";
import { ID, Query } from "appwrite";
import emailjs from "@emailjs/browser";

//👇🏻 generate random strings as ID
const generateID = () => Math.random().toString(36).substring(2, 24);

//👇🏻 extract file ID from the document
const extractIdFromUrl = (url) => {
	const regex = /files\/([^/]+)\//;
	const match = url.match(regex);
	return match ? match[1] : null;
};

//👇🏻 convert the date to human-readable form
export const formatDate = (dateString) => {
	const options = { year: "numeric", month: "long", day: "numeric" };
	const date = new Date(dateString);
	const formattedDate = date.toLocaleDateString("en-US", options);

	const day = date.getDate();
	let suffix = "th";
	if (day === 1 || day === 21 || day === 31) {
		suffix = "st";
	} else if (day === 2 || day === 22) {
		suffix = "nd";
	} else if (day === 3 || day === 23) {
		suffix = "rd";
	}

	const formattedDateWithSuffix = formattedDate.replace(/\d+/, day + suffix);

	return formattedDateWithSuffix;
};

//👇🏻 send email via EmailJS
const sendEmail = (
	name,
	email,
	title,
	time,
	date,
	note,
	description,
	passcode,
	flier_url,
	setSuccess,
	setLoading
) => {
	emailjs
		.send(
			process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
			process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
			{
				name,
				email,
				title,
				time,
				date: formatDate(date),
				note,
				description,
				passcode,
				flier_url,
			},
			process.env.NEXT_PUBLIC_EMAIL_API_KEY
		)
		.then(
			(result) => {
				setLoading(false);
				setSuccess(true);
			},
			(error) => {
				alert(error.text);
			}
		);
};

//👇🏻 converts JSON string to JavaScript objects
export const parseJSON = (jsonString) => {
	try {
		return JSON.parse(jsonString);
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return null;
	}
};

//👇🏻 generate slug
export const createSlug = (sentence) => {
	let slug = sentence.toLowerCase().trim();
	slug = slug.replace(/[^a-z0-9]+/g, "-");
	slug = slug.replace(/^-+|-+$/g, "");
	return slug;
};

//👇🏻 alerts a success message
const successMessage = (message) => {
	toast.success(message, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
	});
};
//👇🏻 alerts an error message
const errorMessage = (message) => {
	toast.error(message, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
	});
};
//👇🏻 Appwrite signUp function
export const signUp = (name, email, password, router) => {
	const promise = account.create(ID.unique(), email, password, name);

	promise.then(
		function (response) {
			successMessage("Account created! 🎉");
			router.push("/login");
		},
		function (error) {
			errorMessage("Check your network / User already exists ❌");
			router.push("/login");
		}
	);
};

//👇🏻 Appwrite login function
export const logIn = (email, setEmail, password, setPassword, router) => {
	const promise = account.createEmailSession(email, password);

	promise.then(
		function (response) {
			successMessage(`Welcome back 🎉`);
			setEmail("");
			setPassword("");
			router.push("/dashboard");
		},
		function (error) {
			console.log(error);
			errorMessage("Invalid credentials ❌");
		}
	);
};
//👇🏻 Appwrite logout function
export const logOut = (router) => {
	const promise = account.deleteSession("current");

	promise.then(
		function (response) {
			router.push("/");
			successMessage("See ya later 🎉");
		},
		function (error) {
			console.log(error);
			errorMessage("Encountered an error 😪");
		}
	);
};
//👇🏻 Appwrite authenticate user
export const checkAuthStatus = (setUser, setLoading, router) => {
	const promise = account.get();
	promise.then(
		function (response) {
			console.log("LOG >>>", response);
			setUser(response);
			setLoading(false);
		},
		function (error) {
			router.push("/");
		}
	);
};
//👇🏻 Appwrite authenticate and get user's tickets
export const checkAuthStatusDashboard = (
	setUser,
	setLoading,
	setEvents,
	router
) => {
	const promise = account.get();
	promise.then(
		function (response) {
			getTickets(response.$id, setEvents, setLoading);
			setUser(response);
		},
		function (error) {
			router.push("/");
		}
	);
};
//👇🏻 create a new ticket
export const createTicket = (
	id,
	title,
	date,
	time,
	venue,
	description,
	note,
	flier,
	router
) => {
	const createDocument = (flier_url = "https://google.com") => {
		const eventPromise = db.createDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
			ID.unique(),
			{
				user_id: id,
				title,
				date,
				time,
				venue,
				description,
				note,
				slug: createSlug(title),
				attendees: [],
				disableRegistration: false,
				flier_url,
			}
		);
		eventPromise.then(
			function (response) {
				successMessage("Ticket created 🎉");
				router.push("/dashboard");
			},
			function (error) {
				console.log("DB ERROR >>", error);
				errorMessage("Encountered an error ❌");
			}
		);
	};

	if (flier !== null) {
		const storagePromise = storage.createFile(
			process.env.NEXT_PUBLIC_BUCKET_ID,
			ID.unique(),
			flier
		);

		storagePromise.then(
			function (response) {
				createDocument(
					`https://cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_BUCKET_ID}/files/${response.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECT_ID}&mode=admin`
				);
			},
			function (error) {
				console.log("STORAGE ERR >>>", error); // Failure
			}
		);
	} else {
		createDocument();
	}
};
//👇🏻 get user's tickets
const getTickets = (id, setEvents, setLoading) => {
	const promise = db.listDocuments(
		process.env.NEXT_PUBLIC_DB_ID,
		process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
		[Query.equal("user_id", id)]
	);
	promise
		.then((response) => {
			setEvents(response.documents);
			setLoading(false);
			console.log(response.documents);
		})
		.catch((err) => console.error(err));
};
//👇🏻 delete a ticket
export const deleteTicket = async (id) => {
	try {
		const getDoc = await db.getDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
			id
		);
		if (getDoc.flier_url === "https://google.com") {
			await db.deleteDocument(
				process.env.NEXT_PUBLIC_DB_ID,
				process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
				id
			);
		} else {
			const fileID = extractIdFromUrl(getDoc.flier_url);
			await storage.deleteFile(process.env.NEXT_PUBLIC_BUCKET_ID, fileID);
			await db.deleteDocument(
				process.env.NEXT_PUBLIC_DB_ID,
				process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
				id
			);
		}
		successMessage("Ticket deleted! 🎉");
	} catch (err) {
		console.log(err); // Failure
		errorMessage("Action declined ❌");
	}
};
//👇🏻 register an attendee
export const registerAttendee = async (
	name,
	email,
	documentId,
	setSuccess,
	setLoading
) => {
	try {
		const doc = await db.getDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
			documentId
		);
		const attendeeID = generateID();
		const JSONattendees = doc.attendees;
		const attendees = JSONattendees.map(parseJSON);
		const result = attendees.filter((item) => item.email === email);

		if (result.length === 0) {
			await db.updateDocument(
				process.env.NEXT_PUBLIC_DB_ID,
				process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
				documentId,
				{
					attendees: [
						...doc.attendees,
						JSON.stringify({ name, email, id: attendeeID }),
					],
				}
			);
			const flierURL =
				doc.flier_url !== "https://google.com"
					? doc.flier_url
					: "No flier for this event";

			sendEmail(
				name,
				email,
				doc.title,
				doc.time,
				doc.date,
				doc.note,
				doc.description,
				attendeeID,
				flierURL,
				setSuccess,
				setLoading
			);
		} else {
			errorMessage("User already registered ❌");
		}
	} catch (err) {
		console.log(err); // Failure
		errorMessage("Encountered an error!");
	}
};
//👇🏻 disable an event registration
export const disableRegistration = async (documentId) => {
	try {
		await db.updateDocument(
			process.env.NEXT_PUBLIC_DB_ID,
			process.env.NEXT_PUBLIC_EVENTS_COLLECTION_ID,
			documentId,
			{
				disableRegistration: true,
			}
		);
		successMessage("New registration disabled! 🎉");
	} catch (err) {
		console.log(err); // Failure
		errorMessage("Encountered an error 😪");
	}
};
