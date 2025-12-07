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
}
