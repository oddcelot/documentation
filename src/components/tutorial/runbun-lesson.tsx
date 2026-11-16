import { useEffect, useRef, useState } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Button } from '../ui/button';
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

const generatedFiles = (dependencies: Record<string, string>, steps: Step[]) => {
	const generated: Record<string, string> = {
		'package.json': `${JSON.stringify({ dependencies }, null, 2)}\n`
	};
	for (const { slug, source } of steps.flatMap((step) => step.checks)) {
		generated[`.tutorial/checks/${slug}.ts`] = source;
		generated[`.tutorial/${slug}.test.ts`] = wrapper(slug);
	}
	return generated;
};

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// The embed reads its files back unescaped.
const file = (path: string, text: string, owned: boolean) =>
	`<script type="text/plain" data-file="${escape(path)}"${owned ? ' data-hidden data-generated' : ''}>${text.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--')}</script>`;

// Server-rendered, so embed.js boots it before hydration; React leaves the host's inner HTML alone after that.
const playground = (lesson: string, src: string, dependencies: Record<string, string>, steps: Step[]) => {
	const attributes = {
		src,
		load: 'eager',
		mode: 'full',
		features: 'types,-git,-run,-console',
		layout: 'stack',
		expand: 'false',
		autorun: 'true',
		persist: `elysia-tutorial:${lesson}`,
		title: 'Lesson playground'
	};
	return `<bun-playground ${Object.entries(attributes)
		.map(([name, value]) => `${name}="${escape(value)}"`)
		.join(' ')}>${[
		...Object.entries(steps[0].files).map(([path, text]) => file(path, text, false)),
		...Object.entries(generatedFiles(dependencies, steps)).map(([path, text]) => file(path, text, true))
	].join('')}</bun-playground>`;
};

export default function RunbunLesson({ lesson, src, dependencies, steps }: { lesson: string; src: string; dependencies: Record<string, string>; steps: Step[] }) {
	const host = useRef<HTMLDivElement>(null);
	const [unsupported, setUnsupported] = useState(false);
	const [confirming, setConfirming] = useState<((ok: boolean) => void) | null>(null);
	const confirmReplace = () => new Promise<boolean>((resolve) => setConfirming(() => resolve));
	const answer = (ok: boolean) => {
		confirming?.(ok);
		setConfirming(null);
	};
	// React 19 sets inner HTML again whenever this object isn't the same one, which would replace the running embed.
	const [html] = useState(() => ({ __html: playground(lesson, src, dependencies, steps) }));

	useEffect(() => {
		const checks = steps.flatMap((step) => step.checks);
		const tests = checks.map(({ slug }) => `.tutorial/${slug}.test.ts`);
		const generated = generatedFiles(dependencies, steps);
		tutorialStore.set({ testcasesResult: checks.map(() => false) });

		const box = host.current!;
		const el = box.querySelector('bun-playground') as Embed;
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
				if (!(path in generated) && path !== 'bun.lock' && !path.startsWith('.tutorial/')) project[path] = await el.readFile(path);
			return project;
		};

		const onUnsupported = () => {
			isUnsupported = true;
			setUnsupported(true);
		};
		// Host and program writes aren't the reader's code.
		const onChange = (event: Event) => {
			const { by, path } = (event as CustomEvent<{ by: string; path: string }>).detail;
			if (writing || by !== 'reader' || bare(path) === 'bun.lock') return;
			generation++;
			clearTimeout(timer);
			timer = setTimeout(grade, 800);
		};
		// Asks first unless the reader's code is still one of the lesson's snapshots.
		const useSolution = async ({ files }: Step) => {
			await el.ready;
			const project = await userFiles();
			if (!steps.some((step) => sameProject(project, step.files)) && !(await confirmReplace())) return;
			try {
				await write(async () => {
					for (const [path, text] of Object.entries(files)) await el.writeFile(path, text);
					for (const path of Object.keys(project))
						if (!(path in files))
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

		el.addEventListener('bun-playground:change', onChange);
		document.addEventListener('click', onClick);

		void (async () => {
			await customElements.whenDefined('bun-playground');
			await el.ready;
			// The embed can report before hydration; the page marks it then (lesson.astro).
			if (el.hasAttribute('data-unsupported')) onUnsupported();
			if (disposed || isUnsupported) return;
			// The starter passes no check (_steps.test.ts), so its tasks stay unchecked without a run.
			if (sameProject(await userFiles(), steps[0].files)) return;
			await grade();
		})();

		return () => {
			disposed = true;
			clearTimeout(timer);
			size.disconnect();
			document.removeEventListener('click', onClick);
			el.removeEventListener('bun-playground:change', onChange);
		};
	}, [lesson, src, dependencies, steps]);

	return (
		<div className="spica-surface flex h-full min-h-0 w-full flex-col text-ink">
			{unsupported && (
				<p role="status" className="m-0 px-4 py-2 text-sm text-ink-soft">
					This browser can't run the playground. Try a desktop Chrome, Edge or Firefox.
				</p>
			)}
			<div
				ref={host}
				className="tutorial-embed min-h-0 flex-1 overflow-hidden rounded-2xl border border-border-strong bg-base"
				dangerouslySetInnerHTML={html}
				suppressHydrationWarning
			/>
			<AlertDialog.Root open={!!confirming} onOpenChange={(open) => !open && answer(false)}>
				<AlertDialog.Portal>
					<AlertDialog.Backdrop className="fixed inset-0 bg-[color-mix(in_oklch,var(--color-night)_20%,transparent)] transition-opacity duration-(--dur-base) ease-out data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none" />
					<AlertDialog.Popup className="spica-surface fixed top-1/2 left-1/2 box-border w-[min(26rem,calc(100%_-_2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-solid border-border-strong bg-glass p-5 text-ink shadow-lg [backdrop-filter:var(--glass-blur-small)] transition-[opacity,scale] duration-(--dur-base) ease-out light:bg-surface/85 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0 motion-reduce:transition-none">
						<AlertDialog.Title className="m-0 font-display text-[1.375rem] leading-[1.15] font-normal">Replace your code?</AlertDialog.Title>
						<AlertDialog.Description className="mt-2 mb-0 text-sm leading-[1.65] text-ink-soft">
							The solution replaces what you wrote in this lesson. Your changes can't be brought back.
						</AlertDialog.Description>
						<div className="mt-5 flex justify-end gap-2">
							<AlertDialog.Close render={<Button variant="ghost" size="sm" />}>Keep my code</AlertDialog.Close>
							<Button size="sm" onClick={() => answer(true)}>Use solution</Button>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</div>
	);
}
