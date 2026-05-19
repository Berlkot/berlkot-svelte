/**
 * Module to abstract asset direct manipulation
 * The main purpose is to take out most of the need to keep up with state outside of this class or directly call to service
 * Outside of that interaction and fetching still goes throuh prisma
 */
import prisma from '$modules/database/prisma.server';
import type { Asset as AssetModel, Visibility, ContentType } from '$prisma-generated/client';
import { mkdir, rm } from 'fs/promises';
import { extname } from 'path';
import {
	normalizeMedia,
	regenerateThumbnails,
	deleteThumbnail,
	generateThumbnail,
	MEDIA_BASE_PATH,
	getDimensions,
	getMediaHash,
	getMediaType,
	moveFolderMedia
} from './service.server';
import type { Flatten, Override } from '$lib/utils/type-helpers';
import { STORED_FILE_TYPES } from './constants';

const editableFields = ['name', 'alt', 'credit', 'visibility'] as const;
const derivedFields = ['hash', 'type', 'width', 'height'] as const;
type editableData = Flatten<
	Override<Partial<Omit<AssetModel, (typeof derivedFields)[number] | 'id'>>, { name: string }>
>;
type derivedData = Flatten<Omit<AssetModel, (typeof editableFields)[number] | 'id'>>;

export class AssetProcessedBeforeCreation extends Error {
	constructor() {
		super('Tried to manipulate Asset without saving it first');
	}
}
export class AssetFileNotFound extends Error {
	constructor() {
		super('Failed to access Asset file data');
	}
}

export class AssetNotFoundError extends Error {
	constructor() {
		super('Asset not found');
	}
}

export class AssetAlreadyExistsError extends Error {
	constructor() {
		super('Asset with this name already exists');
	}
}
export class UnprocessableEntityError extends Error {
	constructor() {
		super('Failed to process media');
	}
}

async function syncMetadataFromDisk(name: string) {
	const path = await checkFileExistenceFor(name);
	const { width, height } = await getDimensions(path);
	const hash = await getMediaHash(path);
	const typeRaw = await getMediaType(path);
	const type = (typeRaw.toUpperCase() as ContentType) || 'IMAGE';

	return { width, height, hash, type };
}

export async function setAssetData(file: File, name: string) {
	try {
		await mkdir(`${MEDIA_BASE_PATH}/${name}`, { recursive: true });
	} catch (e) {
		throw new Error(`Failed to create directory for asset ${name} because of ${e}`, { cause: e });
	}
	const path = `${MEDIA_BASE_PATH}/${name}/${name + extname(file.name)}`;
	await Bun.write(path, file);
	const processedMediaPath = await normalizeMedia(path);
	if (!processedMediaPath) {
		throw new UnprocessableEntityError();
	}
	await regenerateThumbnails(processedMediaPath);
}
export async function dropAssetData(name: string) {
	await rm(`${MEDIA_BASE_PATH}/${name}`, { force: true, recursive: true });
}

export async function checkFileExistenceFor(name: string) {
	try {
		for (const mediaType of STORED_FILE_TYPES) {
			const possiblePath = `${MEDIA_BASE_PATH}/${name}/${name}.${mediaType}`;
			if (await Bun.file(possiblePath).exists()) {
				return possiblePath;
			}
		}
		throw new AssetFileNotFound();
	} catch {
		throw new AssetFileNotFound();
	}
}
//@ts-expect-error yes ts, i know
export class Asset implements Flatten<Override<AssetModel, { id?: string }>> {
	private editableData: editableData;
	private immutableData: derivedData = {} as derivedData;
	private pendingChanges: Partial<editableData> = {} as Partial<editableData>;
	public id?: string;

	private constructor(model: editableData | AssetModel) {
		// @ts-expect-error safe undefined check
		this.id = model.id;
		if (this.id) {
			this.immutableData = {
				width: (model as AssetModel).width,
				height: (model as AssetModel).height,
				type: (model as AssetModel).type,
				hash: (model as AssetModel).hash
			};
		}
		this.editableData = {
			name: model.name,
			alt: model.alt,
			credit: model.credit,
			visibility: model.visibility
		};

		return new Proxy(this, {
			get(target, p, receiver) {
				if (typeof p === 'string') {
					if (derivedFields.includes(p as (typeof derivedFields)[number])) {
						if (!(p in target.immutableData)) throw new AssetProcessedBeforeCreation();
						return target.immutableData[p as (typeof derivedFields)[number]];
					}
					if (editableFields.includes(p as (typeof editableFields)[number])) {
						return p in target.pendingChanges
							? target.pendingChanges[p as (typeof editableFields)[number]]
							: target.editableData[p as (typeof editableFields)[number]];
					}
				}
				return Reflect.get(target, p, receiver);
			},
			set(target, p, newValue, receiver) {
				if (
					typeof p === 'string' &&
					editableFields.includes(p as (typeof editableFields)[number])
				) {
					target.pendingChanges[p as (typeof editableFields)[number]] = newValue;
					return true;
				}
				return Reflect.set(target, p, newValue, receiver);
			}
		});
	}
	deconstruct() {
		return { ...this.immutableData, ...this.editableData, id: this.id };
	}
	async generateThumbnail(width: number, height: number) {
		const path = await checkFileExistenceFor(this.editableData.name);
		await generateThumbnail(path, width, height);
	}
	async removeThumbnail(width: number, height: number) {
		const path = await checkFileExistenceFor(this.editableData.name);
		await deleteThumbnail(path, width, height);
	}
	async save() {
		if (!this.id) {
			await this.create();
			return;
		}

		const newName = this.pendingChanges.name;
		if (newName && newName !== this.editableData.name) {
			await moveFolderMedia(
				`${MEDIA_BASE_PATH}/${this.editableData.name}`,
				`${MEDIA_BASE_PATH}/${newName}`
			);
		}

		const nameToUse = newName ?? (this.editableData.name as string);
		const metadata = await syncMetadataFromDisk(nameToUse);

		const data = {
			...this.pendingChanges,
			...metadata
		};

		const updatedModel = await prisma.asset.update({
			where: { id: this.id },
			data
		});

		this.updateInternalData(updatedModel);
	}
	private async create() {
		const metadata = await syncMetadataFromDisk(this.editableData.name as string);
		const data = {
			...this.editableData,
			...metadata
		};

		const createdModel = await prisma.asset.create({
			data
		});

		this.id = createdModel.id;
		this.updateInternalData(createdModel);
	}

	private updateInternalData(model: AssetModel) {
		this.editableData = {
			name: model.name,
			alt: model.alt,
			credit: model.credit,
			visibility: model.visibility
		};
		this.immutableData = {
			width: model.width,
			height: model.height,
			type: model.type,
			hash: model.hash
		};
		this.pendingChanges = {} as editableData;
	}

	static async new(data: {
		name: string;
		alt?: string | null;
		credit?: string | null;
		visibility?: Visibility;
	}): Promise<Asset> {
		if (await prisma.asset.findUnique({ where: { name: data.name } })) {
			throw new AssetAlreadyExistsError();
		}
		return new Asset(data) as Asset;
	}
	static async newFrom(params: { id?: string; name?: string; model?: AssetModel }): Promise<Asset> {
		if (params.model) return new Asset(params.model) as Asset;

		let assetModel: AssetModel | null = null;
		if (params.id) {
			assetModel = await prisma.asset.findUnique({ where: { id: params.id } });
		} else if (params.name) {
			assetModel = await prisma.asset.findUnique({ where: { id: params.name } });
		}

		if (!assetModel) throw new AssetNotFoundError();
		return new Asset(assetModel) as Asset;
	}
	async delete() {
		if (!this.id) throw new AssetProcessedBeforeCreation();
		await prisma.asset.delete({ where: { id: this.id } });
		await dropAssetData(this.editableData.name);
	}
}
