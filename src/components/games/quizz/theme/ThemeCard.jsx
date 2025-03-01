import React, { useRef } from "react";
import { gsap } from "gsap";

const ThemeCard = ({ theme, color, isSelected, onSelect }) => {
  const cardRef = useRef(null);
  const transformAmount = 10; // Plus la valeur est élevée, plus l'effet est intense

  const handleMouseMove = (e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = -((e.clientY - centerY) / (rect.height / 2));

    gsap.to(cardRef.current, {
      rotateY: percentX * transformAmount,
      rotateX: percentY * transformAmount,
      transformPerspective: 800,
      ease: "power1.out",
      duration: 0.1,
    });
  };

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      transition: "transform 0.1s",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      ease: "power1.out",
      duration: 0.3,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`themeCard ${isSelected ? "selected" : ""}`}
      style={{
        backgroundColor: color,
        cursor: "pointer",
        perspective: "800px", // Active la 3D
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        console.log("🖱️ [DEBUG] Click sur la carte du thème :", theme);
        onSelect();
      }}
    >
      <div className="themeCard__content">
        <h3>{theme}</h3>
      </div>
    </div>
  );
};

export default ThemeCard;
