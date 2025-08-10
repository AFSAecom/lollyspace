import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';

function SampleComponent() {
  return <div>Hello Vitest</div>;
}

describe('SampleComponent', () => {
  it('renders greeting', () => {
    const html = renderToString(<SampleComponent />);
    expect(html).toContain('Hello Vitest');
  });
});
