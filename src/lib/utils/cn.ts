type ClassNameValue = string | false | null | undefined;

export function cn(...classNames: ClassNameValue[]): string {
  return classNames.filter(Boolean).join(" ");
}
