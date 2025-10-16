
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { JobForm } from '../job-form';

it('should have no accessibility violations in the job form', async () => {
  const { container } = render(<JobForm mode="create" onSubmit={() => {}} />);

  // Find an element to ensure the component has rendered
  expect(screen.getByRole('button', { name: /Create job/i })).toBeInTheDocument();

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
