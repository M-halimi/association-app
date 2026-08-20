import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LinkButton({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  return (
    <Button asChild {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}