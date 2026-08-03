import { forwardRef } from 'react';

const variantClasses = {
  primary: 'bg-zinc-950 text-white hover:bg-zinc-800 focus:ring-zinc-300',
  secondary:
    'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 focus:ring-zinc-200',
  danger: 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-200',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-200',
};

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    loading = false,
    icon,
    children,
    disabled,
    className = '',
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {!loading && icon}
      <span>{children}</span>
    </button>
  );
});
