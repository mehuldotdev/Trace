"use client"
import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { getScript } from "@/constants/constants"
import { addWebsite } from "@/app/action/website"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Check, Copy } from "lucide-react"


type PropsType = {
  open: boolean,
  onOpenChange: (open: boolean) => void
}

const schema = z.object({
  domain: z.string().min(1, "Domain is required")
    .regex(/^(localhost(:\d+)?|([a-z0-9-]+\.)+[a-z]{2,})$/i,
      "Invalid domain")
})
type FormValues = z.infer<typeof schema>

const AddWebsiteDialog = ({ open, onOpenChange }: PropsType) => {
  const router = useRouter()
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"form" | "script">("form")
  const [domain, setDomain] = useState("")
  const [websiteId, setWebsiteId] = useState("")
  const [siteId, setSiteId] = useState("")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const script = getScript(domain, siteId)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      domain: ""
    }
  })

  const onSubmit = async ({ domain }: FormValues) => {
    try {
      setIsLoading(true);
      const response = await addWebsite(domain);
      if (response?.error) {
        setIsLoading(false)
        toast.error(response.error)
        return
      }

      queryClient.invalidateQueries({
        queryKey: ["websites"]
      });

      setDomain(response.website.domain);
      setWebsiteId(response.website.id);
      setSiteId(response.website.site_id);
      setIsLoading(false)
      setStep("script")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const copyScript = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000);
  }

  const onDone = () => {
    onOpenChange(false)
    router.push(`/dashboard/${websiteId}`)
    setStep("form")
  }

  const handleOpen = (open: boolean) => {
    if (!open) {
      setStep("form")
      onOpenChange(false)
      return
    }

    onOpenChange(open)

  }


  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg">
        {step == "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Website</DialogTitle>
              <DialogDescription>
                Enter your website domain to start tracking
                analytics
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <InputGroup>
                  <InputGroupAddon>
                    https://
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="example.com"
                    {...register("domain")}
                  />
                </InputGroup>
                {errors.domain && (
                  <p className="text-sm text-destructive">
                    {errors.domain.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner /> : "Continue"}
                </Button>
              </div>

            </form>
          </>
        ) : step === "script" ? (
          <>
            <DialogHeader>
              <DialogTitle>Install Tracking Script</DialogTitle>
              <DialogDescription>
                Paste this inside your website
                <code>&lt;head&gt;</code>
              </DialogDescription>
            </DialogHeader>

            <div className="relative max-w-md">
              <pre className="bg-muted p-4 rounded-lg
            text-sm overflow-x-auto">
                <code>{script}</code>
              </pre>

              <Button size="icon-sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyScript}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Domain <strong>{domain}</strong>
            </p>

            <Button className="mt-4 w-full" onClick={onDone}>
              Done
            </Button>

          </>
        ) : null}
      </DialogContent>
    </Dialog >
  )
}

export default AddWebsiteDialog