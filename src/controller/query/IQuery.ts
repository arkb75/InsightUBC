export interface Query {
	WHERE: Filter;
	OPTIONS: Options;
	TRANSFORMATIONS?: Transformations;
}

export type Filter = Comparison | LogicComparison | Negation | EmptyFilter;

export interface Comparison {
	type: "MCOMPARISON" | "SCOMPARISON";
	key: string;
	operator: "GT" | "LT" | "EQ" | "IS";
	value: number | string;
}

export interface LogicComparison {
	type: "LOGIC";
	operator: "AND" | "OR";
	filters: Filter[];
}

export interface Negation {
	type: "NOT";
	filter: Filter;
}

export interface EmptyFilter {
	type: "EMPTY";
}

export interface Options {
	COLUMNS: string[];
	ORDER?: Order;
}

export type Order = string | OrderObject;

export interface OrderObject {
	dir: "UP" | "DOWN";
	keys: string[];
}

export interface Transformations {
	GROUP: string[];
	APPLY: ApplyRule[];
}

export interface ApplyRule {
	applykey: string;
	token: "MAX" | "MIN" | "AVG" | "COUNT" | "SUM";
	key: string;
}
