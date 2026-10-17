"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type MapItem = {
  id: number;
  name: string;
  price: string;
  image: string;
};

const maps: MapItem[] = [
  {
    id: 1,
    name: "Dominican Republic",
    price: "$12.99",
    image: "/maps/map1.png",
  },
  {
    id: 2,
    name: "US Virgin Islands",
    price: "$14.99",
    image: "/maps/map2.png",
  },
  {
    id: 3,
    name: "Jamaica",
    price: "$12.99",
    image: "/maps/map3.png",
  },
  {
    id: 4,
    name: "Bahamas",
    price: "$16.99",
    image: "/maps/map4.png",
  },
  {
    id: 5,
    name: "Puerto Rico",
    price: "$13.99",
    image: "/maps/map5.png",
  },
];

export default function SimilarMaps() {
  const { t } = useLanguage();
  return (
    <section className="py-16">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {t("maps.similar_maps") || "SIMILAR MAPS"}
          </h2>

          <Link
            href="/collections"
            className="text-yellow-500 font-semibold hover:underline"
          >
            {t("maps.view_all_collections") || "View All Collections →"}
          </Link>
        </div>

        {/* Carousel */}
        <Carousel opts={{ align: "start" }}>
          <CarouselContent>
            {maps.map((map) => (
              <CarouselItem
                key={map.id}
                className="basis-full sm:basis-1/2 lg:basis-1/4"
              >
                <div className="space-y-4">
                  {/* Image Card */}
                  <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={map.image}
                      alt={map.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
                      {map.name}
                    </p>

                    <p className="text-yellow-500 font-semibold mt-1">
                      {map.price}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
