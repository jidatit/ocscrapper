import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { useDeleteCase } from '@/hooks/useDeleteCase';
import { format, isValid, parse, subDays } from 'date-fns';
import {
  FileIcon,
  Search,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  X,
  Filter,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Case } from '@/types/case';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { downloadCasesCsv } from '@/api/apiClient';

export default function CaseList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [deleteWithFile, setDeleteWithFile] = useState(false);

  // Date filter states
  const [startFiled, setStartFiled] = useState<Date | undefined>(undefined);
  const [endFiled, setEndFiled] = useState<Date | undefined>(undefined);
  const [startUpdated, setStartUpdated] = useState<Date | undefined>(undefined);
  const [endUpdated, setEndUpdated] = useState<Date | undefined>(undefined);
  const [datePreset, setDatePreset] = useState<string>('custom');

  const { data, isLoading, isError, isRefetching, refetch } = useCases(
    page,
    10,
    searchQuery,
    startFiled ? format(startFiled, "yyyy-MM-dd") : undefined,
    endFiled ? format(endFiled, "yyyy-MM-dd") : undefined,
    startUpdated ? format(startUpdated, "yyyy-MM-dd") : undefined,
    endUpdated ? format(endUpdated, "yyyy-MM-dd") : undefined,
  );

  const { mutate: deleteCaseMutation } = useDeleteCase();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const handleDelete = () => {
    if (!caseToDelete) return;

    deleteCaseMutation({
      caseNumber: caseToDelete.caseNumber,
      deleteFile: deleteWithFile,
    });
    setCaseToDelete(null);
  };

  const viewCase = (caseNumber: string) => {
    navigate(`/case/${caseNumber}`);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSearchQuery('');
    setStartFiled(undefined);
    setEndFiled(undefined);
    setStartUpdated(undefined);
    setEndUpdated(undefined);
    setDatePreset('custom');
    setPage(1);
  };

  const clearFiledDates = () => {
    setStartFiled(undefined);
    setEndFiled(undefined);
  };

  const clearUpdatedDates = () => {
    setStartUpdated(undefined);
    setEndUpdated(undefined);
  };

  const applyDatePreset = (preset: string) => {
    const today = new Date();

    switch (preset) {
      case 'today':
        setStartUpdated(today);
        setEndUpdated(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setStartUpdated(yesterday);
        setEndUpdated(yesterday);
        break;
      case 'last7':
        setStartUpdated(subDays(today, 7));
        setEndUpdated(today);
        break;
      case 'last30':
        setStartUpdated(subDays(today, 30));
        setEndUpdated(today);
        break;
      case 'thisMonth':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartUpdated(firstDay);
        setEndUpdated(today);
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartUpdated(firstDayLastMonth);
        setEndUpdated(lastDayLastMonth);
        break;
      case 'custom':
        // Do nothing - user will set custom dates
        break;
    }
  };

  useEffect(() => {
    if (datePreset !== 'custom') {
      applyDatePreset(datePreset);
    }
  }, [datePreset]);

  // Calculate pagination values
  const totalPages = data ? Math.ceil(data.count / 10) : 0;
  const showingFrom = data ? (page - 1) * 10 + 1 : 0;
  const showingTo = data ? Math.min(page * 10, data.count) : 0;

  // Check if any filters are active
  const hasActiveFilters = searchQuery || startFiled || endFiled || startUpdated || endUpdated;

  const handleExport = () => {
    downloadCasesCsv(
      startUpdated ? format(startUpdated, "yyyy-MM-dd") : undefined,
      endUpdated ? format(endUpdated, "yyyy-MM-dd") : undefined,
    ).catch((err) => {
      console.error(err);
      alert('Could not download CSV');
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {/* Header with title and refresh button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-8 w-8 p-0"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Export button - moved to header for better visibility */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="bg-primary text-primary-foreground hover:bg-primary/80 hover:text-white"
          >
            {startUpdated || endUpdated
              ? `Export: ${startUpdated ? format(startUpdated, "MMM d") : "…"} – ${endUpdated ? format(endUpdated, "MMM d, yyyy") : "…"}`
              : "Export All Data"}
          </Button>
        </div>

        {/* Filters and search section */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Input
              className="pr-10"
              placeholder="Search cases by case number and type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Date filters row */}
          <div className="flex flex-wrap gap-4">
            {/* Filed Date Range */}
            <div className="flex-1 min-w-[240px]">
              <label className="text-xs font-semibold mb-1 block">Filed Date Range</label>
              <DatePicker
                selectsRange
                startDate={startFiled}
                endDate={endFiled}
                onChange={(update) => {
                  setStartFiled(update[0]);
                  setEndFiled(update[1]);
                  setDatePreset('custom');
                }}
                isClearable
                placeholderText="Select filed dates"
                className="flex h-9 w-56 rounded-md border border-input bg-background px-3 py-1 text-sm"
                dateFormat="MMM d, yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>

            {/* Arrived Date Range */}
            <div className="flex-1 min-w-[240px]">
              <label className="text-xs font-semibold mb-1 block">Arrived Date Range</label>
              <DatePicker
                selectsRange
                startDate={startUpdated}
                endDate={endUpdated}
                onChange={(update) => {
                  setStartUpdated(update[0]);
                  setEndUpdated(update[1]);
                  setDatePreset('custom');
                }}
                isClearable
                placeholderText="Select arrived dates"
                className="flex h-9 w-56 rounded-md border border-input bg-background px-3 py-1 text-sm"
                dateFormat="MMM d, yyyy"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
              />
            </div>

            {/* Date Presets */}
            <div className="w-[180px]">
              <label className="text-xs font-semibold mb-1 block">Date Preset on Arrived</label>
              <Select value={datePreset} onValueChange={setDatePreset}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Range</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Active filters:</span>

              {searchQuery && (
                <Badge variant="outline" className="flex items-center text-xs">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(startFiled || endFiled) && (
                <Badge variant="outline" className="flex items-center text-xs">
                  Filed: {startFiled ? format(startFiled, 'MMM d') : ''}
                  {startFiled && endFiled && ' – '}
                  {endFiled ? format(endFiled, 'MMM d, yyyy') : ''}
                  <button
                    onClick={clearFiledDates}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(startUpdated || endUpdated) && (
                <Badge variant="outline" className="flex items-center text-xs">
                  Arrived: {startUpdated ? format(startUpdated, 'MMM d') : ''}
                  {startUpdated && endUpdated && ' – '}
                  {endUpdated ? format(endUpdated, 'MMM d, yyyy') : ''}
                  <button
                    onClick={clearUpdatedDates}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground h-7 px-2"
              >
                Clear All
                <X className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading cases...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Cases</h3>
              <p className="text-muted-foreground ">
                There was a problem loading the case data. Please try again or contact support if the problem persists.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Arrived At</TableHead>
                      <TableHead>Date Filed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <FileIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No cases found</p>
                          {hasActiveFilters && (
                            <Button
                              variant="link"
                              onClick={clearAllFilters}
                            >
                              Clear all filters
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data.map((caseItem) => (
                        <TableRow key={caseItem?._id}>
                          <TableCell className="font-medium">
                            {caseItem?.caseNumber}
                          </TableCell>
                          <TableCell>{caseItem?.caseType}</TableCell>
                          <TableCell>
                            {caseItem?.updatedAt
                              ? format(new Date(caseItem.updatedAt), 'MMM d, yyyy, h:mm a')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {caseItem?.dateFiled ? format(new Date(caseItem.dateFiled), 'MMM d, yyyy') : "N/A"}                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewCase(caseItem?.caseNumber)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCaseToDelete(caseItem)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Case
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete case{' '}
                                      <span className="font-semibold">
                                        {caseToDelete?.caseNumber}
                                      </span>
                                      ? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="flex items-center space-x-2 py-2">
                                    <Checkbox
                                      id="delete-file"
                                      checked={deleteWithFile}
                                      onCheckedChange={(checked) =>
                                        setDeleteWithFile(checked === true)
                                      }
                                    />
                                    <label
                                      htmlFor="delete-file"
                                      className="text-sm font-medium"
                                    >
                                      Also delete PDF file
                                    </label>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={handleDelete}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data && data.count > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{showingFrom}</span> to{' '}
                    <span className="font-medium">{showingTo}</span> of{' '}
                    <span className="font-medium">{data.count}</span> cases
                  </p>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}