export async function searchTags(keyword: string) {
	const url = '/api/autocomplete/asset/tags';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ text: keyword })
	});
	const data = await response.json();
	return data;
}

export async function searchFolders(keyword: string) {
	const url = '/api/autocomplete/asset/folders';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ text: keyword })
	});
	const data = await response.json();
	return data;
}
