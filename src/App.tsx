import { useState, useRef } from "react";
import "./App.css";
import trinnoMascot from "./assets/trinno_mascot_png.png";

type Stage = "initial" | "rating" | "success" | "demand_second" | "final";

const TIMER_START_KEY = "snitzeljagd:startTime";

const getStoredStartTime = () => {
  const storedValue = localStorage.getItem(TIMER_START_KEY);
  const parsedValue = storedValue ? Number(storedValue) : Number.NaN;

  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  const now = Date.now();
  localStorage.setItem(TIMER_START_KEY, String(now));
  return now;
};

interface RatingResult {
  rating: number;
  message: string;
}

function App() {
  const [stage, setStage] = useState<Stage>("initial");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [currentRating, setCurrentRating] = useState<RatingResult | null>(null);
  const [startTime] = useState(() => getStoredStartTime());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRating, setShowRating] = useState(false);

  const getElapsedMinutes = () => (Date.now() - startTime) / 60000;
  const isFirstTwoMinutes = () => getElapsedMinutes() < 2;

  const generateFakeRating = (): RatingResult => {
    const imageCount = uploadedImages.length;

    // First 2 minutes: rate between 6-9
    if (isFirstTwoMinutes()) {
      const rating = Math.floor(Math.random() * 4) + 6; // 6-9
      const messages = [
        "🎯 Pretty good!",
        "✨ Nice attempt!",
        "🌟 Getting there!",
        "🎨 Interesting choice!",
      ];
      return {
        rating,
        message: messages[Math.floor(Math.random() * messages.length)],
      };
    }

    // After 2 minutes, first image: rate 8
    if (imageCount === 1) {
      return {
        rating: 8,
        message: "🔥 Excellent! But we need more...",
      };
    }

    // Second image: rate 10 (success)
    return {
      rating: 10,
      message: "🏆 PERFECT! Found it!",
    };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setUploadedImages([...uploadedImages, imageData]);
      setShowRating(false);

      // Simulate rating delay
      setTimeout(() => {
        const rating = generateFakeRating();
        setCurrentRating(rating);
        setShowRating(true);

        // Determine next stage
        if (rating.rating === 10) {
          setStage("final");
        } else if (!isFirstTwoMinutes() && uploadedImages.length === 0) {
          setStage("demand_second");
        } else if (rating.rating === 8 && uploadedImages.length === 1) {
          setStage("demand_second");
        } else {
          setStage("rating");
        }
      }, 800);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = async () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        capture="environment"
      />

      {/* Initial Stage */}
      {stage === "initial" && (
        <div className="w-full max-w-md text-center bounce-in">
          <div className="mb-8">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-lg">
              <img
                src={trinnoMascot}
                alt="Trinno mascot"
                className="h-48 w-48 object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Snitzeljagd KI
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Malt unser Maskottchen und überzeugt die KI.
          </p>
          <button
            onClick={handleCameraCapture}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition transform hover:scale-105 active:scale-95 shadow-lg text-lg"
          >
            📸 Foto aufnehmen
          </button>
        </div>
      )}

      {/* Rating Stage */}
      {stage === "rating" && showRating && currentRating && (
        <div className="w-full max-w-md text-center bounce-in">
          {uploadedImages.length > 0 && (
            <div className="mb-6">
              <img
                src={uploadedImages[uploadedImages.length - 1]}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6"
              />
            </div>
          )}

          <div className="mb-8">
            <div
              className={`inline-block p-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg glow-animation`}
            >
              <span className="text-6xl">{currentRating.rating}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {currentRating.message}
          </h2>

          <p className="text-gray-600 text-base mb-8">
            {currentRating.rating < 10
              ? isFirstTwoMinutes()
                ? "Versuche es nochmal! Du hast noch Zeit."
                : "Das ist gut, aber wir brauchen noch mehr..."
              : "Du hast es gefunden!"}
          </p>

          <button
            onClick={handleCameraCapture}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition transform hover:scale-105 active:scale-95 shadow-lg text-lg"
          >
            📸{" "}
            {currentRating.rating === 10 ? "Nochmal spielen" : "Noch ein Foto"}
          </button>
        </div>
      )}

      {/* Demand Second Image */}
      {stage === "demand_second" && showRating && currentRating && (
        <div className="w-full max-w-md text-center bounce-in">
          {uploadedImages[uploadedImages.length - 1] && (
            <div className="mb-6">
              <img
                src={uploadedImages[uploadedImages.length - 1]}
                alt="Uploaded"
                className="w-full h-64 object-cover rounded-2xl shadow-lg mb-6"
              />
            </div>
          )}

          <div className="mb-8">
            <div className="inline-block p-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg glow-animation">
              <span className="text-6xl">{currentRating.rating}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {currentRating.message}
          </h2>

          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-8 text-left">
            <p className="text-gray-800 font-semibold mb-2">💡 Tipp:</p>
            <p className="text-gray-700 text-sm">
              Versuche einen anderen Winkel oder Standort für die nächste
              aufnahme!
            </p>
          </div>

          <button
            onClick={handleCameraCapture}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition transform hover:scale-105 active:scale-95 shadow-lg text-lg"
          >
            📸 Das zweite Foto!
          </button>
        </div>
      )}

      {/* Final Success Stage */}
      {stage === "final" && (
        <div className="w-full max-w-md text-center bounce-in">
          <div className="mb-8 animate-bounce">
            <div className="inline-block p-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-2xl">
              <span className="text-7xl">🏆</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Du hast es geschafft!
          </h1>

          <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-8 mb-8 shadow-lg">
            <p className="text-gray-600 text-sm font-semibold mb-3">
              🗺️ DER LETZTE HINWEIS
            </p>
            <p className="text-2xl font-mono font-bold text-indigo-600">
              Gleiche Lokalität wie letzte Weihnachtsfeier.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
