type FieldType = 'date' | 'string' | 'bool' | 'int' | 'file';
type Modifier = 'reqired' | string;
export type FieldConfig = [FieldType, ...Array<Modifier>];
export class Validator {
	private config;
	public status: { message: string} = { message: ''};
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
					this.status.message = `Required key: '${key}' not found in request`;
					return;
				}
				continue;
			}
			if (f_type === 'file') {
				out[key] = value;
			} else
			if ((f_type === 'bool' && value.toString() === 'false') || value.toString() === 'true') {
				out[key] = value === 'true';
			} else if (f_type === 'date' && !isNaN(Date.parse(value.toString()))) {
				out[key] = new Date(Date.parse(value.toString()));
			} else if (f_type === 'string') {
				for (const val of params) {
					if (val.startsWith('range')) {
						const range = val.split(':');
						if (
							(value as string).length >= parseInt(range[1]) &&
							(value as string).length < parseInt(range[2])
						) {
							out[key] = value as string;
						} else {
							this.status.message = `Key: '${key}' is too long. Expected between ${range[1]}:${range[2]}. Found ${value}`;
							return;
						}
					}
				}
				out[key] = value.toString();
			} else if (f_type === 'int') {
				const int_val = parseInt(value as string);
				if (isNaN(int_val)) {
					this.status.message = `Key: '${key}'. Expected integer`;
					return;
				}
				for (const val of params) {
					if (val.startsWith('range')) {
						const range = val.split(':');
                        
						if (int_val >= parseInt(range[1]) && int_val < parseInt(range[2])) {
							out[key] = int_val;
							continue outer;
						} else {
							this.status.message = `Key: '${key}' is too large. Expected between ${range[1]}:${range[2]}. Found ${value}`;
							return;
						}
					}
				}
				out[key] = int_val;
			} else {
				this.status.message = `Key: '${key}' is not '${f_type}'`;
				return;
			}
		}
		return out;
	}
}
