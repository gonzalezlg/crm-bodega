import { Button } from '../../ui/Button';

export function FormActions({
  onCancel,
  onSubmit,
  submitDisabled = false,
  primaryLabel = 'Guardar cambios',
  submitLoading = false,
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <Button variant="secondary" onClick={onCancel} disabled={submitLoading}>
        Cancelar
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={submitDisabled}
        loading={submitLoading}
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
