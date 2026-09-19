import { ContentSection } from "@/app/admin/content-section";

export default function AdminContactPage() {
  return (
    <ContentSection
      title="Contact"
      description="Contact details shown on the home page and /contact."
      section="contact"
      fields={[
        { name: "heading", label: "Heading" },
        { name: "intro", label: "Intro line", type: "textarea", rows: 2 },
        { name: "email", label: "Email address" },
        { name: "phone", label: "Phone (tel: link)", hint: "Digits only, e.g. +254702483879" },
        { name: "phoneDisplay", label: "Phone (display format)" },
        { name: "location", label: "Location" },
      ]}
    />
  );
}
