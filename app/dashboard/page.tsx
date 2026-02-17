"use client"
import { useState } from "react";
import { format } from "date-fns"
import { Calendar, Globe, Plus, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddWebsiteDialog from "./_common/add-website-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWebsites, deleteWebsite } from "../action/website";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Page = () => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ["websites"],
        queryFn: async () => {
            const res = await getWebsites()
            if (res?.error) throw new Error(res.error);
            return res.websites
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteWebsite,
        onSuccess: (result) => {
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Website removed successfully")
                queryClient.invalidateQueries({ queryKey: ["websites"] })
            }
        },
        onError: () => {
            toast.error("Failed to remove website")
        }
    })

    const handleDelete = (e: React.MouseEvent, websiteId: string, domain: string) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (confirm(`Are you sure you want to remove ${domain}? This will delete all analytics data for this website.`)) {
            deleteMutation.mutate(websiteId)
        }
    }

    return (
        <>
            <div className="space-y-8 w-full min-h-screen px-4 md:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Websites
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Manage and monitor your digital footprint across all registered domains.
                        </p>
                    </div>
                    <Button onClick={() => setOpen(true)} size="default" className="w-full sm:w-auto">
                        <Plus className="size-4" />
                        Add Website
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Array.from({ length: 6 }, (_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-xl" />
                        ))}
                    </div>
                ) : !data || data.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia
                                variant="icon"
                                className="size-16 rounded-full bg-primary/5 text-primary/40"
                            >
                                <Globe className="size-10" />
                            </EmptyMedia>
                            <EmptyTitle>
                                No websites found
                            </EmptyTitle>
                            <EmptyDescription>
                                Start by adding your first domain to begin tracking powerful analytics in real-time.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(true)}
                            >
                                <Plus className="size-4" />
                                Add Website
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {data?.map((item) => (
                            <Link
                                key={item.id}
                                href={`/dashboard/${item.id}`}
                                className="group block transition-transform hover:scale-[1.02]"
                            >
                                <Card className="h-full border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <Globe className="size-5" />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                onClick={(e) => handleDelete(e, item.id, item.domain)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                                            {item.domain}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="size-3.5" />
                                            <span>
                                                Added {format(new Date(item.createdAt), "MMM d, yyyy")}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                            <span className="text-sm font-semibold text-primary group-hover:underline underline-offset-4">
                                                View Analytics
                                            </span>
                                            <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <AddWebsiteDialog open={open} onOpenChange={setOpen} />
        </>
    )
};

export default Page;