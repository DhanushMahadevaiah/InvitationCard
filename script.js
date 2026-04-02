const revealItems = document.querySelectorAll(".reveal");
const openingScreen = document.querySelector("#opening-screen");
const invitationCard = document.querySelector("#invitation-card");
const langButtons = document.querySelectorAll("[data-lang-toggle]");
const langContent = document.querySelectorAll("[data-en][data-kn]");
const translatableNames = document.querySelectorAll("[data-name-en][data-name-kn]");
const backgroundMusic = document.querySelector("#background-music");
let musicStarted = false;
let musicStopTimer;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
  revealObserver.observe(item);
});

let invitationStarted = false;

const startBackgroundMusic = async () => {
  if (!backgroundMusic || musicStarted) return;

  backgroundMusic.volume = 0.22;
  backgroundMusic.muted = false;

  try {
    await backgroundMusic.play();
    musicStarted = true;
    if (musicStopTimer) {
      window.clearTimeout(musicStopTimer);
    }
    musicStopTimer = window.setTimeout(() => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      musicStarted = false;
    }, 120000);
  } catch (error) {
    musicStarted = false;
  }
};

const retryBackgroundMusic = () => {
  startBackgroundMusic();
};

const beginInvitationExperience = () => {
  if (invitationStarted) return;
  invitationStarted = true;

  startBackgroundMusic();

  openingScreen?.classList.add("is-opening");

  window.setTimeout(() => {
    invitationCard?.classList.remove("invitation-hidden");
    invitationCard?.classList.add("invitation-visible");
    revealItems.forEach((item, index) => {
      window.setTimeout(() => {
        item.classList.add("is-visible");
      }, index * 120);
    });
  }, 700);

  window.setTimeout(() => {
    openingScreen?.classList.add("is-hidden");
  }, 1500);

  window.setTimeout(() => {
    if (openingScreen) {
      openingScreen.setAttribute("hidden", "hidden");
    }
  }, 2800);
};

document.addEventListener(
  "DOMContentLoaded",
  () => {
    startBackgroundMusic();
  },
  { once: true }
);

window.addEventListener(
  "load",
  () => {
    startBackgroundMusic();
    window.setTimeout(() => {
      beginInvitationExperience();
    }, 3000);
  },
  { once: true }
);

backgroundMusic?.addEventListener("canplaythrough", retryBackgroundMusic, { once: true });

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    startBackgroundMusic();
  }
});

const setLanguage = (lang) => {
  document.documentElement.lang = lang === "kn" ? "kn" : "en";

  langContent.forEach((node) => {
    const text = node.dataset[lang];
    if (!text) return;
    node.textContent = text;
  });

  translatableNames.forEach((node) => {
    const text = node.dataset[`name${lang === "kn" ? "Kn" : "En"}`];
    if (!text) return;
    node.innerHTML = text;
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langToggle === lang);
  });
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.langToggle || "en");
  });
});
