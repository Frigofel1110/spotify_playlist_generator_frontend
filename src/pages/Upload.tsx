import React, { useState } from "react";

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://spotify-playlist-generator-backend.onrender.com/api/ocr/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();
  console.log("Songs trouvées:", data.songs);
  return data;
}

async function createPlaylist(songs: string[], playlistName: string) {
  const response = await fetch(
    "https://spotify-playlist-generator-backend.onrender.com/api/generator/create-from-songs",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        songs: songs,
        playlistName: playlistName,
      }),
    }
  );

  return response.json();
}

export default function TestUpload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [playlistNameValue, setPlaylistNameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    // ⭐ Vérifier qu'il y a bien des fichiers
    if (!files || files.length === 0) return;

    setLoading(true);
    console.log(`📤 Upload de ${files.length} image(s)...`);

    try {
      const allSongs: string[] = [];

      // ⭐ BOUCLE sur TOUS les fichiers sélectionnés
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`\n🖼️  Image ${i + 1}/${files.length}: ${file.name}`);

        // Upload + OCR de cette image
        try {
          const uploadResult = await uploadImage(file);
          console.log(uploadResult);

          const error = uploadResult.error || null;
          if (error) {
            setErrorMessage(error);
          } else {
            setErrorMessage(null);
          }

          // Ajouter les chansons trouvées au tableau total
          if (uploadResult.songs && uploadResult.songs.length > 0) {
            console.log(
              `  ✅ ${uploadResult.songs.length} chanson(s) trouvée(s)`
            );
            allSongs.push(...uploadResult.songs);
          } else {
            console.log(`  ⚠️ Aucune chanson trouvée`);
          }
        } catch (error) {
          console.log(error);
        }
      }

      console.log(
        `\n🎵 TOTAL: ${allSongs.length} chanson(s) de ${files.length} image(s)`
      );

      // ⭐ Si aucune chanson trouvée, arrêter
      if (allSongs.length === 0) {
        alert("Aucune chanson détectée dans les images");
        setLoading(false);
        return;
      }

      // ⭐ Créer UNE playlist avec TOUTES les chansons
      console.log("\n📝 Création de la playlist...");
      const playlistResult = await createPlaylist(
        allSongs,
        playlistNameValue || "Ma playlist custom"
      );

      console.log("✅ Playlist créée:", playlistResult);
      setResult(playlistResult);
    } catch (error: any) {
      console.error("❌ Erreur:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}

      <h1>Titre de la playlist</h1>
      <input
        type="text"
        value={playlistNameValue}
        onChange={(e) => setPlaylistNameValue(e.target.value)}
      ></input>
      <h2>Upload plusieurs screenshots</h2>

      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        multiple
        disabled={loading}
      />

      {loading && (
        <p style={{ marginTop: "10px" }}>
          ⏳ Traitement en cours... Cela peut prendre un moment.
        </p>
      )}

      {result && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <h3>✅ Playlist créée avec succès !</h3>
          <p>
            <strong>Nom:</strong> {result.playlist?.name}
          </p>
          <p>
            <strong>Chansons trouvées:</strong> {result.stats?.tracksFound}/
            {result.stats?.tracksTotal}
          </p>

          <a
            href={result.playlist?.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "10px 20px",
              background: "#1DB954",
              color: "white",
              textDecoration: "none",
              borderRadius: "20px",
            }}
          >
            🎵 Ouvrir dans Spotify
          </a>

          {result.tracks && result.tracks.length > 0 && (
            <details style={{ marginTop: "15px" }}>
              <summary>Voir les chansons ({result.tracks.length})</summary>
              <ul>
                {result.tracks.map((track: any, index: number) => (
                  <li key={index}>
                    {track.name} - {track.artist}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
