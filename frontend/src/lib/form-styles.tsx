const validFieldStyle =
  '!border-green-500 !text-green-500 focus-visible:!border-green-500 focus-visible:!ring-green-500/50';

const invalidFieldStyle =
  '!border-destructive !text-destructive focus-visible:!border-destructive focus-visible:!ring-destructive/50';

export function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

export function getFieldStyle(isValid: boolean, hasValue?: boolean) {
  if (!hasValue) {
    return '';
  }

  return isValid ? validFieldStyle : invalidFieldStyle;
}
