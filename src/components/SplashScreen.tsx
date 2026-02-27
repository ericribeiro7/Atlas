import { useState, useEffect } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Mostra a splash por 2 segundos, depois inicia o fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Após o fade out (500ms), chama onFinish
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-32 w-32 animate-pulse object-contain"
        />
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary"></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
