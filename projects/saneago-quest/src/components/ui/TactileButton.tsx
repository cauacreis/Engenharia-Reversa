import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'neutral'
  | 'outline'
  | 'gold';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  customBg?: string;
  customShade?: string;
  customText?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#00B8FF] text-[#041824] border-[#0088C2] hover:bg-[#1EC4FF] active:border-b-0',
  success:
    'bg-[#58CC02] text-[#071F00] border-[#46A302] hover:bg-[#64DE08] active:border-b-0',
  danger:
    'bg-[#FF4B4B] text-white border-[#CC2E2E] hover:bg-[#FF5F5F] active:border-b-0',
  warning:
    'bg-[#FF9600] text-[#1D0F00] border-[#CC7800] hover:bg-[#FFA624] active:border-b-0',
  gold:
    'bg-[#FFC800] text-[#221700] border-[#D19D00] hover:bg-[#FFD22B] active:border-b-0',
  neutral:
    'bg-[#1D2A38] text-[#E8F1F8] border-[#0F1720] hover:bg-[#243445] active:border-b-0',
  outline:
    'bg-[#131C26] text-[#E8F1F8] border-[#28384A] hover:bg-[#1D2A38] active:border-b-0',
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3.5 py-2 text-xs rounded-xl border-b-[3px] active:translate-y-[2px]',
  md: 'px-5 py-3 text-sm rounded-2xl border-b-[4px] active:translate-y-[3px]',
  lg: 'px-6 py-3.5 text-base rounded-2xl border-b-[5px] active:translate-y-[4px]',
};

export function TactileButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  customBg,
  customShade,
  customText,
  className = '',
  style,
  disabled,
  children,
  ...rest
}: TactileButtonProps) {
  const hasCustomColor = Boolean(customBg && customShade);

  const customStyle: React.CSSProperties | undefined = hasCustomColor
    ? {
        backgroundColor: customBg,
        borderColor: customShade,
        color: customText ?? '#071520',
        ...style,
      }
    : style;

  return (
    <button
      disabled={disabled}
      style={customStyle}
      className={[
        'inline-flex items-center justify-center gap-2 font-display font-bold tracking-wide transition-all duration-100 select-none',
        SIZE_CLASSES[size],
        hasCustomColor
          ? 'hover:brightness-105 active:border-b-0'
          : VARIANT_CLASSES[variant],
        fullWidth ? 'w-full' : '',
        disabled
          ? 'opacity-45 cursor-not-allowed active:translate-y-0 pointer-events-none'
          : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
