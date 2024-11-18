async function data() {
	const req = new Request('/api/data', { headers: { 'Content-Type': 'application/json' } })
	const res = await fetch(req);
}
