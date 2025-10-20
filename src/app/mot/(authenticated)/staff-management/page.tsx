'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/shared/layout';
import TimekeeperAdvancedFilters from '@/components/mot/timekeepers/TimekeeperAdvancedFilters/page';
import { TimekeeperActionButtons } from '@/components/mot/timekeepers/TimekeeperActionButtons/page';
import { TimekeeperStatsCards } from '@/components/mot/timekeepers/TimekeeperStatsCards/page';
import { TimekeepersTable } from '@/components/mot/timekeepers/TimekeepersTable/page';
import Pagination from '@/components/shared/Pagination';
import { TimekeeperControllerService } from '@/lib/api-client/user-management/services/TimekeeperControllerService';
import { BusStopManagementService } from '@/lib/api-client/route-management/services/BusStopManagementService'; // added import

interface TimekeeperResponse {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  assign_stand: string;
  nic: string;
  province: string;
  user_id?: string;
  createdAt?: string;
  status?: string;
}

interface QueryParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search: string;
  status?: 'active' | 'inactive';
}

interface FilterOptions {
  statuses: Array<'active' | 'inactive'>;
  provinces: string[];
  stands: Array<{ id: string; name: string }>; // changed to objects with id + name
}

export default function TimekeepersPage() {
  const router = useRouter();

  // Core states
  const [timekeepers, setTimekeepers] = useState<TimekeeperResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [standFilter, setStandFilter] = useState('all');

  // Dynamic dropdown filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    statuses: ['active', 'inactive'],
    provinces: [],
    stands: [],
  });

  // Query params
  const [queryParams, setQueryParams] = useState<QueryParams>({
    page: 0,
    size: 10,
    sortBy: 'fullname',
    sortDir: 'asc',
    search: '',
  });

  // Pagination metadata
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Stats for dashboard cards
  const [stats, setStats] = useState({
    totalTimekeepers: { count: 0 },
    activeTimekeepers: { count: 0 },
    inactiveTimekeepers: { count: 0 },
    provincesCount: { count: 0 },
  });

  /** Fetch all timekeepers */
  const loadTimekeepers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // fetch timekeepers and stops in parallel
      const [tkResponse, stopsResp] = await Promise.all([
        TimekeeperControllerService.getAllTimekeepers(),
        BusStopManagementService.getAllStopsAsList().catch(() => []), // get all stops from DB
      ]);

      const normalized = (tkResponse || []).map((r: any) => ({
        id: r.id ?? r.timekeeperId ?? r._id ?? r.userId ?? '',
        fullname: r.fullname ?? r.name ?? '',
        phonenumber: r.phonenumber ?? r.phone ?? '',
        email: r.email ?? '',
        assign_stand: r.assign_stand ?? r.assignStand ?? r.assignedStand ?? '',
        nic: r.nic ?? '',
        province: r.province ?? '',
        user_id: r.user_id ?? r.userId ?? undefined,
        createdAt: r.createdAt ?? r.created_at ?? undefined,
        status: r.status ?? 'active',
      }));

      // build stop id -> name map from stops service
      const stopsArray = (stopsResp || []) as any[];
      const stopsMap: Record<string, string> = {};
      const stopsList = stopsArray.map((s: any) => {
        const id = s.id ?? s.stop_id ?? s._id ?? String(s);
        const name = s.name ?? s.displayName ?? s.label ?? String(s);
        stopsMap[id] = name;
        return { id, name };
      });

      setTimekeepers(
        normalized.map((t) => ({
          ...t,
          assign_stand_name: stopsMap[t.assign_stand] ?? t.assign_stand,
        }))
      );

      // Calculate statistics
      setStats({
        totalTimekeepers: { count: normalized.length },
        activeTimekeepers: {
          count: normalized.filter((t) => t.status === 'active').length,
        },
        inactiveTimekeepers: {
          count: normalized.filter((t) => t.status === 'inactive').length,
        },
        provincesCount: {
          count: new Set(normalized.map((t) => t.province).filter(Boolean)).size,
        },
      });

      // Derive filter options
      const provinces = [...new Set(normalized.map((t) => t.province).filter(Boolean))];

      // use stopsList (from DB) as the stand filter options (id + friendly name)
      const stands = stopsList;

      setFilterOptions((prev) => ({ ...prev, provinces, stands }));
    } catch (err) {
      console.error('Error loading timekeepers:', err);
      setError('Failed to load timekeepers. Please try again.');
      setTimekeepers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Initial load */
  useEffect(() => {
    loadTimekeepers();
  }, [loadTimekeepers]);

  /** Update query parameters */
  const updateQueryParams = useCallback(
    (updates: Partial<QueryParams>) => {
      setQueryParams((prev) => {
        const updated = { ...prev, ...updates };
        if (!('status' in updates)) {
          if (statusFilter !== 'all') {
            updated.status = statusFilter as QueryParams['status'];
          } else {
            delete updated.status;
          }
        }
        return updated;
      });
    },
    [statusFilter]
  );

  /** React to filter changes */
  useEffect(() => {
    const debounce = setTimeout(() => {
      updateQueryParams({ page: 0 });
    }, 300);
    return () => clearTimeout(debounce);
  }, [statusFilter, provinceFilter, standFilter, updateQueryParams]);

  /** Handle Actions */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateQueryParams({ search: term, page: 0 });
  };

  const handleAddNew = () => router.push('/mot/staff-management/add-new');
  const handleView = (id: string) => router.push(`/mot/staff-management/${id}`);
  const handleEdit = (id: string) => router.push(`/mot/staff-management/${id}/edit`);
  const handleDelete = (id: string) => alert(`Delete not implemented yet for ID: ${id}`);

  /** Filtering + Pagination */
  const filteredTimekeepers = useMemo(() => {
    let list = timekeepers;
    if (provinceFilter !== 'all') list = list.filter((t) => t.province === provinceFilter);
    if (standFilter !== 'all') list = list.filter((t) => t.assign_stand === standFilter);
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter);
    if (searchTerm)
      list = list.filter((t) =>
        [t.fullname, t.email, t.nic, t.assign_stand, t.province]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    return list;
  }, [timekeepers, provinceFilter, standFilter, statusFilter, searchTerm]);

  const paginatedTimekeepers = useMemo(() => {
    const start = queryParams.page * queryParams.size;
    const end = start + queryParams.size;
    return filteredTimekeepers.slice(start, end);
  }, [filteredTimekeepers, queryParams.page, queryParams.size]);

  const transformed = useMemo(
    () =>
      paginatedTimekeepers.map((tk) => ({
        id: tk.id,
        fullname: tk.fullname,
        phonenumber: tk.phonenumber,
        email: tk.email,
        assign_stand: tk.assign_stand,
        province: tk.province,
        nic: tk.nic,
        status: tk.status,
        createdAt: tk.createdAt,
      })),
    [paginatedTimekeepers]
  );

  useEffect(() => {
    setPagination({
      currentPage: queryParams.page,
      totalPages: Math.ceil(filteredTimekeepers.length / queryParams.size) || 1,
      totalElements: filteredTimekeepers.length,
      pageSize: queryParams.size,
    });
  }, [filteredTimekeepers, queryParams.page, queryParams.size]);

  /** Render */
  return (
    <Layout
      activeItem="timekeepers"
      pageTitle="Timekeepers"
      pageDescription="Manage timekeepers (stand assignments and staff)"
      role="mot"
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics */}
        <TimekeeperStatsCards stats={stats} />

        {/* Only "Add New" button now */}
        <TimekeeperActionButtons onAddTimekeeper={handleAddNew} />

        {/* Filters */}
        <TimekeeperAdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          provinceFilter={provinceFilter}
          setProvinceFilter={setProvinceFilter}
          standFilter={standFilter}
          setStandFilter={setStandFilter}
          filterOptions={filterOptions}
          loading={isLoading}
          totalCount={pagination.totalElements}
          filteredCount={transformed.length}
          onSearch={handleSearch}
          onClearAll={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setProvinceFilter('all');
            setStandFilter('all');
          }}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <TimekeepersTable
            timekeepers={transformed}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={(sortBy, sortDir) => updateQueryParams({ sortBy, sortDir })}
            activeFilters={{
              search: searchTerm,
              status: statusFilter !== 'all' ? statusFilter : undefined,
              province: provinceFilter !== 'all' ? provinceFilter : undefined,
              stand: standFilter !== 'all' ? standFilter : undefined,
            }}
            loading={isLoading}
            currentSort={{ field: queryParams.sortBy, direction: queryParams.sortDir }}
          />

          {pagination.totalElements > 0 && (
            <div className="border-t border-gray-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                onPageChange={(page) => updateQueryParams({ page })}
                onPageSizeChange={(size) => updateQueryParams({ size, page: 0 })}
                loading={isLoading}
                searchActive={Boolean(searchTerm)}
                filterCount={[
                  statusFilter !== 'all',
                  provinceFilter !== 'all',
                  standFilter !== 'all',
                ].filter(Boolean).length}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}