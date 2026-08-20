import { requireAdmin, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const [settings, t] = await Promise.all([getSettings(), getDictionary()]);

  return (
    <div>
      <PageHeader
        title={t.settings.title}
        description={t.settings.pageDescription}
      />
      <SettingsForm
        settings={{
          name: settings.name,
          nameEn: settings.nameEn,
          nameFr: settings.nameFr,
          nameAr: settings.nameAr,
          description: settings.description,
          descriptionEn: settings.descriptionEn,
          descriptionFr: settings.descriptionFr,
          descriptionAr: settings.descriptionAr,
          currency: settings.currency,
          email: settings.email,
          phone: settings.phone,
          logoUrl: settings.logoUrl,
        }}
      />
    </div>
  );
}