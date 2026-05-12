import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { parseFeedbackInput } from './feedback.js';

describe('parseFeedbackInput', () => {
  const baseInput = {
    body: 'The outbreak map is missing region labels in the legend.',
    category: 'usability',
    subject: 'Outbreak map legend is hard to read'
  };

  it('accepts a minimal valid payload', () => {
    const parsed = parseFeedbackInput(baseInput);
    assert.equal(parsed.body, baseInput.body);
    assert.equal(parsed.category, 'usability');
    assert.equal(parsed.subject, baseInput.subject);
    assert.equal(parsed.contact_email, undefined);
  });

  it('trims surrounding whitespace from text fields', () => {
    const parsed = parseFeedbackInput({
      ...baseInput,
      body: '  body with padding  ',
      subject: '  padded subject  '
    });
    assert.equal(parsed.subject, 'padded subject');
    assert.equal(parsed.body, 'body with padding');
  });

  it('rejects blank subject', () => {
    assert.throws(() => parseFeedbackInput({ ...baseInput, subject: '   ' }));
  });

  it('rejects blank body', () => {
    assert.throws(() => parseFeedbackInput({ ...baseInput, body: '' }));
  });

  it('rejects unknown category values', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, category: 'praise' })
    );
  });

  it('rejects malformed contact email', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, contact_email: 'not-an-email' })
    );
  });

  it('rejects malformed page url', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, page_url: 'not a url' })
    );
  });

  it('accepts every documented category', () => {
    for (const category of [
      'bug',
      'content_request',
      'content_correction',
      'usability',
      'general'
    ] as const) {
      const parsed = parseFeedbackInput({ ...baseInput, category });
      assert.equal(parsed.category, category);
    }
  });

  it('caps body length at 5000 characters', () => {
    assert.throws(() =>
      parseFeedbackInput({ ...baseInput, body: 'x'.repeat(5001) })
    );
  });
});
