const revealItems = document.querySelectorAll(".reveal");
const openingScreen = document.querySelector("#opening-screen");
const invitationCard = document.querySelector("#invitation-card");

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

let audioContext;
let ambientGain;
let ambientTimer;
let audioStarted = false;
let invitationStarted = false;

const notes = [523.25, 659.25, 783.99, 659.25];

const ensureAudioContext = async () => {
  if (!window.AudioContext && !window.webkitAudioContext) return null;

  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtor();
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0.045;
    ambientGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  return audioContext;
};

const playChime = (timeOffset = 0) => {
  if (!audioContext || !ambientGain) return;

  const now = audioContext.currentTime + timeOffset;

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.22);

    gainNode.gain.setValueAtTime(0.0001, now + index * 0.22);
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + index * 0.22 + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.22 + 0.9);

    oscillator.connect(gainNode);
    gainNode.connect(ambientGain);

    oscillator.start(now + index * 0.22);
    oscillator.stop(now + index * 0.22 + 1);
  });
};

const startAmbientLoop = async () => {
  const context = await ensureAudioContext();
  if (!context) return false;
  if (ambientTimer) return true;

  playChime();
  ambientTimer = window.setInterval(() => {
    playChime();
  }, 12000);
  return true;
};

const beginInvitationExperience = async () => {
  if (invitationStarted) return;
  invitationStarted = true;

  openingScreen?.classList.add("is-opening");

  window.setTimeout(() => {
    openingScreen?.classList.add("is-hidden");
    invitationCard?.classList.remove("invitation-hidden");
    invitationCard?.classList.add("invitation-visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1100);
};

const startMusicIfPossible = async () => {
  if (audioStarted) return;
  const started = await startAmbientLoop();
  if (started) {
    audioStarted = true;
  }
};

window.addEventListener(
  "load",
  async () => {
    try {
      await startMusicIfPossible();
    } catch (error) {
      // Autoplay may be blocked until user interaction.
    }

    window.setTimeout(() => {
      beginInvitationExperience();
    }, 3000);
  },
  { once: true }
);

const unlockAudioAndOpen = async () => {
  await startMusicIfPossible();
  beginInvitationExperience();
};

window.addEventListener("pointerdown", unlockAudioAndOpen, { once: true });
window.addEventListener("touchstart", unlockAudioAndOpen, { once: true });
