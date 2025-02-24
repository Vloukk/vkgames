'use client';  // Cette ligne doit être ajoutée

import React, { useState, useEffect } from 'react';

// Components
import Header from '@/components/home/Header';
import GameCardHome from '@/components/home/GameCardHome';

// Datas
import GameDatas from '@/datas/GameCard.json';

export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    setGames(GameDatas.games); // Utilisation des données JSON
  }, []);

  return (
    <section className="HomePage">
      <Header />
      <div className="HomePage__gridGame">
        <div className="gridGame__selector">
          <div className="selector__grid"></div>
        </div>
        <div className="gridGame__list">
          {games.map((game, index) => ( // Correction de la variable en `game`
            <GameCardHome
              key={game.id} // Utilisation correcte de `game.id`
              title={game.title} // Passage des props à GameCardHome
              text={game.text}
              icon={game.icon}
              link={game.link}
              color={game.color}
              animation={game.animation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
