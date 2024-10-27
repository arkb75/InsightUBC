export interface Building {
	fullname?: string; // Full name of the building (may be undefined until extracted)
	shortname: string;
	address: string;
	filepath: string;
}

export interface Room {
	fullname: string; // Full name of the building
	shortname: string; // Short name of the building
	address: string; // Address of the building
	name: string; // Room name (shortname + number)
	number: string; // Room number
	seats: number; // Number of seats
	type: string; // Type of room
	furniture: string; // Furniture type
	href: string; // Link to room details
	lat?: number; // Latitude (optional, to be added in geolocation)
	lon?: number; // Longitude (optional, to be added in geolocation)
}
