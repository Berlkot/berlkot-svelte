import sharp from 'sharp';


export async function getDimensions(path: string): Promise<{ width: number; height: number }> {
	const metadata = await sharp(path).metadata();
	if (!metadata.width || !metadata.height) {
		throw Error('Image metadata not found for unexpected reason. Does image exist?');
	}
	return {
		width: metadata.width,
		height: metadata.height
	};
}
export async function resize(img_path: string, width: number, height: number) {
	const sharpStream = sharp(img_path, { pages: -1 });
	sharpStream.resize(width, height, {
		fit: 'cover'
	});
	return sharpStream;
}
