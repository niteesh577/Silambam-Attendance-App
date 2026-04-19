import { useApiClient } from '../ApiContext'
import { useFetch } from './useFetch'
import type { BranchCreate, BranchUpdate } from '../types'

export function useBranches() {
  const api = useApiClient()

  const { data: branches, loading: loadingBranches, error: errorBranches, execute: fetchBranches } = useFetch(api.getBranches)
  const { data: branch,   loading: loadingBranch,   error: errorBranch,   execute: fetchBranch }   = useFetch(api.getBranch)
  const { data: summary,  loading: loadingSummary,  error: errorSummary,  execute: fetchSummary }  = useFetch(api.getBranchSummary)
  
  const { execute: createBranch, loading: creating } = useFetch(api.createBranch)
  const { execute: updateBranch, loading: updating } = useFetch(api.updateBranch)
  const { execute: deleteBranch, loading: deleting } = useFetch(api.deleteBranch)

  return {
    // Queries
    branches, loadingBranches, errorBranches, fetchBranches,
    branch,   loadingBranch,   errorBranch,   fetchBranch,
    summary,  loadingSummary,  errorSummary,  fetchSummary,
    // Mutations
    createBranch, creating,
    updateBranch, updating,
    deleteBranch, deleting,
  }
}
