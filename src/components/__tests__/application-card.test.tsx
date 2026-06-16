import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { ApplicationCard } from '../application-card'
import type { Application } from '@/types'

const baseApplication = {
  id: 'app_1',
  jobId: 'job_1',
  seekerId: 'seeker_1',
  ownerId: 'owner_1',
  coverLetter: 'I am interested in this role.',
  status: 'accepted',
  createdAt: '2026-06-16T12:00:00.000Z',
  updatedAt: '2026-06-16T12:00:00.000Z',
} as unknown as Application

describe('ApplicationCard', () => {
  it('renders seeker fallback text for legacy applications without job snapshots', () => {
    render(<ApplicationCard application={baseApplication} mode="seeker" />)

    expect(screen.getByText('Archived role')).toBeInTheDocument()
    expect(screen.getByText('Company unavailable')).toBeInTheDocument()
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument()
  })

  it('renders owner fallback text for legacy applications without applicant snapshots', () => {
    render(<ApplicationCard application={baseApplication} mode="owner" />)

    expect(screen.getByText('Anonymous applicant')).toBeInTheDocument()
    expect(screen.getByText('Email unavailable')).toBeInTheDocument()
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument()
  })
})
