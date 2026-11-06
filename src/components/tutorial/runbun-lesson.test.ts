// Only the reader's own edits regrade: grading on the host's or the program's writes would mark checks against code the reader never wrote.
import { expect, test } from 'bun:test';
import { regrades } from './runbun-lesson';

const generated = { 'package.json': '{}' };

test("the reader's edits regrade, including from a runbun without `by`", () => {
	expect(regrades({ path: 'index.ts', by: 'reader' }, generated)).toBe(true);
	expect(regrades({ path: '/index.ts' }, generated)).toBe(true);
});

test("the host's and the program's writes don't", () => {
	expect(regrades({ path: 'index.ts', by: 'host' }, generated)).toBe(false);
	expect(regrades({ path: 'index.ts', by: 'program' }, generated)).toBe(false);
});

test('generated files and checks never regrade, even when the reader edits them', () => {
	expect(regrades({ path: './package.json', by: 'reader' }, generated)).toBe(false);
	expect(regrades({ path: '.tutorial/checks/auth.ts', by: 'reader' }, generated)).toBe(false);
});
