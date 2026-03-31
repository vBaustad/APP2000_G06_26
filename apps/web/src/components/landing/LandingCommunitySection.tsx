/**
 * Fil: LandingCommunitySection.tsx
 * Utvikler(e): Ramona Cretulescu
 * Beskrivelse:
 * Seksjon på landingssiden som viser brukeromtaler og anbefalte turer.
 * Komponenten støtter oppgavens sosiale del ved å synliggjøre delte
 * turopplevelser, enkle anmeldelser og videre navigering til turer.
 */

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Route as RouteIcon,
  Star,
} from "lucide-react";

type CommunityPost = {
  id: number;
  userName: string;
  postedAgo: string;
  tourTitle: string;
  location: string;
  distance: string;
  duration: string;
  rating: number;
  likes: number;
  comments: number;
  review: string;
  image: string;
  to: string;
};

const communityPosts: CommunityPost[] = [
  {
    id: 1,
    userName: "Ingrid Nilsen",
    postedAgo: "2 timer siden",
    tourTitle: "Trolltunga",
    location: "Odda, Vestland",
    distance: "27 km",
    duration: "11 timer",
    rating: 4.8,
    likes: 47,
    comments: 8,
    review:
      "Krevende tur, men helt verdt det. Utsikten på toppen gjorde hele turen minneverdig.",
    image: "/images/tours/fjell3.jpg",
    to: "/explore",
  },
  {
    id: 2,
    userName: "Emma Johansen",
    postedAgo: "1 dag siden",
    tourTitle: "Reinebringen",
    location: "Reine, Nordland",
    distance: "3 km",
    duration: "2 timer",
    rating: 4.7,
    likes: 89,
    comments: 15,
    review:
      "Kort, bratt og veldig fin tur. Perfekt for dem som vil ha utsikt uten heldagstur.",
    image: "/images/tours/fjell4.jpg",
    to: "/explore",
  },
  {
    id: 3,
    userName: "Sofie Hansen",
    postedAgo: "3 dager siden",
    tourTitle: "Bryggen i Bergen",
    location: "Bergen, Vestland",
    distance: "2 km",
    duration: "1.5 timer",
    rating: 4.5,
    likes: 34,
    comments: 6,
    review:
      "Rolig og lett tur i bymiljø. Passer fint som en kort opplevelse med historie og utsikt.",
    image: "/images/tours/fjell6.jpg",
    to: "/explore",
  },
  {
    id: 4,
    userName: "Lars Berg",
    postedAgo: "2 dager siden",
    tourTitle: "Besseggen",
    location: "Jotunheimen, Innlandet",
    distance: "17 km",
    duration: "7 timer",
    rating: 4.9,
    likes: 156,
    comments: 19,
    review:
      "Klassiker med sterk naturopplevelse. Litt folksomt, men absolutt en tur jeg anbefaler.",
    image: "/images/tours/fjell7.jpg",
    to: "/explore",
  },
  {
    id: 5,
    userName: "Ole Andersen",
    postedAgo: "4 dager siden",
    tourTitle: "Galdhøpiggen",
    location: "Lom, Innlandet",
    distance: "10 km",
    duration: "8 timer",
    rating: 4.8,
    likes: 203,
    comments: 24,
    review:
      "Krevende tur, men følelsen på toppen er helt spesiell. Best for dem som vil ha en skikkelig fjelltur.",
    image: "/images/tours/fjell8.jpg",
    to: "/explore",
  },
  {
    id: 6,
    userName: "Erik Solberg",
    postedAgo: "1 uke siden",
    tourTitle: "Vøringsfossen",
    location: "Eidfjord, Vestland",
    distance: "2 km",
    duration: "1 time",
    rating: 4.6,
    likes: 112,
    comments: 11,
    review:
      "Kort og lett tur med flott utsikt. Passer godt for en rolig dagstur med familie.",
    image: "/images/tours/fjell10.jpg",
    to: "/explore",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LandingCommunitySection() {
  return (
    <section className="py-20">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#0f3d2e]">
            Brukeromtaler og anbefalinger
          </p>

          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Turer andre anbefaler
          </h2>

          <p className="mt-3 text-lg leading-8 text-slate-600">
            Se korte omtaler fra brukere som har gått turene før deg, og finn
            inspirasjon til neste tur.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 font-medium text-[#0f3d2e] hover:underline"
        >
          Se flere turer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {communityPosts.map((post) => (
          <article
            key={post.id}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcebe4] text-sm font-semibold text-[#0f3d2e]">
                  {getInitials(post.userName)}
                </div>

                <div>
                  <p className="font-medium text-slate-900">{post.userName}</p>
                  <p className="text-sm text-slate-500">{post.postedAgo}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {post.rating}
              </div>
            </div>

            <div
              className="relative mb-4 h-48 overflow-hidden rounded-2xl bg-slate-200 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(15,61,46,0.05) 0%, rgba(15,61,46,0.72) 100%), url(${post.image})`,
              }}
            >
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-2xl font-semibold text-white">
                  {post.tourTitle}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-100">
                  <MapPin className="h-4 w-4" />
                  {post.location}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <RouteIcon className="h-4 w-4 text-[#0f3d2e]" />
                {post.distance}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-4 w-4 text-[#0f3d2e]" />
                {post.duration}
              </span>
            </div>

            <p className="mb-5 leading-7 text-slate-700">{post.review}</p>

            <div className="mb-5 flex items-center gap-5 text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Heart className="h-5 w-5 text-[#0f3d2e]" />
                {post.likes}
              </span>
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#0f3d2e]" />
                {post.comments}
              </span>
            </div>

            <div className="mt-auto border-t border-slate-200 pt-4">
              <Link
                to={post.to}
                className="inline-flex items-center gap-2 font-semibold text-[#0f3d2e] hover:underline"
              >
                Se tur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}