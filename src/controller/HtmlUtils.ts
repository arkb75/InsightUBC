export function findNodeWithAttribute(node: any, nodeName: string, attrName: string, attrValue: string): any {
	if (node.nodeName === nodeName && node.attrs) {
		const attr = node.attrs.find((a: any) => a.name === attrName && a.value === attrValue);
		if (attr) {
			return node;
		}
	}
	for (const child of node.childNodes ?? []) {
		const result = findNodeWithAttribute(child, nodeName, attrName, attrValue);
		if (result) {
			return result;
		}
	}
	return null;
}

export function getTextFromNode(node: any): string {
	let text = "";
	if (node.nodeName === "#text") {
		text += node.value;
	}
	for (const child of node.childNodes ?? []) {
		text += getTextFromNode(child);
	}
	return text;
}

export function findNode(node: any, nodeName: string): any {
	if (node.nodeName === nodeName) {
		return node;
	}
	for (const child of node.childNodes ?? []) {
		const result = findNode(child, nodeName);
		if (result) {
			return result;
		}
	}
	return null;
}

export function getAllNodesWithTag(node: any, tagName: string): any[] {
	let result: any[] = [];
	if (node.nodeName === tagName) {
		result.push(node);
	}
	for (const child of node.childNodes ?? []) {
		result = result.concat(getAllNodesWithTag(child, tagName));
	}
	return result;
}

export function findTableWithTdClass(node: any, tdClass: string): any {
	if (node.nodeName === "table") {
		const tds = getAllNodesWithTag(node, "td");
		for (const td of tds) {
			const classAttr = td.attrs?.find((attr: any) => attr.name === "class");
			if (classAttr?.value.includes(tdClass)) {
				return node;
			}
		}
	}
	for (const child of node.childNodes ?? []) {
		const result = findTableWithTdClass(child, tdClass);
		if (result) {
			return result;
		}
	}
	return null;
}
