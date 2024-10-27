import { Room, Building } from "./RoomModel";
import * as parse5 from "parse5";
import JSZip from "jszip";
import { findNodeWithAttribute, getTextFromNode, findNode, findTableWithTdClass } from "./HtmlUtils";
import { InsightError } from "./IInsightFacade";

export class RoomsProcessor {
	public async processRooms(content: string): Promise<Room[]> {
		const zip = new JSZip();
		const unzipped = await zip.loadAsync(content, { base64: true });
		if (!unzipped) {
			throw new InsightError("Unable to read content");
		}
		const indexFile = unzipped.file("index.htm");
		if (!indexFile) {
			throw new InsightError("index.htm file missing in rooms dataset");
		}
		const indexContent = await indexFile.async("text");
		const buildings = await this.parseIndexFile(indexContent);

		const roomPromises: Promise<Room[]>[] = [];

		for (const building of buildings) {
			const buildingFile = unzipped.file(building.filepath);
			if (!buildingFile) {
				// The building file might not exist; skip this building
				continue;
			}
			const buildingPromise = buildingFile.async("text").then(async (buildingContent) => {
				return this.parseBuildingFile(buildingContent, building);
			});
			roomPromises.push(buildingPromise);
		}

		const roomsArrays = await Promise.all(roomPromises);
		const rooms: Room[] = roomsArrays.flat();

		return rooms;
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
					if (linkNode?.attrs) {
						const hrefAttr = linkNode.attrs.find((attr: any) => attr.name === "href");
						if (hrefAttr) {
							building.filepath = hrefAttr.value.replace(/^\./, "").replace(/^\//, "");
						}
						building.shortname = getTextFromNode(linkNode).trim();
					}
				} else if (classValue.includes("views-field-field-building-address")) {
					building.address = getTextFromNode(td).trim();
				}
			}
		}
		if (building.shortname && building.address && building.filepath) {
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
		room.furniture = getTextFromNode(td).trim();
	}

	private extractRoomType(td: any, room: Partial<Room>): void {
		room.type = getTextFromNode(td).trim();
	}
}
