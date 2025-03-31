import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';
const { expect, describe, it } = require('@jest/globals');

test('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeInTheDocument();
});
