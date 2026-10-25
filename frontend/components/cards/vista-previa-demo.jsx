import Image from "next/image";

export default function DemoPreview({ src, alt, sizes = "(max-width: 768px) 82vw, 608px" }) {
  return <div className="demo-preview-media"><Image src={src} alt={alt} fill sizes={sizes} draggable={false} /></div>;
}
