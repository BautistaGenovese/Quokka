import AnimatedHeading from "@/components/ui/animated-heading";

export default function SectionHeading({ number, label, children, description }) {
  return <div className="studio-section-heading">
    <p className="studio-eyebrow"><span>{number}</span> {label}</p>
    <div><AnimatedHeading as="h2">{children}</AnimatedHeading>{description && <p className="studio-section-description">{description}</p>}</div>
  </div>;
}

