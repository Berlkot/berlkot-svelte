type FieldType = 'date' | 'string' | 'bool' | 'int' | 'file';
type Modifier = 'reqired' | string;
export type FieldConfig = [FieldType, ...Array<Modifier>];
export class Validator {
	private config;
	public status: { [key: string]: string } = {};
	constructor(config: { [key: string]: FieldConfig }) {
		this.config = config;
	}
	parseData(data: FormData) {
		const out: { [key: string]: Date | string | boolean | number | File } = {};
		outer: for (const key in this.config) {
			const [f_type, ...params] = this.config[key];
			const value = data.get(key);
			if (!value) {
				if (params.includes('reqired')) {
					this.status[key] = `'${key}' not found in request`;
					continue;
				}
				continue;
			}
			if (f_type === 'file') {
				out[key] = value;
			} else if (
				(f_type === 'bool' && value.toString() === 'false') ||
				value.toString() === 'true'
			) {
				out[key] = value === 'true';
			} else if (f_type === 'date' && !isNaN(Date.parse(value.toString()))) {
				out[key] = new Date(Date.parse(value.toString()));
			} else if (f_type === 'string') {
				for (const val of params) {
				  if (val.startsWith('enum')) {
						const enumValues = val.split(':').slice(1);
						if (enumValues.includes(value.toString().toUpperCase())) {
							out[key] = value.toString().toUpperCase();
						} else {
							this.status[key] = `Expected one of ${enumValues.join(', ')}. Found ${value}`;
							continue outer;
						}
					} else if (val.startsWith('range')) {
						const range = val.split(':');
						if (
							(value as string).length >= parseInt(range[1]) &&
							(value as string).length < parseInt(range[2])
						) {
							out[key] = value as string;
						} else {
							this.status[key] = `Value is too long. Expected between ${range[1]}:${range[2]}. Found ${value}`;
							continue outer;
						}
					}
				}
				out[key] = value.toString();
			} else if (f_type === 'int') {
				const int_val = parseInt(value as string);
				if (isNaN(int_val)) {
					this.status[key] = `Expected integer`;
					continue;
				}
				for (const val of params) {
					if (val.startsWith('range')) {
						const range = val.split(':');
						if (int_val >= parseInt(range[1]) && int_val < parseInt(range[2])) {
							out[key] = int_val;
						} else {
							this.status[key] = `Value is too large. Expected between ${range[1]}:${range[2]}. Found ${value}`;	
						}
						continue outer;
					}
				}
				out[key] = int_val;
			} else {
				this.status[key] = `Value is not '${f_type}'`;
				continue;
			}
		}
		if (Object.keys(this.status).length > 0) {
			return;
		}
		return out;
	}
}
