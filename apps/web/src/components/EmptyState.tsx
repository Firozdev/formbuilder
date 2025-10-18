export const EmptyState: React.FC = () => (
  <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center text-slate-500">
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-4xl">✨</div>
    <div>
      <h3 className="text-lg font-semibold text-slate-800">Design your next form</h3>
      <p className="text-sm text-slate-500">
        Drag components from the left or click to add them to your form canvas.
      </p>
    </div>
  </div>
);
