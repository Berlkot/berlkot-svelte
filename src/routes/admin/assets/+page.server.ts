import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/modules/database/prisma.server';
import { Asset, setAssetData } from '$modules/asset/model.server';
import { Validator, type FieldConfig } from '$lib/modules/forms/form-validator';

const validatorConfig: { [key: string]: FieldConfig } = {
	id: ['string', 'reqired'],
	file: ['file'],
	name: ['string', 'reqired'],
	alt: ['string'],
	credit: ['string'],
	visibility: ['string', 'enum:ADMIN:PUBLIC:SUB_ONLY']
};
const validatorConfigCreation = { ...validatorConfig };
validatorConfigCreation.file.push('reqired');
delete validatorConfigCreation.id;

export async function load() {
	return { images: await prisma.asset.findMany() };
}

export const actions = {
	edit: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfig);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, id, ...rest } = data;
		const asset = await Asset.newFrom({ id: id as string });
		Object.assign(asset, rest, { name: String(name) });
		if ((file as File).name) {
			try {
				await setAssetData(file as File, String(name));
			} catch {
				return fail(422, { message: 'Failed to proccess media' });
			}
		}
		asset.save();
		return asset.deconstruct();
	},
	create: async ({ request }: RequestEvent) => {
		const validator = new Validator(validatorConfigCreation);
		const data = validator.parseData(await request.formData());
		if (!data) {
			return fail(400, validator.status);
		}
		const { file, name, ...rest } = data;
		try {
			await setAssetData(file as File, String(name));
		} catch {
			return fail(422, { message: 'Failed to proccess media' });
		}
		const asset = await Asset.new({ name: String(name), ...rest });
		asset.save();
		return asset.deconstruct();
	},
	delete: async ({ request }: RequestEvent) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		(await Asset.newFrom({ name: name })).delete();
	}
} satisfies Actions;
