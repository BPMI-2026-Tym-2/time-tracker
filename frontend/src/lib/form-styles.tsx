const validFieldStyle =
  'focus-visible:border-none border-green-500 focus-visible:ring-2 focus-visible:ring-green-500/50 text-green-500';

const invalidFieldStyle =
  'focus-visible:border-none border-destructive focus-visible:ring-2 focus-visible:ring-destructive/50 text-destructive';

export function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export function getFieldStyle(isValid: boolean, hasValue: boolean) {
  if (!hasValue) {
    return '';
  }

  return isValid ? validFieldStyle : invalidFieldStyle;
}
