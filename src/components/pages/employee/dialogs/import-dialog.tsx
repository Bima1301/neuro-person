import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ImportResultDialog } from './import-result-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/integrations/trpc/react'

const importFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'File wajib diisi' })
    .refine(
      (file) =>
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel',
      {
        message: 'File harus berformat Excel (.xlsx atau .xls)',
      },
    ),
})

type ImportFormValues = z.infer<typeof importFormSchema>

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    results: Array<{
      row: number
      employeeId: string
      name: string
      status: 'success' | 'error'
      message: string
    }>
    success: number
    total: number
  } | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      file: undefined,
    },
  })

  const importMutation = useMutation(
    trpc.employee.import.mutationOptions({
      onSuccess: (result) => {
        // Invalidate employee queries to refresh the list
        queryClient.invalidateQueries({
          queryKey: trpc.employee.list.queryKey(),
        })

        setImportResult({
          results: result.results,
          success: result.success,
          total: result.total,
        })
        setShowResultDialog(true)
        form.reset()
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal mengimpor: ${error.message}`)
      },
      onSettled: () => {
        setIsImporting(false)
      },
    }),
  )

  const downloadTemplateMutation = useMutation(
    trpc.employee.downloadTemplate.mutationOptions({
      onSuccess: (base64) => {
        // Convert base64 to blob
        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template-import-karyawan.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Template berhasil diunduh')
      },
      onError: (error) => {
        toast.error(`Gagal mengunduh template: ${error.message}`)
      },
    }),
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('file', file)
      form.clearErrors('file')
    }
  }

  const handleSubmit = async (data: ImportFormValues) => {
    setIsImporting(true)
    const formData = new FormData()
    formData.append('file', data.file)

    // Convert File to base64 for tRPC
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      importMutation.mutate({ file: base64, fileName: data.file.name })
    }
    reader.readAsDataURL(data.file)
  }

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Karyawan</DialogTitle>
          <DialogDescription>
            Upload file Excel untuk mengimpor data karyawan secara massal
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File Excel</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="file"
                      accept=".xlsx,.xls"
                      ref={fileInputRef}
                      onChange={(e) => {
                        handleFileChange(e)
                        onChange(e.target.files?.[0])
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm text-muted-foreground">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={handleDownloadTemplate}
                disabled={downloadTemplateMutation.isPending}
              >
                <Download className="h-3 w-3 mr-1" />
                Download Template Excel
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isImporting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isImporting}>
                {isImporting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Mengimpor...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Result Dialog */}
      {importResult && (
        <ImportResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          results={importResult.results}
          success={importResult.success}
          total={importResult.total}
        />
      )}
    </Dialog>
  )
}
