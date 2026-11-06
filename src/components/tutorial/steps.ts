import pkg from '../../../package.json';

export interface Check {
	slug: string;
	title: string;
	description: string;
	source: string;
}

export interface Step {
	slug: string;
	/** The full project at this step, without `checks/`. */
	files: Record<string, string>;
	/** The checks this step introduces. */
	checks: Check[];
}

const orders = import.meta.glob<{ default: string[]; dependencies?: string[] }>('/src/pages/tutorial/**/_steps/index.ts', { eager: true });
const sources = import.meta.glob<string>('/src/pages/tutorial/**/_steps/*/**/*', { eager: true, query: '?raw', import: 'default' });
const metadata = import.meta.glob<{ title: string; description: string }>('/src/pages/tutorial/**/_steps/*/checks/*.ts', { eager: true });

const lessonRoot = (lesson: string) => `/src/pages/tutorial/${lesson === 'index' ? '' : `${lesson}/`}_steps/`;

export function lessonSteps(lesson: string): Step[] | undefined {
	const root = lessonRoot(lesson);
	const order = orders[`${root}index.ts`]?.default;
	if (!order) return;
	return order.map((slug) => {
		const dir = `${root}${slug}/`;
		const step: Step = { slug, files: {}, checks: [] };
		for (const [path, source] of Object.entries(sources)) {
			if (!path.startsWith(dir)) continue;
			const name = path.slice(dir.length);
			const check = /^checks\/([^/]+)\.ts$/.exec(name);
			if (check) {
				const { title, description } = metadata[path];
				step.checks.push({ slug: check[1], title, description, source });
			} else if (!name.startsWith('checks/')) step.files[name] = source;
		}
		if (!step.files['index.ts']) throw new Error(`${dir} has no index.ts`);
		return step;
	});
}

/** elysia and the lesson's `dependencies`, at the docs' versions. */
export function lessonDependencies(lesson: string): Record<string, string> {
	const versions: Record<string, string> = { ...pkg.devDependencies, ...pkg.dependencies };
	const dependencies: Record<string, string> = { elysia: versions.elysia };
	for (const name of orders[`${lessonRoot(lesson)}index.ts`]?.dependencies ?? []) {
		if (!versions[name]) throw new Error(`${lesson} depends on ${name}, which package.json doesn't list`);
		dependencies[name] = versions[name];
	}
	return dependencies;
}
