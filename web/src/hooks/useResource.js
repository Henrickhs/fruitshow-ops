import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, query } from '../lib/api.js';

export function useResource(path, initialFilters = {}) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, pages: 1 });
  const [filters, setFilters] = useState({ page: 1, pageSize: 10, ...initialFilters });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api(`${path}${query(filters)}`);
      setItems(result.data || result);
      setMeta(result.meta || { total: result.length || 0, page: 1, pageSize: 10, pages: 1 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [path, filters]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, meta, filters, setFilters, loading, reload: load };
}
