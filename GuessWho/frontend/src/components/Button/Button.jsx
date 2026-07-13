import styles from "./Button.module.css";

function Button({ children, className = "", variant = "primary", ...props }) {
  const variantClass = styles[variant] || styles.primary;

  return (
    <button className={`${styles.button} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
