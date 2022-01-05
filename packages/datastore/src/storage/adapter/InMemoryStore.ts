export class InMemoryStore {
	db: Map<string, string>;

	constructor() {
		this.db = new Map<string, string>();
		// TODO: delete next line before merging. Added for debugging purposes
		(window as any).db = this.db;
	}

	getAllKeys = async () => {
		return Array.from(this.db.keys());
	};

	multiGet = async (keys: string[]) => {
		return keys.reduce((res, k) => (res.push([k, this.db.get(k)]), res), []);
	};

	multiRemove = async (keys: string[], callback?) => {
		keys.forEach(k => this.db.delete(k));

		callback ? callback() : null;
	};

	multiSet = async (entries: string[][], callback?) => {
		entries.forEach(([key, value]) => {
			this.setItem(key, value);
		});

		callback();
	};

	setItem = async (key: string, value: string) => {
		return this.db.set(key, value);
	};

	removeItem = async (key: string) => {
		return this.db.delete(key);
	};

	getItem = async (key: string) => {
		return this.db.get(key);
	};
}

export function createInMemoryStore() {
	return new InMemoryStore();
}
