import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-2xl font-bold">HomeStreamLab</h1>
      <p className="text-neutral-400">Personal media library — frontend coming soon.</p>

      {/* Temporary shadcn/ui verification section — remove once real pages exist */}
      <Card className="w-full max-w-sm text-left">
        <CardHeader>
          <CardTitle>shadcn/ui check</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verify-email">Email</Label>
            <Input id="verify-email" type="email" placeholder="you@example.com" />
          </div>
          <Button>Continue</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
