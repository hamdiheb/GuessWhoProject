const base =
  "flex-1 py-3 px-5 rounded-full text-[15px] font-bold cursor-pointer transition-[transform,filter,box-shadow,background-color,border-color] duration-200 ease-spring disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100";

const variants = {
  primary:
    "bg-accent text-[#17130b] not-disabled:hover:scale-[1.02] not-disabled:hover:brightness-110 not-disabled:hover:shadow-[0_8px_24px_var(--color-accent-glow)] not-disabled:active:scale-[0.99]",
  secondary:
    "bg-transparent text-accent border border-accent-border not-disabled:hover:bg-accent-soft not-disabled:hover:scale-[1.02] not-disabled:active:scale-[0.99]",
};

function Button({ children, className = "", variant = "primary", ...props }) {
  const variantClass = variants[variant] || variants.primary;

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
