export function Label({ htmlFor, children, ...props }: any) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground" {...props}>
      {children}
    </label>
  )
}
