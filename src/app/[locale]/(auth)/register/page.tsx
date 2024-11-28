import { RegisterForm } from "@/components/register-form";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RegisterPage({ params }: IDefaultLayoutProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <main className="flex items-center justify-center flex-1">
      <RegisterForm />
    </main>
  );
}
