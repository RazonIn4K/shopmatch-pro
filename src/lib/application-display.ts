import { applicationStatuses } from '@/types'
import type { Application, ApplicationStatus } from '@/types'

export function displayText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

export function displayApplicationStatus(application: Application): ApplicationStatus {
  return applicationStatuses.includes(application.status as ApplicationStatus)
    ? application.status
    : 'pending'
}

export function displayApplicationJobTitle(application: Application): string {
  return displayText(application.jobTitle, 'Archived role')
}

export function displayApplicationCompany(application: Application): string {
  return displayText(application.company, 'Company unavailable')
}

export function displayApplicationSeekerName(application: Application): string {
  return displayText(application.seekerName, 'Anonymous applicant')
}

export function displayApplicationSeekerEmail(application: Application): string {
  return displayText(application.seekerEmail, 'Email unavailable')
}

export function displayApplicationJobSubtitle(application: Application): string {
  const company = displayApplicationCompany(application)
  const jobType = displayText(application.jobType, '')

  return jobType ? `${company} • ${jobType}` : company
}
