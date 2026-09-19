import { ContentSection } from "@/app/admin/content-section";

export default function AdminAboutPage() {
  return (
    <ContentSection
      title="About"
      description="The about story on the home page and the /about page."
      section="about"
      fields={[
        { name: "heading", label: "Heading" },
        { name: "paragraph1", label: "Paragraph 1", type: "textarea" },
        { name: "paragraph2", label: "Paragraph 2", type: "textarea" },
        { name: "image", label: "Portrait image path", hint: "Path under /public, e.g. /images/templatemo-about-artist.jpg" },
        { name: "imageAlt", label: "Portrait alt text" },
        { name: "stat1Value", label: "Stat 1 value", hint: "e.g. 300+" },
        { name: "stat1Label", label: "Stat 1 label" },
        { name: "stat2Value", label: "Stat 2 value" },
        { name: "stat2Label", label: "Stat 2 label" },
        { name: "stat3Value", label: "Stat 3 value" },
        { name: "stat3Label", label: "Stat 3 label" },
      ]}
    />
  );
}
