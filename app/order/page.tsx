import type { Metadata } from "next";
import { OrderForm } from "@/components/order-form";
import { getWorks } from "@/lib/works-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order a Service",
  description: "Order a web system, brand identity, or conversion project from Designs by imehappen.",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ work?: string }>;
}) {
  const { work } = await searchParams;
  const works = await getWorks();
  const preselected = works.find((w) => w.slug === work)?.slug ?? "";

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">Order a Service</h1>
        <p className="mt-3 text-fg-muted">
          Tell me what you need — you&apos;ll get a scoped quote and timeline by email within one business day.
        </p>
      </header>
      <OrderForm
        works={works.map((w) => ({
          slug: w.slug,
          title: w.title,
          priceFrom: w.priceFrom,
          deliveryWeeks: w.deliveryWeeks,
        }))}
        preselected={preselected}
      />
    </div>
  );
}
