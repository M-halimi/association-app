import Link from "next/link";
import { Users } from "lucide-react";
import { UserStatus } from "@prisma/client";
import { requireAdmin, getMembersList, getAssociation } from "@/lib/data";
import { formatAmount, formatMonthYear } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/server";
import { getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddMemberButton, EditMemberButton } from "@/components/members/member-dialogs";
import { MemberStatusButton } from "@/components/members/member-status-button";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireAdmin();
  const [members, settings, t, locale] = await Promise.all([
    getMembersList(),
    getAssociation(),
    getDictionary(),
    getLocale(),
  ]);

  return (
    <div>
      <PageHeader
        title={t.members.title}
        description={t.members.description}
        action={<AddMemberButton />}
      />

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t.members.noMembers}
          description={t.members.noMembersDescription}
          action={<AddMemberButton />}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.members.name}</TableHead>
                <TableHead>{t.members.email}</TableHead>
                <TableHead>{t.members.phone}</TableHead>
                <TableHead className="text-end">{t.members.totalContributions}</TableHead>
                <TableHead className="text-end">{t.members.transactionCount}</TableHead>
                <TableHead>{t.members.status}</TableHead>
                <TableHead>{t.members.joined}</TableHead>
                <TableHead className="text-end">{t.members.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="whitespace-normal break-words font-medium">
                    <Link
                      href={pathWithLocale(locale, `/admin/members/${member.id}`)}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {member.name}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-normal break-words text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {member.phone ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-end font-medium tabular-nums text-foreground">
                    {formatAmount(member.totalApproved, settings.currency, locale)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums text-muted-foreground">
                    {member.transactionCount}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.status === UserStatus.ACTIVE ? "success" : "secondary"}
                    >
                      {member.status === UserStatus.ACTIVE
                        ? t.common.active
                        : t.common.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatMonthYear(member.createdAt, locale)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={pathWithLocale(locale, `/admin/members/${member.id}`)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t.common.view}
                      </Link>
                      <EditMemberButton
                        member={{
                          id: member.id,
                          name: member.name,
                          email: member.email,
                          phone: member.phone,
                        }}
                      />
                      <MemberStatusButton
                        memberId={member.id}
                        memberName={member.name}
                        isActive={member.status === UserStatus.ACTIVE}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}