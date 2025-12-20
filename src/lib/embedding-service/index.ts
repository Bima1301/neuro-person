import {
  bulkEmbedAttendances,
  deleteAttendanceEmbedding,
  embedAllAttendances,
  embedAttendance,
  embedAttendancesByDateRange,
  searchAttendances,
} from './attendance'
import {
  bulkEmbedEmployees,
  deleteEmployeeEmbedding,
  embedAllEmployees,
  embedEmployee,
  searchEmployees,
} from './employee'
import {
  bulkEmbedShiftAllocations,
  deleteShiftAllocationEmbedding,
  embedAllShiftAllocations,
  embedShiftAllocation,
  embedShiftAllocationsByDateRange,
  searchShiftAllocations,
} from './shift-allocation'
import { cleanupDuplicateEmbeddings } from './utils'
import { DocumentType } from './types'

export const embeddingService = {
  employee: {
    embedEmployee,
    deleteEmployeeEmbedding,
    embedAllEmployees,
    searchEmployees,
    bulkEmbedEmployees,
  },
  shiftAllocation: {
    embedShiftAllocation,
    deleteShiftAllocationEmbedding,
    embedAllShiftAllocations,
    searchShiftAllocations,
    embedShiftAllocationsByDateRange,
    bulkEmbedShiftAllocations,
  },
  attendance: {
    embedAttendance,
    deleteAttendanceEmbedding,
    embedAllAttendances,
    searchAttendances,
    embedAttendancesByDateRange,
    bulkEmbedAttendances,
  },
  cleanupDuplicates: async (
    organizationId: string,
    documentType?: DocumentType,
  ) => {
    if (documentType) {
      return cleanupDuplicateEmbeddings(organizationId, documentType)
    } else {
      // Cleanup all types
      const results = await Promise.all([
        cleanupDuplicateEmbeddings(organizationId, DocumentType.EMPLOYEE),
        cleanupDuplicateEmbeddings(organizationId, DocumentType.ATTENDANCE),
        cleanupDuplicateEmbeddings(organizationId, DocumentType.SHIFT),
      ])
      return results.reduce((sum, count) => sum + count, 0)
    }
  },
}
