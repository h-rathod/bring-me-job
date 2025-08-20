import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, UploadCloud } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { JobCard, type JobItem } from '@/components/jobs/JobCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProfileMe {
  fullName: string
  headline: string
  skills: string[]
}

export function Home() {
  const qc = useQueryClient()
  const [openUpload, setOpenUpload] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [triggered, setTriggered] = useState(false)
  const [sort, setSort] = useState<'match' | 'recent'>('match')
  const [locationFilter, setLocationFilter] = useState('')

  const { data, isLoading } = useQuery<ProfileMe | null>({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/profile/me')
        return res.data as ProfileMe
      } catch (err: any) {
        if (err?.response?.status === 404) return null
        throw err
      }
    },
    staleTime: 30000,
  })

  const hasProfile = useMemo(() => !!data, [data])

  // Fetch job matches only after user presses "Bring Me Job!"
  const matches = useQuery<{ jobs: JobItem[] }>({
    queryKey: ['jobs', 'matches'],
    enabled: hasProfile && triggered,
    queryFn: async () => {
      const res = await api.get('/api/jobs/matches')
      return res.data as { jobs: JobItem[] }
    },
    staleTime: 60_000,
  })

  const filteredSortedJobs = useMemo(() => {
    const jobs = matches.data?.jobs ?? []
    const byLocation = locationFilter.trim().toLowerCase()
    let list = jobs
    if (byLocation) {
      list = list.filter(j => (j.location || '').toLowerCase().includes(byLocation))
    }
    if (sort === 'recent') {
      return [...list].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }
    // default: sort by match desc, nulls last
    return [...list].sort((a, b) => {
      const as = typeof a.similarity === 'number' ? a.similarity : -1
      const bs = typeof b.similarity === 'number' ? b.similarity : -1
      return bs - as
    })
  }, [matches.data, sort, locationFilter])

  const onUpload = async () => {
    if (!file) {
      toast.info('Please select a PDF resume first.')
      return
    }
    try {
      setIsUploading(true)
      const form = new FormData()
      form.append('resume', file)
      await api.post('/api/profile/upload-resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Resume uploaded! Parsing completed.')
      setOpenUpload(false)
      setFile(null)
      await qc.invalidateQueries({ queryKey: ['profile', 'me'] })
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Upload failed'
      toast.error(msg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="ml-2">Checking your profile...</span>
        </div>
      ) : hasProfile ? (
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <div className="text-base font-semibold">Welcome back{data?.fullName ? `, ${data.fullName}` : ''}!</div>
            <div className="mt-1 text-sm text-muted-foreground">Here are jobs that match your skills.</div>
            <div className="mt-4">
              <Button onClick={() => setOpenUpload(true)} variant="outline">
                Update Resume
              </Button>
            </div>
            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={async () => {
                  setTriggered(true)
                  await qc.invalidateQueries({ queryKey: ['jobs', 'matches'] })
                }}
              >
                Bring Me Job!
              </Button>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Sort</label>
                  <Select value={sort} onValueChange={(v: 'match' | 'recent') => setSort(v)}>
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Most match</SelectItem>
                      <SelectItem value="recent">Most recent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Location</label>
                  <input
                    className="h-9 rounded-md border border-gray-200 bg-transparent px-2 text-sm dark:border-gray-800"
                    placeholder="e.g. Remote, India"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Matches */}
          {triggered && matches.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                  <Skeleton className="mt-4 h-16 w-full" />
                </div>
              ))}
            </div>
          ) : triggered && filteredSortedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredSortedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : triggered ? (
            <div className="text-sm text-muted-foreground">No matches yet. Try updating your resume.</div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-24 text-center dark:border-gray-700">
          <UploadCloud className="mb-3 h-8 w-8 text-gray-500" />
          <div className="text-lg font-semibold">No resume found</div>
          <div className="mt-1 max-w-md text-sm text-muted-foreground">
            Upload your resume to let the AI extract your profile and skills.
          </div>
          <Button className="mt-6" onClick={() => setOpenUpload(true)}>
            Add Resume
          </Button>
        </div>
      )}

      <Dialog open={openUpload} onOpenChange={setOpenUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Upload a PDF. We will parse it with AI to populate your profile.
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenUpload(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={onUpload} disabled={isUploading}>
                {isUploading ? (
                  <span className="inline-flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...</span>
                ) : (
                  'Upload & Parse'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
