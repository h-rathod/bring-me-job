import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface ProfileData {
  fullName: string
  headline: string
  skills: string[]
}

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<ProfileData>({
    queryKey: ['profile', 'me', open],
    queryFn: async () => {
      const res = await api.get('/api/profile/me')
      return res.data as ProfileData
    },
    enabled: open,
    staleTime: 30_000,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
          </div>
        ) : isError ? (
          <div className="text-sm text-red-600">Failed to load profile.</div>
        ) : data ? (
          <div className="space-y-3">
            <div>
              <div className="text-lg font-semibold">{data.fullName || '—'}</div>
              {data.headline ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">{data.headline}</div>
              ) : null}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Skills</div>
              <div className="flex flex-wrap gap-2">
                {data.skills && data.skills.length ? (
                  data.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No skills found.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
