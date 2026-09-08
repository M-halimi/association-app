import { Users } from "lucide-react";
import { requireAdmin, getPeopleList, getAssociation } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AddPersonButton } from "@/components/people/people-dialogs";
import { PeopleTable } from "@/components/people/people-table";

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [settings, t, locale] = await Promise.all([
    getAssociation(),
    getDictionary(),
    getLocale(),
  ]);

  const search = typeof params.search === "string" ? params.search : undefined;
  const gender = typeof params.gender === "string" ? params.gender : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const page = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;

  const { people, total, pageSize } = await getPeopleList({
    search,
    gender,
    status,
    from,
    to,
    page,
  });

  return (
    <div>
      <PageHeader
        title={t.people.title}
        description={t.people.description}
        action={<AddPersonButton />}
      />

      {total === 0 && !search && !gender && !status && !from && !to ? (
        <EmptyState
          icon={Users}
          title={t.people.noPeople}
          description={t.people.noPeopleDescription}
          action={<AddPersonButton />}
        />
      ) : (
        <PeopleTable
          people={people}
          total={total}
          page={page}
          pageSize={pageSize}
          locale={locale}
        />
      )}
    </div>
  );
}
