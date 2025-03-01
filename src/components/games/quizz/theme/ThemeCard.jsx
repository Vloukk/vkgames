import React from "react";

const ThemeCard = ({ theme, color, isSelected, onSelect }) => {
  return (
    <div
      className={`themeCard ${isSelected ? "selected" : ""}`}
      style={{ backgroundColor: color, cursor: "pointer" }}
      onClick={() => {
        console.log("🖱️ [DEBUG] Click sur la carte du thème :", theme);
        onSelect();
      }}
    >
      <h3>{theme}</h3>
    </div>
  );
};

export default ThemeCard;
