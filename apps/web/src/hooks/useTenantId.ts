import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

const TENANT_STORAGE_KEY = 'formbuilder_tenant_id';

export const useTenantId = () => {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const existing = window.localStorage.getItem(TENANT_STORAGE_KEY);
    if (existing) {
      setTenantId(existing);
      return;
    }
    const generated = `tenant_${nanoid(6)}`;
    window.localStorage.setItem(TENANT_STORAGE_KEY, generated);
    setTenantId(generated);
  }, []);

  return tenantId;
};
