import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ImportResult {
  row: number
  employeeId: string
  name: string
  status: 'success' | 'error'
  message: string
}

interface ImportResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: Array<ImportResult>
  success: number
  total: number
}

export function ImportResultDialog({
  open,
  onOpenChange,
  results,
  success,
  total,
}: ImportResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Hasil Import Karyawan</DialogTitle>
          <DialogDescription>
            Total: {total} | Berhasil: {success} | Gagal: {total - success}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-16">Baris</TableHead>
                <TableHead className="w-32">NIK/ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.row}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {result.employeeId}
                    </TableCell>
                    <TableCell>{result.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          result.status === 'success'
                            ? 'default'
                            : 'destructive'
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {result.status === 'success' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {result.status === 'success' ? 'Berhasil' : 'Gagal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{result.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
