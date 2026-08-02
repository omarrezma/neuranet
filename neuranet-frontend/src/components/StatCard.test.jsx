import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from './StatCard'

describe('StatCard', () => {
  it('renders the title and value', () => {
    render(<StatCard title="Devices" value="42" />)

    expect(screen.getByText('Devices')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('falls back to a default icon/color for an unknown title', () => {
    // Should not throw even when the title isn't in StatCard's icon/color maps.
    render(<StatCard title="Something Unmapped" value="7" />)

    expect(screen.getByText('Something Unmapped')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
