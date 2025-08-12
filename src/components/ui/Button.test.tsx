import { render, screen, fireEvent } from 'apos;@testing-library/react'apos;
import 'apos;@testing-library/jest-dom'apos;
import Button from 'apos;./Button'apos;

describe('apos;Button Component'apos;, () => {
  it('apos;renders with default props'apos;, () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('apos;button'apos;, { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('apos;bg-gradient-to-r'apos;, 'apos;from-purple-600'apos;, 'apos;to-blue-600'apos;)
  })

  it('apos;renders with different variants'apos;, () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;bg-gradient-to-r'apos;, 'apos;from-purple-600'apos;, 'apos;to-blue-600'apos;)

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;bg-gray-100'apos;)

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;border-2'apos;, 'apos;border-purple-600'apos;)

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;text-gray-700'apos;)

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;bg-red-600'apos;)

    rerender(<Button variant="success">Success</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;bg-green-600'apos;)
  })

  it('apos;renders with different sizes'apos;, () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;px-3'apos;, 'apos;py-1.5'apos;, 'apos;text-sm'apos;)

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;px-4'apos;, 'apos;py-2'apos;, 'apos;text-sm'apos;)

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;px-6'apos;, 'apos;py-3'apos;, 'apos;text-base'apos;)

    rerender(<Button size="xl">Extra Large</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;px-8'apos;, 'apos;py-4'apos;, 'apos;text-lg'apos;)
  })

  it('apos;handles click events'apos;, () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('apos;button'apos;))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('apos;can be disabled'apos;, () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('apos;button'apos;)
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('apos;renders with loading state'apos;, () => {
    render(<Button loading>Loading</Button>)
    const button = screen.getByRole('apos;button'apos;)
    expect(button).toBeDisabled()
    expect(button).toHaveClass('apos;disabled:opacity-50'apos;, 'apos;disabled:cursor-not-allowed'apos;)
  })

  it('apos;renders with icon'apos;, () => {
    render(<Button icon="plus">Add Item</Button>)
    const button = screen.getByRole('apos;button'apos;)
    expect(button).toHaveTextContent('apos;Add Item'apos;)
    // Note: Icon testing would require checking for SVG elements
  })

  it('apos;applies custom className'apos;, () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;custom-class'apos;)
  })

  it('apos;renders with full width'apos;, () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('apos;button'apos;)).toHaveClass('apos;w-full'apos;)
  })
})
