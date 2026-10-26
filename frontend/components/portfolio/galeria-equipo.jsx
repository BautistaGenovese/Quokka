"use client";

import { useId, useMemo, useRef, useState } from "react";
import useScrollCarousel from "@/hooks/use-carrusel-scroll";
import Image from "next/image";
import CircularGallery from "@/components/ui/CircularGalleryCards";
import FlipCard from "@/components/ui/FlipCard";
import Section from "@/components/layout/section";
import CarouselMobileControls from "@/components/ui/carousel-mobile-controls";
import Button from "@/components/ui/button";
import "./galeria-equipo.css";

export default function TeamGallery({ members }) {
  const id = useId();
  const stage = useRef(null), gallery = useRef(null);
  useScrollCarousel(stage, gallery, members.length);
  const helpId = `${id}-help`;
  const stageId = `${id}-stage`;
  const [active, setActive] = useState(0);
  const [flippedIndex, setFlippedIndex] = useState(null);
  // Fotos que no pudieron cargarse: esas tarjetas vuelven a mostrar las iniciales
  const [fotosFallidas, setFotosFallidas] = useState({});
  const items = useMemo(() => members.map(member => ({
    text: member.name,
  })), [members]);
  if (!members.length) return null;
  const index = active % members.length;
  const member = members[index];
  const changePerson = next => {
    setActive(next);
    setFlippedIndex(null);
  };

  return <div className="team-gallery">
    <p id={helpId} className="sr-only">Arrastrá o usá las flechas para conocer al equipo. Tocá la tarjeta central para girarla y ver sus responsabilidades.</p>
    <div ref={stage} id={stageId} className="team-gallery-stage" data-cursor-quiet="true">
      <CircularGallery ref={gallery} items={items} bend={3} scrollEase={0.12}
        onActiveChange={changePerson} aria-label="Integrantes de Quokka"
        aria-describedby={helpId}
        renderItem={(item, i) => <FlipCard axis="y" flipOnClick draggable={false}
          flipped={flippedIndex === i} onFlipChange={flipped => setFlippedIndex(flipped ? i : null)}
          tilt
          perspective={1100} width={300} height={400} radius={14}
          background="var(--s-bg)" color="var(--s-fg)"
          ariaLabel={`Girar tarjeta de ${members[i].name}`} className={`team-flip-card team-person-${i % 3}`}
          front={<div className="team-flip-front">
            {members[i].portrait && !fotosFallidas[members[i].portrait] ? <Image src={members[i].portrait} alt={item.text} width={300} height={400} sizes="(max-width: 767px) 240px, 300px" draggable={false} onError={() => setFotosFallidas(previas => ({ ...previas, [members[i].portrait]: true }))} /> : <>
              <span className="team-monogram-meta" aria-hidden="true">Quokka studio <span>0{i + 1} / 05</span></span>
              <span className="team-monogram" aria-hidden="true">{item.text.split(/\s+/).slice(0, 2).map(word => word[0]).join("")}</span>
              <span className="team-monogram-rings" aria-hidden="true" />
            </>}
            <div className={`team-flip-caption${members[i].portrait && !fotosFallidas[members[i].portrait] ? " team-flip-caption--foto" : ""}`}><h3>{item.text}</h3><p>Tocá para conocerme</p></div>
          </div>}
          back={<Section as="div" surface="card" className="team-flip-back">
            <p className="team-flip-eyebrow">El colectivo · {String(i + 1).padStart(2, "0")}</p>
            <h3>{members[i].name}</h3>
            <p className="team-flip-role">{members[i].role}</p>
            <p className="team-flip-description">{members[i].description}</p>
            <p className="team-flip-return">Tocá para volver</p>
          </Section>} />}
      />
    </div>
    <p className="sr-only" aria-live="polite" aria-atomic="true">{index + 1} / {members.length} · {member.name}</p>
    <div className="team-gallery-pagination" role="group" aria-label="Elegir integrante">
      {members.map((person, i) => <button key={person.name} type="button"
        aria-label={`Ver a ${person.name}`} aria-controls={stageId} aria-current={i === index ? "true" : undefined}
        onClick={() => gallery.current?.goTo(i)}><span aria-hidden="true" /></button>)}
    </div>
    <p className="team-gallery-mobile-help">{index + 1} de {members.length} · Deslizá para conocer al equipo</p>
    <div className="team-gallery-footer">
      {members.length > 1 && <CarouselMobileControls label="Personas" controls={stageId} onPrevious={() => gallery.current?.prev()} onNext={() => gallery.current?.next()} />}
      <div className="team-gallery-profile">{member.profileHref && <Button href={member.profileHref} aria-label={`GitHub de ${member.name}`} magnetic={false} variant="secondary" size="sm" target="_blank" rel="noopener noreferrer">Ver GitHub</Button>}</div>
    </div>
  </div>;
}
