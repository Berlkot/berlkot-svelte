import { basename, extname, dirname } from 'path';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

export async function getDimensions(img_path: string) {
	const data = (await Bun.$`identify -format "%wx%h" ${img_path}[0]`.text()).split('x');
	return {
		width: Number(data[0]),
		height: Number(data[1])
	};
}

export async function generateThumbnail(
	img_path: string,
	save_path: string,
	width: number,
	height: number
) {
	const out_path = `${dirname(save_path)}/${width}_${height}_${basename(save_path)}`;
	await Bun.$`magick "${img_path}"[0] -resize "${width}x${height}^" -gravity center -crop "${width}x${height}+0+0" +repage "${out_path}"`;
}

export async function normalizeMedia(img_path: string) {
	try {
		const file = Bun.file(img_path);
		const [format, type] = file.type.split('/');
		const thingNoext = `${dirname(img_path)}/${basename(img_path, extname(img_path))}`;
		if (format === 'image') {
			if (type === 'webp') {
				return `${thingNoext}.webp`;
			}

			const sharpStream = sharp(img_path, { pages: -1 }).webp({ effort: 6, lossless: true });
			await sharpStream.toFile(`${thingNoext}.webp`);
			unlink(img_path);
			return `${thingNoext}.webp`;
		} else if (format === 'video') {
			if (type === 'mp4') {
				return `${thingNoext}.mp4`;
			}
			await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "${thingNoext}.mp4"`;
			unlink(img_path);
			return `${thingNoext}.mp4`;
		}
	} catch (err) {
		console.log(err);
	}
}
