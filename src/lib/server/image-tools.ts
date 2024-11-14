import { basename, extname, dirname } from 'path';
import sharp from 'sharp';
import { unlink } from 'fs/promises';

// ill never use ffmpeg ever again

export async function getDimensions(img_path: string) {
	const metadata = await sharp(img_path).metadata();
	if (!metadata.width || !metadata.height) {
	  throw Error("Something bad happened")
	}
	return {
		width: metadata.width,
		height: metadata.height
	};
}

export async function generateThumbnail(img_path: string, save_path: string, width: number, height: number) {
	const image = await getDimensions(img_path)
	const out_path = `${dirname(save_path)}/${width}_${height}_${basename(save_path)}`;
	// im not sure if this faster than ffmpeg but sertanly easier to understand
	// and, ugh, i have skill issues with ffmpeg
	// also used to generate thumbnails for vieos
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
	await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=${fWidth}:${fHeight}:flags=lanczos,crop=${width}:${height}:${x}:${y},format=yuva420p" -frames:v 1 "${out_path}"`;
}

export async function normalizeMedia(img_path: string) {
	 try {
		const file = Bun.file(img_path);
		const [format, type] = file.type.split('/');
		const thingNoext = `${dirname(img_path)}/${basename(img_path, extname(img_path))}`;
		if (format === 'image') {
		  if (type === 'webp') {
		      return `${thingNoext}.webp`
				}
  
      const sharpStream = sharp(img_path, { pages: -1 }).webp({ effort: 6 });
			await sharpStream.toFile(`${thingNoext}.webp`);
			unlink(img_path)
			return `${thingNoext}.webp`
		} else if (format === 'video') {
			await Bun.$`ffmpeg -v error -i "${img_path}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart "${thingNoext}.mp4"`;
			return `${thingNoext}.mp4`
		}
	 } catch (err) {
	 	console.log(err)
	 }
}
