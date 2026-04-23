/**
 * Fil: OmOss.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse: Om Utopia-side som presenterer løsningens formål,
 * målgruppe, verdier, visjon og prosjektkontekst.
 */

import { Link } from "react-router-dom";
import {
  Trees,
  Users,
  ShieldCheck,
  Compass,
  BadgeCheck,
  Accessibility,
  Target,
  Lightbulb,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OmOss() {
  const { t } = useTranslation("info");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative min-h-[340px] overflow-hidden">
        <img
          src="/images/hero-background.jpg"
          alt={t("omOss.hero.imageAlt")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/30" />

        <div className="relative z-10 mx-auto flex min-h-[340px] max-w-7xl items-end px-6 pb-14">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-white/80">
              {t("omOss.hero.eyebrow")}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              {t("omOss.hero.title")}
              <br className="hidden md:block" /> {t("omOss.hero.titleLine2")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 md:text-lg">
              {t("omOss.hero.lead")}
            </p>
          </div>
        </div>
      </section>

      {/* HVA ER UTOPIA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
              {t("omOss.whatIs.badge")}
            </span>

            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              {t("omOss.whatIs.title")}
            </h2>

            <p className="mt-5 text-gray-600">
              {t("omOss.whatIs.p1")}
            </p>

            <p className="mt-4 text-gray-600">
              {t("omOss.whatIs.p2")}
            </p>

            <p className="mt-4 text-gray-600">
              {t("omOss.whatIs.p3")}
            </p>
          </div>

          <div>
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
              <img
                src="/images/tours/fjell10.jpg"
                alt={t("omOss.whatIs.imageAlt")}
                className="h-[380px] w-full object-cover"
              />
              <div className="border-t border-gray-100 p-6">
                <p className="text-sm leading-6 text-gray-600">
                  {t("omOss.whatIs.caption")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMÅL OG MÅLGRUPPE */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{t("omOss.purpose.title")}</h2>
            <p className="mt-4 text-gray-600">
              {t("omOss.purpose.p1")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.purpose.p2")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{t("omOss.audience.title")}</h2>
            <p className="mt-4 text-gray-600">
              {t("omOss.audience.p1")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.audience.p2")}
            </p>
          </div>
        </div>
      </section>

      {/* VÅRE VERDIER */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
            {t("omOss.values.badge")}
          </span>
          <h2 className="mt-4 text-3xl font-semibold text-gray-900">
            {t("omOss.values.title")}
          </h2>
          <p className="mt-4 text-gray-600">
            {t("omOss.values.lead")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Trees className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.natureJoy.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.natureJoy.text")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.community.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.community.text")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.safety.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.safety.text")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.exploration.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.exploration.text")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.quality.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.quality.text")}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Accessibility className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t("omOss.values.accessibility.title")}</h3>
            <p className="mt-3 text-gray-600">
              {t("omOss.values.accessibility.text")}
            </p>
          </div>
        </div>
      </section>

      {/* VISJON */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow ring-1 ring-gray-100 md:p-10">
            <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">{t("omOss.vision.title")}</h2>
            <p className="mt-4 text-gray-600">
              {t("omOss.vision.p1")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.vision.p2")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.vision.p3")}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-700 p-8 text-white shadow md:p-10">
            <h3 className="text-xl font-semibold">{t("omOss.vision.contributeTitle")}</h3>
            <ul className="mt-5 space-y-4 text-white/90">
              <li>{t("omOss.vision.contribute1")}</li>
              <li>{t("omOss.vision.contribute2")}</li>
              <li>{t("omOss.vision.contribute3")}</li>
              <li>{t("omOss.vision.contribute4")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-100">
            <img
              src="/images/tours/fjell11.jpg"
              alt={t("omOss.team.imageAlt")}
              className="h-[340px] w-full object-cover"
            />
          </div>

          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-sm font-semibold tracking-wide text-emerald-900">
              {t("omOss.team.badge")}
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">
              {t("omOss.team.title")}
            </h2>
            <p className="mt-4 text-gray-600">
              {t("omOss.team.p1")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.team.p2")}
            </p>
            <p className="mt-4 text-gray-600">
              {t("omOss.team.p3")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-4">
        <div className="overflow-hidden rounded-3xl bg-emerald-700 px-8 py-12 text-white shadow-lg md:px-12">
          <h2 className="text-3xl font-semibold">
            {t("omOss.cta.title")}
          </h2>
          <p className="mt-4 max-w-3xl text-white/90">
            {t("omOss.cta.text")}
          </p>

          <div className="mt-6">
            <Link
              to="/turer"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-gray-100"
            >
              {t("omOss.cta.link")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
