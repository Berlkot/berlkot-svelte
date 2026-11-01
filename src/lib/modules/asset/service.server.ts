// TODO: Subject for a full replacement
import { basename, dirname, parse } from 'path';
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
	return Bun.hash.crc32(await file.arrayBuffer()).toString(16);
}

export async function generateThumbnail(imagePath: string, width: number, height: number) {
	const parsedImagePath = parse(imagePath);
	const out_path = `${parsedImagePath.dir}/${width}_${height}_${parsedImagePath.name}.webp`;
	await Bun.$`magick "${imagePath}"[0] -resize "${width}x${height}^" -gravity center -crop "${width}x${height}+0+0" +repage -quality 80 -define webp:lossless=false "${out_path}"`;
}

export async function regenerateThumbnails(imagePath: string) {
	const name = parse(imagePath).name;
	const thumbnails = (await readdir(dirname(imagePath), { withFileTypes: true })).filter(
		(f) => f.isFile() && /^\d+_\d+_/.test(f.name) && f.name.endsWith(`_${name}.webp`)
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
// TODO: Consider JXL migration when it becomes baseline https://caniuse.com/jpegxl
// currently at around 60%
export async function normalizeMedia(mediaPath: string) {
	try {
		const parsedMediaPath = parse(mediaPath);
		// inplace may collide in case of webp and mp4
		const mediaSourcePath = `${parsedMediaPath.dir}/${parsedMediaPath.name}-source${parsedMediaPath.ext}`;
		await rename(mediaPath, mediaSourcePath);
		const mediaDestPath = `${parsedMediaPath.dir}/${parsedMediaPath.name}`;
		switch (await getMediaType(mediaSourcePath)) {
			case 'image': {
				const sharpStream = sharp(mediaSourcePath, { pages: -1 })
					/* INFO: it's fine doing resizing here because
            1. realistically there is no webasset that requires fidelity over 1600 by 1600 (yeah even comic page)
            2. storing source image on server is unrealistic in my scenario
            3. doing opposite will require to make a bypass function
               which will act differently from other pipeline for no straightforward reason
               which is confusing af */
					.resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
					.webp({ effort: 6, quality: 95, lossless: false });
				await sharpStream.toFile(`${mediaDestPath}.webp`);
				await unlink(mediaSourcePath);
				return `${mediaDestPath}.webp`;
			}
			case 'video': {
				await Bun.$`ffmpeg -v error -i "${mediaSourcePath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "${mediaDestPath}.mp4"`;
				await unlink(mediaSourcePath);
				return `${mediaDestPath}.mp4`;
			}
		}
	} catch (err) {
		console.log(err);
	}
}
