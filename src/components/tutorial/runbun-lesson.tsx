import { useEffect, useRef, useState } from 'react';
import type { Step } from './steps';
import { tutorialStore } from './store';

interface Embed extends HTMLElement {
	ready: Promise<void>;
	test(files?: string[]): Promise<{ failed: number; results: { file: string; failed: number }[] }>;
	readFile(path: string): Promise<string>;
	writeFile(path: string, text: string): Promise<void>;
	listFiles(): Promise<string[]>;
	openFile(path: string): Promise<void>;
	removeFile(path: string): Promise<void>;
}

const bare = (path: string) => path.replace(/^\.?\//, '');
// Inline files lose their trailing newline.
const same = (a: string, b: string) => a.trimEnd() === b.trimEnd();
const sameProject = (project: Record<string, string>, files: Record<string, string>) =>
	Object.keys(project).length === Object.keys(files).length &&
	Object.entries(files).every(([path, text]) => project[path] !== undefined && same(project[path], text));

const wrapper = (slug: string) => `import * as bun from 'bun:test'
import check from './checks/${slug}'
import { app } from '../index'

bun.test(${JSON.stringify(slug)}, async () => {
	await app.modules
	await check(app, bun)
})
`;

export default function RunbunLesson({ lesson, src, dependencies, steps }: { lesson: string; src: string; dependencies: Record<string, string>; steps: Step[] }) {
	const host = useRef<HTMLDivElement>(null);
	const [unsupported, setUnsupported] = useState(false);

	useEffect(() => {
		const checks = steps.flatMap((step) => step.checks);
		const tests = checks.map(({ slug }) => `.tutorial/${slug}.test.ts`);
		const generated: Record<string, string> = {
			'package.json': `${JSON.stringify({ dependencies }, null, 2)}\n`
		};
		for (const { slug, source } of checks) {
			generated[`.tutorial/checks/${slug}.ts`] = source;
			generated[`.tutorial/${slug}.test.ts`] = wrapper(slug);
		}
		tutorialStore.set({ testcasesResult: checks.map(() => false) });

		const el = document.createElement('bun-playground') as Embed;
		const attributes = {
			src,
			load: 'eager',
			mode: 'full',
			features: 'types,-git',
			layout: 'stack',
			expand: 'false',
			autorun: 'true',
			persist: `elysia-tutorial:${lesson}`,
			title: 'Lesson playground'
		};
		for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
		const file = (path: string, text: string, owned: boolean) => {
			const script = document.createElement('script');
			script.type = 'text/plain';
			script.dataset.file = path;
			if (owned) script.dataset.hidden = script.dataset.generated = '';
			script.textContent = text;
			return script;
		};
		el.append(
			...Object.entries(steps[0].files).map(([path, text]) => file(path, text, false)),
			...Object.entries(generated).map(([path, text]) => file(path, text, true))
		);
		const box = host.current!;
		box.append(el);
		// A percentage height resolves against the element's own auto-height dialog.
		const size = new ResizeObserver(() => el.setAttribute('height', `${box.clientHeight}px`));
		size.observe(box);

		let disposed = false;
		let isUnsupported = false;
		let running = false;
		let again = false;
		let generation = 0;
		let writing = 0;
		let timer: ReturnType<typeof setTimeout> | undefined;

		const write = async (work: () => Promise<void>) => {
			writing++;
			try {
				await work();
			} finally {
				writing--;
				generation++;
			}
		};

		const runChecks = async (): Promise<boolean[]> => {
			const { results } = await el.test(tests);
			const failed = new Map(results.map((result) => [bare(result.file), result.failed]));
			return tests.map((test) => failed.get(test) === 0);
		};

		// Never overlaps test() calls. A run stores nothing if the files changed since it started; that change has queued another grade.
		const grade = async () => {
			if (disposed || isUnsupported || !tests.length) return;
			if (running) {
				again = true;
				return;
			}
			running = true;
			try {
				do {
					again = false;
					const started = generation;
					let results: boolean[];
					try {
						results = await runChecks();
					} catch (error) {
						console.error(error);
						results = tests.map(() => false);
					}
					if (generation === started && !disposed) tutorialStore.set({ testcasesResult: results });
				} while (again && !disposed);
			} finally {
				running = false;
			}
		};

		const userFiles = async () => {
			const project: Record<string, string> = {};
			for (const path of (await el.listFiles()).map(bare))
				if (!(path in generated) && !path.startsWith('.tutorial/')) project[path] = await el.readFile(path);
			return project;
		};

		const onUnsupported = () => {
			isUnsupported = true;
			setUnsupported(true);
		};
		// Host and program writes aren't the reader's code.
		const onChange = (event: Event) => {
			if (writing || (event as CustomEvent<{ by: string }>).detail.by !== 'reader') return;
			generation++;
			clearTimeout(timer);
			timer = setTimeout(grade, 800);
		};
		const useSolution = async (step: Step) => {
			await el.ready;
			const project = await userFiles();
			if (!steps.some(({ files }) => sameProject(project, files)) && !confirm('Replace your code with this solution? Your changes will be lost.')) return;
			try {
				await write(async () => {
					for (const [path, text] of Object.entries(step.files)) await el.writeFile(path, text);
					for (const path of Object.keys(project))
						if (!(path in step.files))
							try {
								await el.removeFile(path);
							} catch (error) {
								console.error(error);
							}
				});
			} finally {
				await el.openFile('index.ts').catch(console.error);
				await grade();
			}
		};
		const onClick = (event: MouseEvent) => {
			const button = (event.target as Element | null)?.closest?.('[data-tutorial-solution]');
			const step = button && steps.find(({ slug }) => slug === button.getAttribute('data-tutorial-solution'));
			if (!step || isUnsupported) return;
			useSolution(step).catch(console.error);
		};

		el.addEventListener('bun-playground:unsupported', onUnsupported);
		el.addEventListener('bun-playground:change', onChange);
		document.addEventListener('click', onClick);

		void (async () => {
			await customElements.whenDefined('bun-playground');
			await el.ready;
			if (disposed || isUnsupported) return;
			await grade();
		})();

		return () => {
			disposed = true;
			clearTimeout(timer);
			size.disconnect();
			document.removeEventListener('click', onClick);
			el.remove();
		};
	}, [lesson, src, dependencies, steps]);

	return (
		<div className="spica-surface flex h-full min-h-0 w-full flex-col text-ink">
			{unsupported && (
				<p role="status" className="m-0 px-4 py-2 text-sm text-ink-soft">
					This browser can't run the playground. Try a desktop Chrome, Edge or Firefox.
				</p>
			)}
			<div ref={host} className="tutorial-embed min-h-0 flex-1 overflow-hidden rounded-2xl border border-border-strong bg-base" />
		</div>
	);
}
