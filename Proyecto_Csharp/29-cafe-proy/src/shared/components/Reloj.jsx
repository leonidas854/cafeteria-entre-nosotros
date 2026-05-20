import React, { useEffect, useState } from "react";
import "./Clock.css"; 

const Clock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateClock(); // inicializar
    const interval = setInterval(updateClock, 1000); // actualizar cada segundo

    return () => clearInterval(interval); // limpiar
  }, []);

  return (
    <div className="digital-clock">
      {time}
    </div>
  );
};

export default Clock;
