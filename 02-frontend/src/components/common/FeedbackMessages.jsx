function FeedbackMessages({
  queryErrors = [],
  saveErrors = [],
  statusErrors = [],
  successMessage = '',
}) {
  const errors = [...queryErrors, ...saveErrors, ...statusErrors].filter(
    Boolean,
  );

  return (
    <div className="mb-4 space-y-3">
      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {errors.map((error, index) => (
        <div
          key={`${error}-${index}`}
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ))}
    </div>
  );
}

export default FeedbackMessages;
