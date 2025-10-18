import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { z } from 'zod';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

interface StoredForm {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  elements: unknown[];
  createdAt: string;
  updatedAt: string;
}

const saveFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  elements: z.array(z.unknown())
});

const inMemoryStore = new Map<string, StoredForm[]>();

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', region: process.env.DEPLOY_REGION ?? 'local' });
});

app.post('/api/forms', (req, res) => {
  const tenantId = req.header('X-Tenant-ID');
  if (!tenantId) {
    return res.status(400).json({ message: 'Missing X-Tenant-ID header' });
  }

  const parseResult = saveFormSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(422).json({ message: 'Invalid payload', issues: parseResult.error.issues });
  }

  const payload = parseResult.data;
  const existingForms = inMemoryStore.get(tenantId) ?? [];
  const now = new Date().toISOString();
  const form: StoredForm = {
    id: `form_${existingForms.length + 1}`,
    tenantId,
    name: payload.name,
    description: payload.description,
    elements: payload.elements,
    createdAt: now,
    updatedAt: now
  };
  inMemoryStore.set(tenantId, [...existingForms, form]);
  res.status(201).json({ form });
});

app.get('/api/forms', (req, res) => {
  const tenantId = req.header('X-Tenant-ID');
  if (!tenantId) {
    return res.status(400).json({ message: 'Missing X-Tenant-ID header' });
  }
  return res.json({ forms: inMemoryStore.get(tenantId) ?? [] });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT}`);
});
