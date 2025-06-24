"use client"

import { useId, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function ThemeToggle() {
  const id = useId()
  const [checked, setChecked] = useState<boolean>(true)

  return (
    <div className="inline-flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={setChecked} aria-label="Toggle dark mode" />
      <Label htmlFor={id}>
        <span className="sr-only">Toggle dark mode</span>
        {checked ? <SunIcon size={16} aria-hidden="true" /> : <MoonIcon size={16} aria-hidden="true" />}
      </Label>
    </div>
  )
}
