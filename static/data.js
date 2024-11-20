async function data() {
	const req = new Request('/api/data')
	const res = await fetch(req);
	const result = await res.text();
	document.querySelector('#result').innerText = result;
}

data()
