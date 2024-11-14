import { Building, Room } from "./RoomModel";
import * as parse5 from "parse5";
import JSZip from "jszip";
import { findNode, findNodeWithAttribute, findTableWithTdClass, getTextFromNode } from "./HtmlUtils";
import { InsightError } from "./IInsightFacade";
import http from "http";

export class RoomsProcessor {
	private async geolocationBuilding(buildings: any): Promise<void> {
		await Promise.all(
			buildings.map(async (building: { address: string; lat: number; lon: number; shortname: any }) => {
				try {
					const { lat, lon } = await this.getGeolocation(building.address);
					building.lat = lat;
					building.lon = lon;
				} catch (error) {
					console.warn(`Could not fetch geolocation for ${building.shortname}: ${error}`);
				}
			})
		);
	}

	public async processRooms(content: string): Promise<Room[]> {
		// const zip = new JSZip();
		// const unzipped = await zip.loadAsync(content, { base64: true });
		// if (!unzipped) {
		// 	throw new InsightError("Unable to read content");
		// }
		const unzipped = await this.loadZipContent(content);

		const indexFile = unzipped.file("index.htm");
		if (!indexFile) {
			throw new InsightError("index.htm file missing in rooms dataset");
		}
		const indexContent = await indexFile.async("text");
		let buildings = [];
		try {
			buildings = await this.parseIndexFile(indexContent);
		} catch {
			throw new InsightError("unable to parse buildings");
		}

		try {
			await this.geolocationBuilding(buildings);
		} catch {
			throw new InsightError("Not geolocation-ing");
		}

		let roomPromises: Promise<Room[]>[] = [];
		try {
			roomPromises = await this.processBuildings(unzipped, buildings);
		} catch {
			throw new InsightError("unable to process buildings.");
		}

		// for (const building of buildings) {
		// 	const buildingFile = unzipped.file(building.filepath);
		// 	if (!buildingFile) {
		// 		// The building file might not exist; skip this building
		// 		continue;
		// 	}
		// 	const buildingPromise = buildingFile.async("text").then(async (buildingContent) => {
		// 		return this.parseBuildingFile(buildingContent, building);
		// 	});
		// 	roomPromises.push(buildingPromise);
		// }

		let roomsArrays: Room[][] = [];
		try {
			roomsArrays = await Promise.all(roomPromises);
		} catch {
			throw new InsightError("unable to fulfill roomPromises");
		}
		return roomsArrays.flat();
	}

	private async processBuildings(unzipped: JSZip, buildings: any[]): Promise<Promise<Room[]>[]> {
		const roomPromises: Promise<Room[]>[] = [];

		for (const building of buildings) {
			const buildingFile = unzipped.file(building.filepath);
			if (!buildingFile) {
				// The building file might not exist; skip this building
				continue;
			}
			const buildingPromise = buildingFile.async("text").then(async (buildingContent: string) => {
				return this.parseBuildingFile(buildingContent, building);
			});
			roomPromises.push(buildingPromise);
		}

		return roomPromises;
	}

	private async loadZipContent(content: string): Promise<JSZip> {
		const zip = new JSZip();
		const unzipped = await zip.loadAsync(content, { base64: true });
		if (!unzipped) {
			throw new InsightError("Unable to read content");
		}
		return unzipped;
	}

	private async parseIndexFile(content: string): Promise<Building[]> {
		const buildings: Building[] = [];
		const document = parse5.parse(content);
		const buildingTable = findTableWithTdClass(document, "views-field-title");

		if (!buildingTable) {
			throw new InsightError("Building table not found in index.htm");
		}

		const tbody = findNode(buildingTable, "tbody");
		if (!tbody?.childNodes) {
			throw new InsightError("No tbody in building table");
		}

		for (const tr of tbody.childNodes) {
			if (tr.nodeName !== "tr") {
				continue;
			}
			const building = this.parseBuilding(tr);
			if (building) {
				buildings.push(building);
			}
		}
		return buildings;
	}

	private parseBuilding(tr: any): Building | null {
		const building: Partial<Building> = {};
		const tds = tr.childNodes.filter((node: any) => node.nodeName === "td");
		for (const td of tds) {
			const classAttr = td.attrs?.find((attr: any) => attr.name === "class");
			if (classAttr) {
				const classValue = classAttr.value;
				if (classValue.includes("views-field-title")) {
					const linkNode = findNode(td, "a");
					if (linkNode) {
						// Extract the building's full name
						building.fullname = getTextFromNode(linkNode).trim();

						// Extract filepath
						const hrefAttr = linkNode.attrs.find((attr: any) => attr.name === "href");
						if (hrefAttr) {
							building.filepath = hrefAttr.value.replace(/^\./, "").replace(/^\//, "");
							// Extract shortname from filepath
							const filename = building.filepath!.split("/").pop();
							if (filename) {
								const shortname = filename.split(".")[0]; // e.g., "chem"
								building.shortname = shortname.toUpperCase(); // e.g., "CHEM"
							}
						}
					}
				} else if (classValue.includes("views-field-field-building-address")) {
					building.address = getTextFromNode(td).trim();
				}
			}
		}
		if (building.shortname && building.address && building.filepath && building.fullname) {
			return building as Building;
		}
		return null;
	}

	private async parseBuildingFile(content: string, building: Building): Promise<Room[]> {
		const rooms: Room[] = [];
		const document = parse5.parse(content);

		// Extract the building fullname
		building.fullname = this.extractBuildingFullname(document) || building.fullname || "";

		// Find the room table
		const roomTable = findTableWithTdClass(document, "views-field-field-room-number");
		if (!roomTable) {
			// No valid rooms in this building
			return rooms;
		}

		const tbody = findNode(roomTable, "tbody");
		if (!tbody?.childNodes) {
			// No rooms
			return rooms;
		}

		for (const tr of tbody.childNodes) {
			if (tr.nodeName !== "tr") {
				continue;
			}
			const room = this.parseRoom(tr, building);
			if (room) {
				room.lat = building.lat;
				room.lon = building.lon;
				rooms.push(room);
			}
		}
		return rooms;
	}

	private extractBuildingFullname(document: any): string | undefined {
		const buildingInfoNode = findNodeWithAttribute(document, "div", "id", "building-info");
		if (buildingInfoNode) {
			const h2Node = findNode(buildingInfoNode, "h2");
			if (h2Node) {
				return getTextFromNode(h2Node).trim();
			}
		}
		return undefined;
	}

	private parseRoom(tr: any, building: Building): Room | null {
		const room: Partial<Room> = {};
		room.fullname = building.fullname || "";
		room.shortname = building.shortname;
		room.address = building.address;
		room.name = ""; // To be constructed
		room.number = "";

		const tds = tr.childNodes.filter((node: any) => node.nodeName === "td");
		for (const td of tds) {
			const classAttr = td.attrs?.find((attr: any) => attr.name === "class");
			if (classAttr) {
				const classValue = classAttr.value;
				if (classValue.includes("views-field-field-room-number")) {
					this.extractRoomNumber(td, room);
				} else if (classValue.includes("views-field-field-room-capacity")) {
					this.extractRoomSeats(td, room);
				} else if (classValue.includes("views-field-field-room-furniture")) {
					this.extractRoomFurniture(td, room);
				} else if (classValue.includes("views-field-field-room-type")) {
					this.extractRoomType(td, room);
				}
			}
		}
		if (room.name && room.seats !== undefined && room.type && room.furniture && room.href) {
			return room as Room;
		}
		return null;
	}

	private extractRoomNumber(td: any, room: Partial<Room>): void {
		const linkNode = findNode(td, "a");
		if (linkNode?.attrs) {
			const hrefAttr = linkNode.attrs.find((attr: any) => attr.name === "href");
			if (hrefAttr) {
				room.href = hrefAttr.value.trim();
			}
			room.number = getTextFromNode(linkNode).trim();
			room.name = room.shortname + "_" + room.number;
		}
	}

	private extractRoomSeats(td: any, room: Partial<Room>): void {
		const seatsStr = getTextFromNode(td).trim();
		room.seats = parseInt(seatsStr, 10);
	}

	private extractRoomFurniture(td: any, room: Partial<Room>): void {
		const furniture = getTextFromNode(td).trim();
		if (furniture) {
			room.furniture = furniture;
		} else {
			room.furniture = "";
		}
	}

	private extractRoomType(td: any, room: Partial<Room>): void {
		const type = getTextFromNode(td).trim();
		if (type) {
			room.type = type;
		} else {
			room.type = "";
		}
	}

	private async getGeolocation(address: string): Promise<{ lat: number; lon: number }> {
		const teamNumber = "165";
		const encodedAddress = encodeURIComponent(address);
		const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team${teamNumber}/${encodedAddress}`;

		return new Promise((resolve, reject) => {
			http
				.get(url, (res) => {
					let data = "";

					res.on("data", (chunk) => {
						data += chunk;
					});

					res.on("end", () => {
						try {
							const response: { lat?: number; lon?: number; error?: string } = JSON.parse(data);
							if (response.error) {
								reject(new Error(`Geolocation error: ${response.error}`));
							} else if (response.lat !== undefined && response.lon !== undefined) {
								resolve({ lat: response.lat, lon: response.lon });
							} else {
								reject(new Error("Invalid geolocation response format"));
							}
						} catch (error) {
							reject(new Error(`Failed to parse geolocation response due to error: ${error}`));
						}
					});
				})
				.on("error", (err) => {
					reject(new Error("HTTP request error: " + err.message));
				});
		});
	}
}
