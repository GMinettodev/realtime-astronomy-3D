"use client";

import { useEffect, useRef, useState } from "react";
import { MarsModel } from "./model";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { usePathname, useRouter } from "next/navigation";
import Cookie from "js-cookie"; // For managing cookies
import { getContent } from "@/locales/translation"; // Import translation function

export default function Mars() {
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);
  const model = useRef<MarsModel>();

  const [planetNames, setPlanetNames] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    model.current = new MarsModel();
    document.body.appendChild(VRButton.createButton(model.current.renderer));

    // Get language from cookie or browser
    const browserLanguage = navigator.language;
    const languageCode = browserLanguage.split("-")[0];
    const storedLanguage = Cookie.get("language");

    // If no language cookie exists, set it to the browser language
    if (!storedLanguage) {
      Cookie.set("language", languageCode, { expires: 365 });
    } else if (storedLanguage !== languageCode) {
      // Update language cookie if different from browser language
      Cookie.set("language", languageCode, { expires: 365 });
    }

    // Fetch and set localized content
    const language = storedLanguage || languageCode;
    const content = getContent(language);

    // Set the title and planet names from localized content
    setTitle(content.menu.title);
    setPlanetNames(content.menu.planets.map((planet) => planet.name));
  }, []);

  function navigateTo(route: string) {
    model.current?.cameraController.zoomOut();

    setTimeout(() => {
      if (model.current) {
        document.body.removeChild(model.current.canvas);
        model.current = undefined;
      }
      router.push(route);
    }, 500);
  }

  return (
    <div className="bg-black">
      <main className="">
        <button
          className="m-2 text-gray-100"
          onClick={() => model.current?.focusOut()}
        >
          Visão total
        </button>
        <button
          className="m-2 text-gray-100"
          onClick={() => model.current?.focusOnMars()}
        >
          Zoom
        </button>

        {/* Dynamic buttons for each planet */}
        {planetNames.map((name, index) => {
          let currentPlanet = getContent(Cookie.get("language") || "en").menu
            .planets[index];
          if (currentPlanet.route != pathname.replace("/", "")) {
            return (
              <button
                key={index}
                className="m-2 text-gray-100"
                onClick={() => navigateTo(currentPlanet.route)}
              >
                {name}
              </button>
            );
          } else {
            return <></>;
          }
        })}
      </main>
    </div>
  );
}
