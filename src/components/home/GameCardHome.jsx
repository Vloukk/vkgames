import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function GameCardHome({ title, text, icon, link, color, animation }) {
  const [isExpanded, setIsExpanded] = useState(false); // État pour savoir si la carte est agrandie
  const cardRef = useRef(null); // Référence pour la carte entière
  const titleRef = useRef([]); // Référence pour les lettres du titre
  const createRef = useRef(null); // Référence pour la section GameCardHome__create

  useEffect(() => {
    const animateLetters = (reverse = false) => {
      let tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });

      if (animation === "flip") {
        tl.fromTo(
          titleRef.current,
          { rotateY: reverse ? 360 : 0 },
          { rotateY: reverse ? 0 : 360, stagger: 0.05 }
        );
      } else if (animation === "wave") {
        tl.fromTo(
          titleRef.current,
          { y: reverse ? -10 : 0 },
          { y: reverse ? 0 : -10, stagger: 0.05, repeat: 1, yoyo: true }
        );
      } else if (animation === "bounce") {
        tl.fromTo(
          titleRef.current,
          { scale: reverse ? 1.2 : 1 },
          { scale: reverse ? 1 : 1.2, stagger: 0.05, repeat: 1, yoyo: true }
        );
      }
    };

    // Attacher les événements de hover à la carte entière
    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener("mouseenter", () => animateLetters(false));
      cardElement.addEventListener("mouseleave", () => animateLetters(true));
    }

    return () => {
      if (cardElement) {
        cardElement.removeEventListener("mouseenter", () => animateLetters(false));
        cardElement.removeEventListener("mouseleave", () => animateLetters(true));
      }
    };
  }, [animation]);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded); // Alterner l'état de la carte (expand / collapse)

    // Appliquer l'animation GSAP pour agrandir ou rétrécir
    const cardElement = cardRef.current;
    const createElement = createRef.current;

    // Animation de la carte
    gsap.to(cardElement, {
      height: isExpanded ? "35vh" : "45vh",
      duration: 0.5,
      ease: "power2.out",
    });

    // Animation de la section GameCardHome__create
    if (isExpanded) {
      // Si la carte se rétracte, réduire l'opacité et masquer le formulaire
      gsap.to(createElement, {
        opacity: 0,
        y: 20, // Ou déplace le formulaire vers le bas pour simuler sa disparition
        duration: 0.8,
        ease: "power2.out",
      });
    } else {
      // Si la carte s'agrandit, rendre visible le formulaire avec un délai
      gsap.fromTo(
        createElement,
        {
          opacity: 0, // Le formulaire commence invisible
          y: 20, // Position décalée
        },
        {
          opacity: 1, // Remettre le formulaire visible
          y: 0, // Remettre le formulaire à sa position d'origine
          duration: 0.8,
          ease: "power2.out",
          delay: 0.3, // Délai avant de commencer l'animation d'affichage
        }
      );
    }
  };

  // Fonction pour stopper la propagation du clic sur le formulaire
  const handleFormClick = (e) => {
    e.stopPropagation(); // Empêche le clic d'affecter l'élément parent (la carte)
  };

  return (
    <div className="GameCardHome" ref={cardRef} onClick={handleCardClick}> {/* Ajout du click handler */}
      <div className="GameCardHome__info">
        <div className="info__title" style={{ color }}>
          <div className="title">
            {title.split("").map((letter, index) => (
              <span
                key={index}
                ref={(el) => (titleRef.current[index] = el)} // Ref pour chaque lettre
                style={{ display: "inline-block" }}
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="img">
            <img src={icon} alt={`${title}`} />
          </div>
        </div>
        <div className="info__rules">
          <p>{text}</p>
        </div>
      </div>
      <div className="GameCardHome__create" ref={createRef}>
        {isExpanded && (
          <form className="create__form" onClick={handleFormClick}>
            <p>Choisissez votre pseudo</p>
            <div className="form__info">
              <input type="text" placeholder="Votre pseudo..." />
              <button
                type="submit"
                className="button"
                style={{ backgroundColor: color }} // Ici, la couleur récupérée du JSON pour le background
              >
                Let's goooo
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
