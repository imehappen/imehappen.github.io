import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { getContactContent } from "@/lib/site-content";
import { TwoToneHeading } from "@/components/typed-heading";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Designs by imehappen — Nairobi-based systems developer & designer.",
};

export default async function ContactPage() {
  const contact = await getContactContent();

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-24 pt-28 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
      <Reveal>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <TwoToneHeading text={contact.heading} />
        </h1>
        <p className="mt-4 text-fg-muted">{contact.intro}</p>

        <dl className="mt-10 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Email</dt>
            <dd className="mt-2 break-words text-sm text-fg">
              <a href={`mailto:${contact.email}`} className="cursor-pointer hover:text-accent">
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phone</dt>
            <dd className="mt-2 text-sm text-fg">
              <a href={`tel:${contact.phone}`} className="cursor-pointer hover:text-accent">
                {contact.phoneDisplay}
              </a>
            </dd>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Studio</dt>
            <dd className="mt-2 text-sm text-fg">{contact.location}</dd>
          </div>
        </dl>
      </div>
      </Reveal>

      <Reveal>
      <ContactForm />
      </Reveal>
    </div>
  );
}
