import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Mail, Phone, User } from "lucide-react";
import { PersonStatus } from "@prisma/client";
import { requireAdmin, getPersonById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pathWithLocale } from "@/lib/i18n/path";
import { Badge } from "@/components/ui/badge";
import type { Dict } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

function genderLabel(gender: string, t: Dict) {
  switch (gender) {
    case "MALE": return t.people.male;
    case "FEMALE": return t.people.female;
    case "OTHER": return t.people.other;
    case "PREFER_NOT_TO_SAY": return t.people.preferNotToSay;
    default: return gender;
  }
}

function statusVariant(status: PersonStatus) {
  switch (status) {
    case "ACTIVE": return "success" as const;
    case "INACTIVE": return "secondary" as const;
    case "SUSPENDED": return "warning" as const;
  }
}

function statusLabel(status: PersonStatus, t: Dict) {
  switch (status) {
    case "ACTIVE": return t.common.active;
    case "INACTIVE": return t.common.inactive;
    case "SUSPENDED": return t.common.suspended;
  }
}

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const [t, locale] = await Promise.all([
    getDictionary(),
    getLocale(),
  ]);
  const { id } = await params;
  const person = await getPersonById(id);

  if (!person) notFound();

  return (
    <div>
      <Link
        href={pathWithLocale(locale, "/admin/association-members")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.people.back}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-lg font-semibold text-primary">
            {person.fullName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">
                {person.fullName}
              </h1>
              <Badge variant={statusVariant(person.status)}>
                {statusLabel(person.status, t)}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.people.profile.age(person.age)} · {genderLabel(person.gender, t)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            {t.people.profile.personalInfo}
          </h2>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.fullName}</dt>
                <dd className="whitespace-normal break-words text-sm font-medium text-foreground">
                  {person.fullName}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.dateOfBirth}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDate(person.dateOfBirth, locale)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.gender}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {genderLabel(person.gender, t)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            {t.people.profile.contactInfo}
          </h2>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.email}</dt>
                <dd className="whitespace-normal break-words text-sm font-medium text-foreground">
                  {person.email ?? "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.phone}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {person.phone ?? "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.address}</dt>
                <dd className="whitespace-normal break-words text-sm font-medium text-foreground">
                  {person.address ?? "—"}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 md:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            {t.people.profile.membershipInfo}
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.membershipDate}</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDate(person.membershipDate, locale)}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">{t.people.status}</dt>
                <dd>
                  <Badge variant={statusVariant(person.status)}>
                    {statusLabel(person.status, t)}
                  </Badge>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
