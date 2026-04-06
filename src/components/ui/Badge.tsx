type BadgeProps = {
  children: React.ReactNode
  color?: "purple" | "red" | "green" | "yellow" | "blue" | "gray"
}

export default function Badge({ children, color = "gray" }: BadgeProps) {

  return (
    <span className={`badge badge-${color}`}>
      {children}
    </span>
  )
}