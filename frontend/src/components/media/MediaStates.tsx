import type { ReactNode } from "react"
import { Link } from "react-router"
import { CircleAlert, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function StatePanel({ children }: { children: ReactNode }) {
  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {children}
      </CardContent>
    </Card>
  )
}

export function MediaLoadingState({ label }: { label: string }) {
  return (
    <StatePanel>
      <Loader2 className="size-6 animate-spin text-neutral-400" />
      <p className="text-sm text-neutral-400">{label}</p>
    </StatePanel>
  )
}

interface MediaEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function MediaEmptyState({
  icon: Icon,
  title,
  description,
}: MediaEmptyStateProps) {
  return (
    <StatePanel>
      <Icon className="size-8 text-neutral-500" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-neutral-100">{title}</p>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
      <Button asChild>
        <Link to="/app/upload">Upload media</Link>
      </Button>
    </StatePanel>
  )
}

interface MediaErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
  actionLabel?: string
  actionTo?: string
}

export function MediaErrorState({
  title,
  description,
  onRetry,
  actionLabel,
  actionTo,
}: MediaErrorStateProps) {
  return (
    <StatePanel>
      <CircleAlert className="size-8 text-red-400" />
      <div className="flex flex-col gap-1">
        <p className="font-medium text-red-400">{title}</p>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
      {actionTo && actionLabel && (
        <Button asChild variant="outline">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
    </StatePanel>
  )
}
