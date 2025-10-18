import { FormBuilderProvider } from './state/FormBuilderProvider';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { ElementSettings } from './components/ElementSettings';
import { TopBar } from './components/TopBar';
import { useFormBuilderStore } from './state/FormBuilderProvider';
import { FormElementType } from './state/types';

const BuilderShell: React.FC = () => {
  const { addElement } = useFormBuilderStore();

  const handleSelectFromPalette = (type: FormElementType) => {
    addElement(type);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-10">
      <TopBar />
      <main className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
        <aside className="hidden lg:block">
          <div className="sticky top-10 space-y-6">
            <Palette onSelect={handleSelectFromPalette} />
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 text-sm text-slate-500">
              <h3 className="text-sm font-semibold text-slate-800">Collaboration ready</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Invite teammates, configure approval workflows, and publish forms per tenant. Our SaaS architecture keeps
                data siloed and secure by default.
              </p>
            </div>
          </div>
        </aside>
        <section className="flex flex-col gap-4">
          <Canvas />
        </section>
        <aside className="hidden lg:block">
          <div className="sticky top-10 rounded-3xl border border-slate-200 bg-white/90 p-6">
            <h3 className="text-sm font-semibold text-slate-800">Field settings</h3>
            <p className="mb-4 mt-1 text-xs text-slate-500">Fine tune labels, validation rules, and options.</p>
            <ElementSettings />
          </div>
        </aside>
      </main>
      <div className="lg:hidden">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h3 className="text-sm font-semibold text-slate-800">Field settings</h3>
          <ElementSettings />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <FormBuilderProvider>
    <BuilderShell />
  </FormBuilderProvider>
);

export default App;
