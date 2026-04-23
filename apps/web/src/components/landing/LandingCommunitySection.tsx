/**
 * Fil: LandingCommunitySection.tsx
 * Utvikler(e): Ramona Cretulescu. Copilot er brukt som guide og lærer i utviklingen av denne siden.
 * Beskrivelse:
 * Seksjon på landingssiden som viser brukeromtaler og anbefalte turer.
 * Komponenten støtter oppgavens sosiale del ved å synliggjøre delte
 * turopplevelser, enkle anmeldelser og videre navigering til turer.
 */

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Route as RouteIcon,
  Star,
} from "lucide-react";
import type { Tour } from "../../types/tour";

type LandingCommunitySectionProps = {
  tours: Tour[];
};

const fallbackImages = [
  "/images/tours/fjell3.jpg",
  "/images/tours/fjell4.jpg",
  "/images/tours/fjell6.jpg",
  "/images/tours/fjell7.jpg",
  "/images/tours/fjell8.jpg",
  "/images/tours/fjell10.jpg",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getFallbackImage(index: number) {
  return fallbackImages[index % fallbackImages.length];
}

function getDisplayName(tour: Tour) {
  const comments = tour.social?.commentCount ?? 0;
  const rating = tour.social?.averageRating ?? null;

  if (comments > 0 && tour.social?.latestCommentFirstName) {
    return tour.social.latestCommentFirstName;
  }

  if (rating !== null && tour.social?.ownerFirstName) {
    return tour.social.ownerFirstName;
  }

  return null;
}

function hasDisplayableSocialProof(tour: Tour) {
  const hasName =
    Boolean(tour.social?.ownerFirstName) ||
    Boolean(tour.social?.latestCommentFirstName);

  const comments = tour.social?.commentCount ?? 0;
  const rating = tour.social?.averageRating ?? null;
  const likes = tour.social?.likeCount ?? 0;

  return hasName && (comments > 0 || rating !== null || likes > 0);
}

export default function LandingCommunitySection({
  tours,
}: LandingCommunitySectionProps) {
  const { t } = useTranslation("forside");
  const recommendedTours = tours.filter(hasDisplayableSocialProof).slice(0, 6);

  function buildReview(tour: Tour) {
    if (tour.description && tour.description.trim()) {
      return tour.description;
    }
    return t("community.fallbackReview");
  }

  function formatPostedAgo(dateString?: string | null) {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;

    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return t("community.time.recent");
    if (diffHours < 24) return t("community.time.hoursAgo", { count: diffHours });
    if (diffDays === 1) return t("community.time.dayAgo");
    if (diffDays < 7) return t("community.time.daysAgo", { count: diffDays });

    return t("community.time.whileAgo");
  }

  function getSubtitleText(tour: Tour) {
    const comments = tour.social?.commentCount ?? 0;

    if (comments > 0) {
      return formatPostedAgo(tour.social?.latestCommentCreatedAt) ?? t("community.time.recent");
    }

    if ((tour.social?.averageRating ?? null) !== null) {
      return t("community.rated");
    }

    return null;
  }

  if (recommendedTours.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            {t("community.eyebrow")}
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {t("community.title")}
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            {t("community.intro")}
          </p>
        </div>

        <Link
          to="/turer"
          className="inline-flex items-center gap-2 font-medium text-[#0f3d2e] hover:underline"
        >
          {t("community.seeMore")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {recommendedTours.map((tour, index) => {
          const image = tour.imageUrl?.trim()
            ? tour.imageUrl
            : getFallbackImage(index);

          const userName = getDisplayName(tour);
          if (!userName) return null;

          const subtitleText = getSubtitleText(tour) || t("community.time.recent");
          const averageRating = tour.social?.averageRating ?? null;
          const likes = tour.social?.likeCount ?? 0;
          const comments = tour.social?.commentCount ?? 0;

          return (
            <article
              key={tour.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcebe4] text-sm font-semibold text-[#0f3d2e]">
                    {getInitials(userName)}
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-500">{subtitleText}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  {averageRating !== null ? averageRating.toFixed(1) : "–"}
                </div>
              </div>

              <div
                className="relative mb-4 h-48 overflow-hidden rounded-2xl bg-slate-200 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(15,61,46,0.05) 0%, rgba(15,61,46,0.72) 100%), url(${image})`,
                }}
              >
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-2xl font-semibold text-white">
                    {tour.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-100">
                    <MapPin className="h-4 w-4" />
                    {tour.location}, {tour.region}
                  </p>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <RouteIcon className="h-4 w-4 text-[#0f3d2e]" />
                  {tour.distanceKm} km
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-4 w-4 text-[#0f3d2e]" />
                  {tour.durationHours} {t("community.unitHours")}
                </span>
              </div>

              <p className="mb-5 line-clamp-3 leading-7 text-slate-700">
                {buildReview(tour)}
              </p>

              <div className="mb-5 flex items-center gap-5 text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#0f3d2e]" />
                  {likes}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#0f3d2e]" />
                  {comments}
                </span>
              </div>

              <div className="mt-auto border-t border-slate-200 pt-4">
                <Link
                  to={`/turer/${tour.id}`}
                  className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
                >
                  {t("community.seeTour")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
