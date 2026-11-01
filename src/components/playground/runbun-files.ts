import { fromHtml } from 'hast-util-from-html';
import { selectAll } from 'hast-util-select';
import { toString } from 'hast-util-to-string';

export interface RunBunFile {
	path: string;
	code: string;
}

/**
 * Read the files out of the Expressive Code output rendered from the
 * component's slot. Each fenced block is one file; the fence title is the path.
 */
export function extractRunBunFiles(
	html: string,
	fallbackPath = 'index.ts'
): RunBunFile[] {
	const tree = fromHtml(html, { fragment: true });
	const figures = selectAll('figure.frame', tree);
	const files: RunBunFile[] = [];

	for (const figure of figures) {
		const title = selectAll('figcaption .title', figure)[0];
		const path = title
			? toString(title).trim()
			: figures.length === 1
				? fallbackPath
				: '';

		if (!path) {
			throw new Error(
				'RunBunPlayground needs a title on every code block when there is more than one file.'
			);
		}

		const lines = selectAll('.ec-line .code', figure);
		const code = lines.length
			? lines
					.map((line) => toString(line).replace(/\n$/, ''))
					.join('\n')
			: toString(selectAll('pre code', figure)[0] ?? figure).trim();

		files.push({ path, code });
	}

	if (!files.length) {
		const code = toString(tree).trim();

		if (!code) {
			throw new Error('RunBunPlayground needs a code block.');
		}

		files.push({ path: fallbackPath, code });
	}

	return files;
}
