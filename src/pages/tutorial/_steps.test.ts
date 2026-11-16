// A check fails on the step before its own by an assertion (a crash proves nothing about the reader's code) and passes from its own step on.
import * as bun from 'bun:test';
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { chapters, findLesson } from '../../components/tutorial/lessons';

interface Check {
	slug: string;
	title: string;
	description: string;
	source: string;
	default: (app: unknown, bun: typeof import('bun:test')) => Promise<void>;
}

interface Step {
	slug: string;
	app: unknown;
	checks: Check[];
}

const pkg = await Bun.file(`${import.meta.dir}/../../../package.json`).json();
const versions: Record<string, string> = { ...pkg.devDependencies, ...pkg.dependencies };

const lessons: { id: string; root: string; dependencies: string[]; steps: Step[] }[] = [];
for (const relative of [...new Bun.Glob('**/_steps/index.ts').scanSync(import.meta.dir)].sort()) {
	const root = `${import.meta.dir}/${relative.replace(/index\.ts$/, '')}`;
	const id = relative.replace(/\/?_steps\/index\.ts$/, '') || 'index';
	const { default: order, dependencies = [] } = (await import(`${root}index.ts`)) as { default: string[]; dependencies?: string[] };
	// Checked before the steps import them, which would fail without naming the lesson.
	for (const name of dependencies) {
		if (!versions[name]) throw new Error(`${id} depends on ${name}, which package.json doesn't list`);
		try {
			Bun.resolveSync(name, root);
		} catch {
			throw new Error(`${id} depends on ${name}, which isn't installed: run bun install`);
		}
	}
	const steps: Step[] = [];
	for (const slug of order) {
		const checks: Check[] = [];
		for (const file of [...new Bun.Glob('checks/*.ts').scanSync(`${root}${slug}`)].sort())
			checks.push({
				slug: file.replace(/^checks\/|\.ts$/g, ''),
				source: await Bun.file(`${root}${slug}/${file}`).text(),
				...(await import(`${root}${slug}/${file}`))
			});
		steps.push({ slug, app: (await import(`${root}${slug}/index.ts`)).app, checks });
	}
	lessons.push({ id, root, dependencies, steps });
}

// Pinned, so a lesson whose `_steps` stop being found fails instead of passing vacuously.
const STEPPED = {
	'index': ['hello-elysia'],
	'getting-started/your-first-route': ['static-route', 'dynamic-route', 'optional-dynamic-route', 'wildcard-route'],
	'getting-started/handler-and-context': ['create-post', 'extract-body', 'extract-query', 'extract-headers'],
	'getting-started/status-and-headers': ['teapot', 'redirect', 'powered-by'],
	'getting-started/validation': ['body-schema'],
	'getting-started/life-cycle': ['authentication', 'interceptor'],
	'getting-started/guard': ['guard-hooks', 'guard-schema'],
	'getting-started/plugin': ['apply-plugin'],
	'getting-started/encapsulation': ['name-check', 'age-check'],
	'patterns/cookie': ['visit-cookie', 'http-only'],
	'patterns/error-handling': ['not-found', 'custom-error'],
	'patterns/validation-error': ['custom-message'],
	'patterns/extends-context': ['extract-age', 'use-age'],
	'patterns/standalone-schema': ['merge-schema'],
	'patterns/macro': ['body-schema', 'fibonacci'],
	'features/openapi': [],
	'features/mount': [],
	'features/unit-test': [],
	'features/end-to-end-type-safety': [],
	'whats-next': []
};

// Runs a check as the playground's generated test file does.
async function failure(check: Check, app: unknown) {
	try {
		await (app as { modules?: Promise<unknown> }).modules;
		await check.default(app, bun);
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('expect(')) return 'assertion';
		throw error;
	}
	return 'passed';
}

test('every lesson has steps', () => {
	const ids = chapters.flatMap((chapter) => chapter.lessons.flatMap(({ href }) => findLesson(href)?.id ?? []));
	expect(ids.filter((id) => !lessons.some((lesson) => lesson.id === id))).toEqual([]);
});

test('lessons with steps are pinned, with their checks in order', () => {
	expect(Object.fromEntries(lessons.map(({ id, steps }) => [id, steps.flatMap(({ checks }) => checks.map(({ slug }) => slug))]))).toEqual(STEPPED);
});

for (const { id, root, dependencies, steps } of lessons)
	describe(id, () => {
		test('every step exports an app and every check has a title and description', () => {
			for (const step of steps) {
				expect(step.app, step.slug).toBeDefined();
				for (const check of step.checks) {
					expect(typeof check.title, check.slug).toBe('string');
					expect(typeof check.description, check.slug).toBe('string');
					expect(typeof check.default, check.slug).toBe('function');
				}
			}
		});

		test('the first step is the starter: it introduces no checks', () => {
			expect(steps[0].checks).toEqual([]);
		});

		test('check slugs are unique', () => {
			const slugs = steps.flatMap(({ checks }) => checks.map(({ slug }) => slug));
			expect(new Set(slugs).size).toBe(slugs.length);
		});

		// The playground gets each check file alone, and the lesson page imports them outside of `bun test`.
		test('checks import nothing at runtime, and types only from bun:test and elysia', () => {
			const transpiler = new Bun.Transpiler({ loader: 'ts' });
			for (const check of steps.flatMap(({ checks }) => checks)) {
				expect(transpiler.scanImports(check.source), check.slug).toEqual([]);
				const specifiers = [...check.source.matchAll(/(?:\bfrom|\bimport\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
				expect(specifiers.filter((specifier) => specifier !== 'bun:test' && specifier !== 'elysia'), check.slug).toEqual([]);
			}
		});

		// The playground generates package.json from elysia and `dependencies`; builtins need no entry.
		test('steps import only elysia, bun and the declared dependencies, and have no package.json', () => {
			const transpiler = new Bun.Transpiler({ loader: 'ts' });
			const allowed = (specifier: string) =>
				specifier.startsWith('.') ||
				/^(bun|node):/.test(specifier) ||
				specifier === 'bun' ||
				['elysia', ...dependencies].some((name) => specifier === name || specifier.startsWith(`${name}/`));
			for (const { slug } of steps) {
				const files = [...new Bun.Glob('**/*').scanSync(`${root}${slug}`)].filter((file) => !file.startsWith('checks/'));
				expect(files, slug).not.toContain('package.json');
				for (const file of files.filter((file) => /\.[cm]?[jt]sx?$/.test(file))) {
					const imports = transpiler.scanImports(readFileSync(`${root}${slug}/${file}`, 'utf8'));
					expect(imports.map(({ path }) => path).filter((path) => !allowed(path)), `${slug}/${file}`).toEqual([]);
				}
			}
		});

		for (const [index, step] of steps.entries())
			for (const check of step.checks) {
				const previous = steps[index - 1];
				if (!previous) continue;
				test(`${check.slug} fails on ${previous.slug} by an assertion`, async () => {
					expect(await failure(check, previous.app)).toBe('assertion');
				});
			}

		// The playground skips grading a starter it has just loaded, so every check must already show unchecked there.
		test(`${steps[0].slug} passes none of the checks`, async () => {
			for (const check of steps.flatMap(({ checks }) => checks))
				expect(await failure(check, steps[0].app).catch(() => 'crashed'), check.slug).not.toBe('passed');
		});

		for (const [index, step] of steps.entries().drop(1))
			test(`${step.slug} passes every check introduced up to it`, async () => {
				for (const check of steps.slice(0, index + 1).flatMap(({ checks }) => checks))
					expect(await failure(check, step.app), check.slug).toBe('passed');
			});
	});
