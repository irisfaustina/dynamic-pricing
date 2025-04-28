import Link from "next/link";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { createURL } from "@/lib/utils";

export function TimezoneDropdownMenuItem({
  searchParams,
  timezone,
}: {
  searchParams: Record<string, string | undefined>;
  timezone: string;
}) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <DropdownMenuItem asChild>
      <Link
        href={createURL("/dashboard/analytics", searchParams, {
          timezone: userTimezone,
        })}
      >
        {userTimezone}
      </Link>
    </DropdownMenuItem>
  );
}
