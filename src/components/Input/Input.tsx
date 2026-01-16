import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  inputSize?: 'small' | 'medium' | 'large';
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      fullWidth = true,
      inputSize = 'medium',
      required,
      className = '',
      ...props
    },
    ref
  ) => {
    const wrapperClasses = [
      styles.inputWrapper,
      error && styles.error,
      !error && props.value && styles.success,
      inputSize && styles[inputSize],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses} style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <div className={styles.inputContainer}>
          <input
            ref={ref}
            className={`${styles.input} ${icon ? styles.withIcon : ''}`}
            required={required}
            {...props}
          />
          {icon && <span className={styles.icon}>{icon}</span>}
        </div>

        {error && <span className={styles.errorText}>⚠ {error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      required,
      className = '',
      ...props
    },
    ref
  ) => {
    const wrapperClasses = [
      styles.inputWrapper,
      error && styles.error,
      !error && props.value && styles.success,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses} style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={`${styles.input} ${styles.textarea}`}
          required={required}
          {...props}
        />

        {error && <span className={styles.errorText}>⚠ {error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
