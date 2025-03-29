

/**
	* @returns {HTMLAnchorElement} element that redirects to the editor
*/
export function createEditorLink() {
	const elLink = document.createElement('a')
	elLink.classList.add('cell')
	elLink.classList.add('editorLink')
	elLink.innerText = 'Editor'
	elLink.title = 'Go to editor'
	elLink.addEventListener('click', () => redirect(`/u/${extractName()}/editor`))

	return elLink
}
