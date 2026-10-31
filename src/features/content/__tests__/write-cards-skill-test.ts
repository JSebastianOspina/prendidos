/// <reference types="node" />
// Node types for reading the skill file. They join the whole tsc program; see design §8.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validateCards } from '../validate-cards';
import { validCategories } from './fixtures/valid-catalog';

const skillPath = join(__dirname, '../../../../ai-specs/skills/write-cards/SKILL.md');

/** The JSON object in the skill's "## Output" section, exactly as the skill documents it. */
function readSkillOutputExample(): unknown {
  const skill = readFileSync(skillPath, 'utf8');
  const outputSection = skill.slice(skill.indexOf('## Output'));
  const match = outputSection.match(/```json\n([\s\S]*?)\n```/);
  if (match === null) throw new Error('The write-cards skill has no JSON output example.');
  return JSON.parse(match[1]);
}

describe('write-cards skill output', () => {
  it('passes validation as documented, authoring notes included', () => {
    const example = readSkillOutputExample();
    expect(validateCards({ categories: validCategories, cards: [example] })).toEqual([]);
  });
});
