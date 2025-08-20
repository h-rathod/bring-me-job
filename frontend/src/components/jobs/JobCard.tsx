import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import React from 'react'
import api from '@/lib/api'

export interface JobItem {
  id: string
  title: string
  company: string
  description: string
  location?: string | null
  url?: string | null
  similarity?: number
  createdAt?: string
}

export function JobCard({ job }: { job: JobItem }) {
  const [open, setOpen] = React.useState(false)
  const [gap, setGap] = React.useState<{
    score: number
    matchingSkills: string[]
    missingSkills: string[]
    learningResources: { skill: string; title: string; url: string }[]
  } | null>(null)
  const [loadingGap, setLoadingGap] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    async function fetchGap() {
      try {
        setLoadingGap(true)
        const { data } = await api.get(`/api/jobs/${job.id}/skill-gap`)
        if (mounted) setGap(data)
      } catch (_) {
        if (mounted) setGap(null)
      } finally {
        if (mounted) setLoadingGap(false)
      }
    }
    fetchGap()
    return () => {
      mounted = false
    }
  }, [job.id])

  function scoreColor(score?: number) {
    if (typeof score !== 'number') return 'secondary'
    if (score >= 75) return 'success' as const
    if (score >= 50) return 'warning' as const
    return 'destructive' as const
  }

  const snippet = (job.description || '').replace(/<[^>]+>/g, '').slice(0, 220)
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{job.title}</CardTitle>
          {gap ? (
            <Badge variant={scoreColor(gap?.score) as any} className="shrink-0">
              {gap.score}% match
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          {job.company}
          {job.location ? ` • ${job.location}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {snippet}
          {job.url ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">
              View
            </a>
          ) : null}
        </p>
        <div className="mt-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={loadingGap}>
                {loadingGap ? 'Loading…' : 'Details'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {job.title} — {job.company}
                </DialogTitle>
              </DialogHeader>
              {gap ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium mb-1">✅ Matching Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {gap.matchingSkills.length ? (
                        gap.matchingSkills.map((s) => (
                          <Badge key={s} variant="secondary">{s}</Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">No direct matches detected.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">⚠️ Missing Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {gap.missingSkills.length ? (
                        gap.missingSkills.map((s) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">No major gaps found.</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Recommended Learning</div>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {gap.learningResources.length ? (
                        gap.learningResources.map((r, idx) => (
                          <li key={`${r.skill}-${idx}`}>
                            <a className="text-primary hover:underline" href={r.url} target="_blank" rel="noreferrer">
                              {r.title}
                            </a>
                            <span className="text-muted-foreground"> — {r.skill}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-muted-foreground">No resources found.</li>
                      )}
                    </ul>
                  </div>
              </div>
              ) : (
                <div className="text-sm text-muted-foreground">No analysis available.</div>
              )}
              <DialogFooter>
                {job.url ? (
                  <Button asChild>
                    <a href={job.url} target="_blank" rel="noreferrer">Apply Now</a>
                  </Button>
                ) : null}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
