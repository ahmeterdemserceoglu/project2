import { render, screen, fireEvent } from '@testing-library/react';
import Notification from '../Notification';

describe('Notification component', () => {
  it('renders the provided message', () => {
    render(<Notification message="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('closes when the button is clicked', () => {
    render(<Notification message="Close me" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Close me')).not.toBeInTheDocument();
  });
});
