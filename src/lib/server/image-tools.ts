import { $ } from 'bun';
import { basename, extname, dirname } from 'path';
import prisma from './prisma';

// if ffmpeg is slow for some reason
// export async function getDimensions(path: string): Promise<{ width: number; height: number }> {
// 	const metadata = await sharp(path).metadata();
// 	if (!metadata.width || !metadata.height) {
// 		throw Error('Image metadata not found for unexpected reason. Does image exist?');
// 	}
// 	return {
// 		width: metadata.width,
// 		height: metadata.height
// 	};
// }

export async function getDimensions(img_path: string) {
	const data = (
		await $`ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0:s=x ${img_path}`.text()
	).split('x');
	return {
		width: Number(data[0]),
		height: Number(data[1])
	};
}

export async function generateThumbnail(img_path: string, save_path: string, size: number) {
	const image = await prisma.asset.findUniqueOrThrow({
		where: { path: img_path },
		select: { id: true }
	});
	await $`ffmpeg -v error -i ${img_path} -vf "scale='if(gt(iw,ih),${size},-2)':'if(gt(ih,iw),${size},-2)':flags=lanczos" -frames:v 1 -c:v libaom-av1 -b:v 0 -strict experimental -pix_fmt yuv420p10le -f avif ${save_path}`;
	const dimensions = await getDimensions(img_path);
	await prisma.thumbnailImage.create({
		data: {
			path: save_path,
			width: dimensions.width,
			height: dimensions.height,
			asset: {
				connect: {
					id: image.id
				}
			}
		}
	});
}

// sharp cannot resize animated avifs...or videos, copium
export async function normalizeMedia(img_path: string) {
	try {
		const file = Bun.file(img_path);
		const [format, type] = file.type.split('/');
		const thingNoext = `${dirname(img_path)}/${basename(img_path, extname(img_path))}`;
		if (format === 'image') {
			if (type === 'avif') return;
			await $`ffmpeg -v error -i ${img_path} -vf -c:v libaom-av1 -b:v 0 -strict experimental -pix_fmt yuv420p10le -f avif ${thingNoext}.avif`;
		} else if (format === 'video') {
			await $`ffmpeg -v error -i ${img_path} -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart ${thingNoext}.mp4`;
		}
		const output = await $`ffmpeg`.text();
		console.log(output);
	} catch (err) {
		console.log(`Failed with code ${err.exitCode}`);
		console.log(err.stdout.toString());
		console.log(err.stderr.toString());
	}
}
