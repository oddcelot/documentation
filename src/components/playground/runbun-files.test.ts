import { expect, test } from 'bun:test';
import { extractRunBunFiles } from './runbun-files';

const line = (html: string) =>
	`<div class="ec-line"><div class="code">${html}</div></div>`;

// Expressive Code writes a bare newline inside the `.code` of a blank line.
const frame = (lines: string[], title?: string) =>
	`<figure class="frame${title ? ' has-title' : ''} not-content">` +
	`<figcaption class="header">${title ? `<span class="title">${title}</span>` : ''}</figcaption>` +
	`<pre><code>${lines.map(line).join('')}</code></pre></figure>`;

test('a single untitled fence runs as index.ts', () => {
	expect(extractRunBunFiles(frame(['const a = 1', '\n', 'console.log(a)']))).toEqual([
		{ path: 'index.ts', code: 'const a = 1\n\nconsole.log(a)' }
	]);
});

test('a fence title names the file, so several fences make several files', () => {
	expect(
		extractRunBunFiles(
			frame(['export const a = 1'], 'server.ts') +
				frame(["import { a } from './server'"], 'client.ts')
		)
	).toEqual([
		{ path: 'server.ts', code: 'export const a = 1' },
		{ path: 'client.ts', code: "import { a } from './server'" }
	]);
});

test('several untitled fences are ambiguous, because each needs a path', () => {
	expect(() => extractRunBunFiles(frame(['a']) + frame(['b']))).toThrow(
		'title on every code block'
	);
});

test('keeps the indentation Expressive Code renders as spans', () => {
	const html = frame([
		'<span class="indent"><span>    </span></span><span>.get(\'/\')</span>'
	]);

	expect(extractRunBunFiles(html)[0]?.code).toBe("    .get('/')");
});
