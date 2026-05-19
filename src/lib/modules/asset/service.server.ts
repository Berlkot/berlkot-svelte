import { basename, parse } from 'path';
import sharp from 'sharp';
import { unlink, readdir, rename, rm } from 'fs/promises';

export const MEDIA_BASE_PATH = 'data/assets';

export async function getDimensions(imgPath: string) {
	const data = (await Bun.$`identify -format "%wx%h" ${imgPath}[0]`.text()).split('x');
	return {
		width: Number(data[0]),
		height: Number(data[1])
	};
}
export async function getMediaHash(imgPath: string) {
	const file = Bun.file(imgPath);
	const hasher = new Bun.CryptoHasher('sha256');
	hasher.update(file);
	return hasher.digest('base64');
}

export async function generateThumbnail(imagePath: string, width: number, height: number) {
	const parsedImagePath = parse(imagePath);
	const out_path = `${parsedImagePath.dir}/${width}_${height}_${parsedImagePath.name}.webp`;
	await Bun.$`magick "${imagePath}"[0] -resize "${width}x${height}^" -gravity center -crop "${width}x${height}+0+0" +repage "${out_path}"`;
}

export async function regenerateThumbnails(imagePath: string) {
	const name = parse(imagePath).name;
	const thumbnails = (await readdir(imagePath, { withFileTypes: true })).filter(
		(f) => f.name !== `${name}.webp` && f.name !== `${name}.mp4`
	);
	for (const thumbnail of thumbnails) {
		await generateThumbnail(
			imagePath,
			parseInt(thumbnail.name.split('_')[0]),
			parseInt(thumbnail.name.split('_')[1])
		);
	}
}
export async function deleteThumbnail(imagePath: string, width: number, height: number) {
	const parsedImagePath = parse(imagePath);
	await rm(`${parsedImagePath.dir}/${width}_${height}_${parsedImagePath.name}.webp`, {
		force: true
	});
}
export async function moveFolderMedia(srcPath: string, destPath: string) {
	const prevName = basename(srcPath);
	const newName = basename(destPath);
	await rename(srcPath, destPath);
	await Promise.all(
		(await readdir(destPath, { withFileTypes: true })).map(async (f) => {
			await rename(`${destPath}/${f.name}`, `${destPath}/${f.name.replace(prevName, newName)}`);
		})
	);
}

export async function getMediaType(mediaPath: string) {
	const file = Bun.file(mediaPath);
	const [format] = file.type.split('/');
	return format;
}

export async function normalizeMedia(mediaPath: string) {
	try {
		const parsedMediaPath = parse(mediaPath);
		const mediaPathNoExt = `${parsedMediaPath.dir}/${parsedMediaPath.name}`;
		switch (await getMediaType(mediaPath)) {
			case 'image': {
				const sharpStream = sharp(mediaPath, { pages: -1 })
					.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
					.webp({ effort: 6, lossless: true });
				await sharpStream.toFile(`${mediaPathNoExt}.webp`);
				unlink(mediaPath);
				return `${mediaPathNoExt}.webp`;
			}
			case 'video': {
				await Bun.$`ffmpeg -v error -i "${mediaPath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "${mediaPathNoExt}.mp4"`;
				unlink(mediaPath);
				return `${mediaPathNoExt}.mp4`;
			}
		}
	} catch (err) {
		console.log(err);
	}
}
