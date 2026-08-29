/**
 * Self-check for the option-label regexes.
 * Run: npx tsx src/utils/questionProcessing.test.ts
 */
import assert from 'node:assert/strict';
import { cleanAnswerText, extractLetterPrefix, processQuestions } from './questionProcessing';

// Real answer text must survive untouched — this is the bug that shipped
// "Three NADH..." to the screen as "hree NADH...".
assert.equal(cleanAnswerText('Three NADH, one FADH2, and one GTP'), 'Three NADH, one FADH2, and one GTP');
assert.equal(cleanAnswerText('Six NADH, two FADH2, and two GTP'), 'Six NADH, two FADH2, and two GTP');
assert.equal(cleanAnswerText('A mitochondrion'), 'A mitochondrion');

// Genuine labels still get stripped.
assert.equal(cleanAnswerText('a) The Mariana Trench'), 'The Mariana Trench');
assert.equal(cleanAnswerText('B. Oxidative phosphorylation'), 'Oxidative phosphorylation');

// A leading word must not be mistaken for a label.
assert.equal(extractLetterPrefix('A mitochondrion produces ATP'), null);
assert.equal(extractLetterPrefix('Three NADH'), null);
assert.equal(extractLetterPrefix('c) Citrate'), 'C');

// End to end: the correct answer is matched by text, not by position.
const [q] = processQuestions([
  {
    question: 'How many NADH per turn?',
    question_type: 'multiple_choice',
    options: ['Three NADH', 'Six NADH', 'One NADH', 'Two NADH'],
    correct_answer: 'Three NADH',
    explanation: 'Each turn yields three NADH.',
  },
]);
assert.deepEqual(q.answers.map(a => a.text), ['Three NADH', 'Six NADH', 'One NADH', 'Two NADH']);
assert.equal(q.answers.filter(a => a.isCorrect).length, 1);
assert.equal(q.answers.find(a => a.isCorrect)!.text, 'Three NADH');

console.log('all passed');
