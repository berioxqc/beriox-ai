import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, createMockUser } from '@/lib/testing/test-utils';
import { DesignSystem } from '../DesignSystem';

describe('DesignSystem', () => {
  describe('Typography', () => {
    it('renders h1 correctly', () => {
      render(<DesignSystem.Typography.h1>Test Heading</DesignSystem.Typography.h1>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Heading');
    });

    it('renders h2 correctly', () => {
      render(<DesignSystem.Typography.h2>Test Heading</DesignSystem.Typography.h2>);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Heading');
    });

    it('renders paragraph correctly', () => {
      render(<DesignSystem.Typography.p>Test paragraph</DesignSystem.Typography.p>);
      expect(screen.getByText('Test paragraph')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <DesignSystem.Typography.h1 className="custom-class">
          Test Heading
        </DesignSystem.Typography.h1>
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveClass('custom-class');
    });
  });

  describe('Button', () => {
    it('renders button with text', () => {
      render(<DesignSystem.Button>Click me</DesignSystem.Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<DesignSystem.Button onClick={handleClick}>Click me</DesignSystem.Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
      render(<DesignSystem.Button loading>Loading</DesignSystem.Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading');
    });

    it('renders with icon', () => {
      render(<DesignSystem.Button icon="🚀">Launch</DesignSystem.Button>);
      
      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('applies different variants', () => {
      const { rerender } = render(<DesignSystem.Button variant="primary">Primary</DesignSystem.Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-purple-600');

      rerender(<DesignSystem.Button variant="secondary">Secondary</DesignSystem.Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

      rerender(<DesignSystem.Button variant="danger">Danger</DesignSystem.Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');
    });

    it('applies different sizes', () => {
      const { rerender } = render(<DesignSystem.Button size="sm">Small</DesignSystem.Button>);
      expect(screen.getByRole('button')).toHaveClass('px-3');

      rerender(<DesignSystem.Button size="lg">Large</DesignSystem.Button>);
      expect(screen.getByRole('button')).toHaveClass('px-6');
    });
  });

  describe('Card', () => {
    it('renders card with content', () => {
      render(
        <DesignSystem.Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </DesignSystem.Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies different variants', () => {
      const { rerender } = render(<DesignSystem.Card variant="default">Content</DesignSystem.Card>);
      expect(screen.getByText('Content').parentElement).toHaveClass('bg-white');

      rerender(<DesignSystem.Card variant="elevated">Content</DesignSystem.Card>);
      expect(screen.getByText('Content').parentElement).toHaveClass('shadow-lg');

      rerender(<DesignSystem.Card variant="outlined">Content</DesignSystem.Card>);
      expect(screen.getByText('Content').parentElement).toHaveClass('border-2');
    });

    it('applies different padding sizes', () => {
      const { rerender } = render(<DesignSystem.Card padding="sm">Content</DesignSystem.Card>);
      expect(screen.getByText('Content').parentElement).toHaveClass('p-4');

      rerender(<DesignSystem.Card padding="lg">Content</DesignSystem.Card>);
      expect(screen.getByText('Content').parentElement).toHaveClass('p-8');
    });
  });

  describe('Badge', () => {
    it('renders badge with text', () => {
      render(<DesignSystem.Badge>New</DesignSystem.Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies different variants', () => {
      const { rerender } = render(<DesignSystem.Badge variant="default">Default</DesignSystem.Badge>);
      expect(screen.getByText('Default')).toHaveClass('bg-gray-100');

      rerender(<DesignSystem.Badge variant="success">Success</DesignSystem.Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-green-100');

      rerender(<DesignSystem.Badge variant="danger">Danger</DesignSystem.Badge>);
      expect(screen.getByText('Danger')).toHaveClass('bg-red-100');
    });

    it('applies different sizes', () => {
      const { rerender } = render(<DesignSystem.Badge size="sm">Small</DesignSystem.Badge>);
      expect(screen.getByText('Small')).toHaveClass('text-xs');

      rerender(<DesignSystem.Badge size="md">Medium</DesignSystem.Badge>);
      expect(screen.getByText('Medium')).toHaveClass('text-sm');
    });
  });

  describe('Alert', () => {
    it('renders alert with message', () => {
      render(<DesignSystem.Alert>This is an alert</DesignSystem.Alert>);
      expect(screen.getByText('This is an alert')).toBeInTheDocument();
    });

    it('renders alert with title', () => {
      render(<DesignSystem.Alert title="Alert Title">Alert message</DesignSystem.Alert>);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('applies different variants', () => {
      const { rerender } = render(<DesignSystem.Alert variant="info">Info</DesignSystem.Alert>);
      expect(screen.getByText('Info').parentElement?.parentElement).toHaveClass('bg-blue-50');

      rerender(<DesignSystem.Alert variant="success">Success</DesignSystem.Alert>);
      expect(screen.getByText('Success').parentElement?.parentElement).toHaveClass('bg-green-50');

      rerender(<DesignSystem.Alert variant="warning">Warning</DesignSystem.Alert>);
      expect(screen.getByText('Warning').parentElement?.parentElement).toHaveClass('bg-yellow-50');

      rerender(<DesignSystem.Alert variant="danger">Danger</DesignSystem.Alert>);
      expect(screen.getByText('Danger').parentElement?.parentElement).toHaveClass('bg-red-50');
    });

    it('handles close button', () => {
      const onClose = jest.fn();
      render(<DesignSystem.Alert onClose={onClose}>Alert</DesignSystem.Alert>);
      
      fireEvent.click(screen.getByText('×'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input', () => {
    it('renders input with label', () => {
      render(<DesignSystem.Input label="Email" name="email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders input with helper text', () => {
      render(<DesignSystem.Input helperText="Enter your email" name="email" />);
      expect(screen.getByText('Enter your email')).toBeInTheDocument();
    });

    it('renders input with error', () => {
      render(<DesignSystem.Input error="Email is required" name="email" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('renders input with left icon', () => {
      render(<DesignSystem.Input leftIcon="📧" name="email" />);
      expect(screen.getByText('📧')).toBeInTheDocument();
    });

    it('renders input with right icon', () => {
      render(<DesignSystem.Input rightIcon="🔍" name="search" />);
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      render(<DesignSystem.Input name="email" />);
      const input = screen.getByRole('textbox');
      
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      expect(input).toHaveValue('test@example.com');
    });
  });

  describe('Textarea', () => {
    it('renders textarea with label', () => {
      render(<DesignSystem.Textarea label="Description" name="description" />);
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('renders textarea with helper text', () => {
      render(<DesignSystem.Textarea helperText="Enter your description" name="description" />);
      expect(screen.getByText('Enter your description')).toBeInTheDocument();
    });

    it('renders textarea with error', () => {
      render(<DesignSystem.Textarea error="Description is required" name="description" />);
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      render(<DesignSystem.Textarea name="description" />);
      const textarea = screen.getByRole('textbox');
      
      fireEvent.change(textarea, { target: { value: 'Test description' } });
      expect(textarea).toHaveValue('Test description');
    });
  });

  describe('Select', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true },
    ];

    it('renders select with label', () => {
      render(<DesignSystem.Select label="Choose option" options={options} />);
      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });

    it('renders all options', () => {
      render(<DesignSystem.Select options={options} />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      render(<DesignSystem.Select options={options} />);
      const select = screen.getByRole('combobox');
      
      fireEvent.change(select, { target: { value: 'option2' } });
      expect(select).toHaveValue('option2');
    });
  });

  describe('Modal', () => {
    it('renders modal when open', () => {
      render(
        <DesignSystem.Modal isOpen={true} onClose={jest.fn()}>
          <p>Modal content</p>
        </DesignSystem.Modal>
      );
      
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal when closed', () => {
      render(
        <DesignSystem.Modal isOpen={false} onClose={jest.fn()}>
          <p>Modal content</p>
        </DesignSystem.Modal>
      );
      
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders modal with title', () => {
      render(
        <DesignSystem.Modal isOpen={true} onClose={jest.fn()} title="Modal Title">
          <p>Modal content</p>
        </DesignSystem.Modal>
      );
      
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('handles close button click', () => {
      const onClose = jest.fn();
      render(
        <DesignSystem.Modal isOpen={true} onClose={onClose} title="Modal Title">
          <p>Modal content</p>
        </DesignSystem.Modal>
      );
      
      fireEvent.click(screen.getByText('×'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles backdrop click', () => {
      const onClose = jest.fn();
      render(
        <DesignSystem.Modal isOpen={true} onClose={onClose}>
          <p>Modal content</p>
        </DesignSystem.Modal>
      );
      
      // Click on backdrop (first div with bg-black)
      const backdrop = document.querySelector('.bg-black');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip on hover', async () => {
      render(
        <DesignSystem.Tooltip content="Tooltip text">
          <button>Hover me</button>
        </DesignSystem.Tooltip>
      );
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <DesignSystem.Tooltip content="Tooltip text">
          <button>Hover me</button>
        </DesignSystem.Tooltip>
      );
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Tooltip text')).toBeInTheDocument();
      });
      
      fireEvent.mouseLeave(button);
      
      await waitFor(() => {
        expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
      });
    });
  });

  describe('Skeleton', () => {
    it('renders single skeleton', () => {
      render(<DesignSystem.Skeleton className="h-4 w-20" />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders multiple skeleton lines', () => {
      render(<DesignSystem.Skeleton lines={3} />);
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('Divider', () => {
    it('renders simple divider', () => {
      render(<DesignSystem.Divider />);
      const divider = document.querySelector('hr');
      expect(divider).toBeInTheDocument();
    });

    it('renders divider with text', () => {
      render(<DesignSystem.Divider text="Or" />);
      expect(screen.getByText('Or')).toBeInTheDocument();
    });
  });
});
