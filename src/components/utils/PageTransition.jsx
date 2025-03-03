"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function PageTransition({ gameId, onFinish }) {
    const titleRef = useRef([]);
    const [hasSeenTransition, setHasSeenTransition] = useState(false);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const seen = localStorage.getItem(`seenTransition-${gameId}`);
        
        if (seen) {
          setHasSeenTransition(true);
          onFinish(); // On termine immédiatement si la transition a déjà été vue
          return;
        } else {
          localStorage.setItem(`seenTransition-${gameId}`, "true"); // On marque la transition comme vue
        }
      }
  
      // Animation Flip comme sur la GameCardHome mais SANS hover
      gsap.fromTo(
        titleRef.current,
        { rotateY: 0 },
        {
          rotateY: 360,
          duration: 3,
          stagger: 0.05,
          ease: "power2.out",
          onComplete: onFinish, // Ferme la transition après l'animation
        }
      );
  
      return () => {
        gsap.killTweensOf(titleRef.current); // Arrête l'animation si on change de page
      };
    }, [gameId, onFinish]);
  
    if (hasSeenTransition) return null; // 🔥 Ne pas afficher la transition si déjà vue

  return (
    <motion.div
      className="pageTransition"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 3 }}
    >
      <div className="pageTransition__container">
        <div className="container__title">
          {"Création de la partie...".split(" ").map((word, wordIndex) => (
            <span key={wordIndex} style={{ marginRight: "10px", display: "inline-block" }}>
              {word.split("").map((letter, index) => (
                <span
                  key={index}
                  ref={(el) => (titleRef.current[wordIndex * 10 + index] = el)}
                  style={{ display: "inline-block" }}
                >
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
