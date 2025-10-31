import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import User from "@/interfaces/user";

async function login() {

  window.location.href = "https://spotify-playlist-generator-backend.onrender.com/auth/login";
}

async function playlistPage() {
  window.location.href = "/Upload";
}

async function logout() {
  await fetch("https://spotify-playlist-generator-backend.onrender.com/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export default function Dashboard() {
  const [isLoged, setIsLoged] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    getSessionData();
  }, []);

  useEffect(() => {
    const session = getSessionData();
    if (!session) {
      setIsLoged(false);
    }
  });

  async function getSessionData() {
    const response = await fetch("https://spotify-playlist-generator-backend.onrender.com/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setUserData(data);

      setIsLoged(true);
    } else {
      setIsLoged(false);
    }
  }

  return (
    <>
      <h1>
        Dashboard spotify playlist generator
        <br />
        {!isLoged && <Button onClick={login}> Login</Button>}
        {isLoged && userData && (
          <>
            <div>Bonjour {userData.displayName}</div>
            <Button onClick={logout}> Logout</Button>
            <Button onClick={playlistPage}> Playlist generator</Button>
          </>
        )}
      </h1>
    </>
  );
}
