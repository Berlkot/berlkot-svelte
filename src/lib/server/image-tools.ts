import { basename, extname, dirname } from 'path';
import prisma from './prisma';

// ill never use ffmpeg ever again

export async function getDimensions(img_path: string) {
	const data = (
		await Bun.$`ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0:s=x ${img_path}`.text()
	).split('x');
	return {
		width: Number(data[0]),
		height: Number(data[1])
	};
}

export async function generateThumbnail(img_path: string, save_path: string, width: number, height: number) {
	const image = await prisma.asset.findUniqueOrThrow({
		where: { path: img_path },
		select: { id: true, width: true, height: true }
	});
	const out_path = `${dirname(save_path)}/${width}_${height}_${basename(save_path)}`;
	// im not sure if this faster than ffmpeg but sertanly easier to understand
	// and, ugh, i have skill issues with ffmpeg
	const imgRatio = image.height / image.width;
  const boxRatio = height / width;
  let fHeight: number
  let fWidth: number
    if (boxRatio > imgRatio) {
        fHeight = height;
        const scale = fHeight / image.height;
        fWidth = Math.round(image.width * scale);
    } else {
        fWidth = width;
        const scale = fWidth / image.width;
        fHeight = Math.round(image.height * scale);
    }
  const x = Math.round((fWidth - width) / 2)
  const y = Math.round((fHeight - height) / 2)
	await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=${fWidth}:${fHeight}:flags=lanczos,crop=${width}:${height}:${x}:${y},format=yuva420p10be" -frames:v 1 -c:v libsvtav1 -b:v 0 -strict experimental -pix_fmt yuva420p10be -f avif "${out_path}"`;
	const dimensions = await getDimensions(out_path);
	await prisma.thumbnailImage.create({
		data: {
			path: out_path,
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

export async function normalizeMedia(img_path: string) {
	 try {
		const file = Bun.file(img_path);
		const [format, type] = file.type.split('/');
		const thingNoext = `${dirname(img_path)}/${basename(img_path, extname(img_path))}`;
		if (format === 'image') {
			if (type === 'avif') return;
			await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2:,format=yuva420p10be" -c:v libsvtav1 -b:v 0 -strict experimental -crf 16 -pix_fmt yuva420p10be -f avif "${thingNoext}.avif"`;
			return `${thingNoext}.avif`
		} else if (format === 'video') {
			await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "${thingNoext}.mp4"`;
			return `${thingNoext}.mp4`
		}
	 } catch (err) {
	 	console.log(`Failed with code ${err.exitCode}`);
	 	console.log(err.stderr.toString());
	 }
}
