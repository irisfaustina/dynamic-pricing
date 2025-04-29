import Link from "next/link";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { createURL } from "@/lib/utils";

export function TimezoneDropdownMenuItem({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <DropdownMenuItem asChild>
      <Link
        className="w-full block"
        href={createURL("/dashboard/analytics", searchParams, {
          timezone: userTimezone,
        })}
      >
        {userTimezone}
      </Link>
    </DropdownMenuItem>
  );
}
