"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { PersonGender, PersonStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditPersonButton } from "@/components/people/people-dialogs";
import { DeletePersonButton } from "@/components/people/people-delete-dialog";
import { useI18n } from "@/lib/i18n/client";
import type { PersonListItem } from "@/lib/data";
import { formatDate } from "@/lib/format";

function statusVariant(status: PersonStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "INACTIVE":
      return "secondary" as const;
    case "SUSPENDED":
      return "warning" as const;
  }
}

function statusLabel(status: PersonStatus, t: ReturnType<typeof useI18n>["t"]) {
  switch (status) {
    case "ACTIVE":
      return t.common.active;
    case "INACTIVE":
      return t.common.inactive;
    case "SUSPENDED":
      return t.common.suspended;
  }
}

function genderLabel(gender: PersonGender, t: ReturnType<typeof useI18n>["t"]) {
  switch (gender) {
    case "MALE":
      return t.people.male;
    case "FEMALE":
      return t.people.female;
    case "OTHER":
      return t.people.other;
    case "PREFER_NOT_TO_SAY":
      return t.people.preferNotToSay;
  }
}

export function PeopleTable({
  people,
  total,
  page,
  pageSize,
  locale,
}: {
  people: PersonListItem[];
  total: number;
  page: number;
  pageSize: number;
  locale: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (updates.search !== undefined || updates.gender !== undefined || updates.status !== undefined || updates.from !== undefined || updates.to !== undefined) {
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams],
  );

  function navigate(queryString: string) {
    startTransition(() => {
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.people.searchPlaceholder}
            className="ps-8"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              navigate(createQueryString({ search: value }));
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={searchParams.get("gender") ?? "all"}
            onValueChange={(value) =>
              navigate(createQueryString({ gender: value }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t.people.allGenders} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.people.allGenders}</SelectItem>
              <SelectItem value="MALE">{t.people.male}</SelectItem>
              <SelectItem value="FEMALE">{t.people.female}</SelectItem>
              <SelectItem value="OTHER">{t.people.other}</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">
                {t.people.preferNotToSay}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) =>
              navigate(createQueryString({ status: value }))
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder={t.people.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.people.allStatuses}</SelectItem>
              <SelectItem value="ACTIVE">{t.common.active}</SelectItem>
              <SelectItem value="INACTIVE">{t.common.inactive}</SelectItem>
              <SelectItem value="SUSPENDED">{t.common.suspended}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">{t.people.noResults}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>{t.people.fullName}</TableHead>
                  <TableHead>{t.people.age}</TableHead>
                  <TableHead>{t.people.gender}</TableHead>
                  <TableHead>{t.people.phone}</TableHead>
                  <TableHead>{t.people.email}</TableHead>
                  <TableHead>{t.people.membershipDate}</TableHead>
                  <TableHead>{t.people.status}</TableHead>
                  <TableHead className="text-end">{t.people.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="whitespace-normal break-words font-medium">
                      <Link
                        href={`/${locale}/admin/association-members/${person.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {person.fullName}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {t.people.yearsOld(person.age)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {genderLabel(person.gender, t)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {person.phone ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words text-muted-foreground">
                      {person.email ?? "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(person.membershipDate, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(person.status)}>
                        {statusLabel(person.status, t)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/${locale}/admin/association-members/${person.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {t.common.view}
                        </Link>
                        <EditPersonButton
                          person={{
                            id: person.id,
                            fullName: person.fullName,
                            dateOfBirth: person.dateOfBirth.toISOString(),
                            gender: person.gender,
                            phone: person.phone,
                            email: person.email,
                            address: person.address,
                            membershipDate: person.membershipDate.toISOString(),
                            status: person.status,
                          }}
                        />
                        <DeletePersonButton
                          personId={person.id}
                          personName={person.fullName}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              {t.people.showing(from, to, total)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  navigate(createQueryString({ page: String(page - 1) }))
                }
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                {t.common.back}
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  navigate(createQueryString({ page: String(page + 1) }))
                }
              >
                {t.common.view}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
