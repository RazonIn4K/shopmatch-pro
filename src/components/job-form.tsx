"use client"

import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  JobFormValues,
  defaultJobFormValues,
  jobFormSchema,
  jobStatuses,
  jobTypes,
} from '@/types'

export interface JobFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<JobFormValues>
  onSubmit: (values: JobFormValues) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  className?: string
}

export function JobForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  className,
}: JobFormProps) {
  const form = useForm<JobFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      ...defaultJobFormValues,
      ...initialValues,
      requirements: initialValues?.requirements ?? defaultJobFormValues.requirements,
      skills: initialValues?.skills ?? defaultJobFormValues.skills,
      salary: initialValues?.salary,
    },
    mode: 'onSubmit',
  })

  React.useEffect(() => {
    if (initialValues) {
      form.reset({
        ...defaultJobFormValues,
        ...initialValues,
        requirements: initialValues.requirements ?? [],
        skills: initialValues.skills ?? [],
        salary: initialValues.salary,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues && JSON.stringify(initialValues)])

  const {
    fields: requirements,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: form.control,
    // @ts-expect-error - Known type compatibility issue between useFieldArray and Zod arrays of primitives
    name: 'requirements',
  })

  const {
    fields: skills,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    // @ts-expect-error - Known type compatibility issue between useFieldArray and Zod arrays of primitives
    name: 'skills',
  })

  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (values: JobFormValues) => {
    try {
      setSubmitting(true)
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('space-y-8', className)}
      >
        <section className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input placeholder="Senior Frontend Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="ShopMatch Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment type</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...field}
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience level</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                    {...field}
                  >
                    {['entry', 'mid', 'senior', 'lead'].map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Remote, New York, San Francisco..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remote"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-input"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  Remote friendly
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job description</FormLabel>
              <FormControl>
                <textarea
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Share responsibilities, expectations, and impact..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <section className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="salary.min"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="120000"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary.max"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="180000"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary.currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salary.period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compensation period</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                    {...field}
                  >
                    {['hourly', 'monthly', 'yearly'].map((period) => (
                      <option key={period} value={period}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Requirements</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => appendRequirement('')}
              >
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {requirements.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add bullet points to highlight must-have qualifications.
                </p>
              )}
              {requirements.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`requirements.${index}`}
                  render={({ field: requirementField }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g. 5+ years with React"
                          {...requirementField}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        Remove
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Key skills</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => appendSkill('')}>
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Surface a shortlist of tools, languages, or frameworks.
                </p>
              )}
              {skills.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`skills.${index}`}
                  render={({ field: skillField }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="e.g. TypeScript" {...skillField} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        Remove
                      </Button>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing status</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                  {...field}
                >
                  {jobStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel ?? (mode === 'create' ? 'Create job' : 'Save changes')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
