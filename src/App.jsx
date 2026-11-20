import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Heart,
  Share2,
  ExternalLink,
  Flower2,
  Sparkles,
} from "lucide-react";
import "./App.css";

const WEDDING_DATE = new Date("2027-01-24T08:00:00+05:30");

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzLHPrJbWi0IC_ptThhNBAatucy0FNEeECgkiTbSqHn0-7BmPSA5iBOMpJBfwTVuPBb/exec";

function getCountdown() {
  const difference = WEDDING_DATE.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function FloatingPetals() {
  const petals = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 37 + 11) % 100}%`,
    delay: `${(i % 9) * 0.8}s`,
    duration: `${10 + (i % 7) * 2}s`,
    size: `${10 + (i % 4) * 4}px`,
  }));

  return (
    <div className="petal-layer" aria-hidden="true">
      {petals.map((petal) => (
        <motion.span
          key={petal.id}
          className="floating-petal"
          style={{
            left: petal.left,
            fontSize: petal.size,
          }}
          initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, 180, 360],
            x: [0, 25, -20, 10],
          }}
          transition={{
            duration: Number.parseFloat(petal.duration),
            delay: Number.parseFloat(petal.delay),
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ✿
        </motion.span>
      ))}
    </div>
  );
}

function WeddingIntro({ onOpen }) {
  return (
    <motion.div
      className="wedding-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="intro-ornament"
        animate={{ rotate: 360 }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        ✧
      </motion.div>

      <motion.p
        className="intro-eyebrow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        A SPECIAL INVITATION
      </motion.p>

      {/* Wedding illustration on the opening screen */}
      <motion.div
        className="intro-wedding-image"
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      >
        <img src="/images/arun_pooja.jpg" alt="Pooja and Arun at Guruvayoor Temple" />
      </motion.div>

      <motion.h1
        className="intro-title"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1 }}
      >
        Arun <span>&amp;</span> Pooja
      </motion.h1>

      <motion.p
        className="intro-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        A beautiful beginning, blessed by love
      </motion.p>

      <motion.button
        className="open-invitation"
        onClick={onOpen}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          boxShadow: [
            "0 0 0 rgba(179,138,72,0)",
            "0 0 25px rgba(179,138,72,0.25)",
            "0 0 0 rgba(179,138,72,0)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        Open Invitation
        <span>✧</span>
      </motion.button>

      <p className="intro-date">24 · JANUARY · 2027</p>
    </motion.div>
  );
}

export default function App() {
  const [countdown, setCountdown] = useState(getCountdown);
  const [opened, setOpened] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [guestPax, setGuestPax] = useState("1");
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  async function handleOpenInvitation() {
    // Open the invitation and start music directly from the button click.
    setOpened(true);

    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = 0.45;
      await audio.play();
      setIsMusicPlaying(true);
    } catch (error) {
      setIsMusicPlaying(false);
      console.warn(
        "Wedding music could not start. Check that public/music/song.mp3 exists.",
        error
      );
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsMusicPlaying(true);
      } catch (error) {
        setIsMusicPlaying(false);
        console.log("Unable to play music:", error);
      }
    } else {
      audio.pause();
      setIsMusicPlaying(false);
    }
  }

  async function submitRsvp(event) {
    event.preventDefault();

    const name = guestName.trim();
    const pax = Number(guestPax);

    if (
      !name ||
      name.length > 150 ||
      !Number.isInteger(pax) ||
      pax < 1 ||
      pax > 30
    ) {
      setRsvpStatus("Please enter a valid name and guest count.");
      return;
    }

    if (
      !GOOGLE_SCRIPT_URL.startsWith("https://script.google.com/") ||
      GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")
    ) {
      setRsvpStatus("The RSVP form has not been configured yet.");
      return;
    }

    setIsSubmitting(true);
    setRsvpStatus("");

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({
          name,
          pax: String(pax),
        }),
      });

      // With no-cors, the browser cannot read the server's response.
      // This message confirms the request was sent, not that the
      // spreadsheet write was independently verified.
      setRsvpStatus(
        "Thank you! Your response has been sent. Please contact the hosts if you need to confirm it."
      );
      setGuestName("");
      setGuestPax("1");
    } catch (error) {
      console.error("RSVP submission failed:", error);
      setRsvpStatus(
        "We couldn't send your response. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/song.mp3"
        loop
        preload="auto"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
      />
      <AnimatePresence mode="wait">
        {!opened ? (
          <WeddingIntro key="intro" onOpen={handleOpenInvitation} />
        ) : (
          <motion.div
            // key="wedding-card"
            className="invitation-card"
            initial={{ opacity: 0, y: 35, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <FloatingPetals />
            <button
              type="button"
              className="music-toggle"
              onClick={toggleMusic}
              aria-label={
                isMusicPlaying ? "Pause wedding music" : "Play wedding music"
              }
              title={isMusicPlaying ? "Pause music" : "Play music"}
            >
              <span aria-hidden="true">{isMusicPlaying ? "♫" : "♪"}</span>
              <span className="music-label">
                {isMusicPlaying ? "Music On" : "Music Off"}
              </span>
            </button>
            <div className="gold-border">
              <header className="top-ornament">
                <span className="ornament-line" />
                <Flower2 size={23} strokeWidth={1.2} />
                <span className="ornament-line" />
              </header>

              <p className="eyebrow">A CELEBRATION OF LOVE</p>

              <div className="temple-symbol">
                <Sparkles size={16} />
                <span>With the blessings of the divine</span>
                <Sparkles size={16} />
              </div>

              <h1 className="hero-heading">
                Two hearts,
                <br />
                <span>one beautiful journey</span>
              </h1>

              <p className="invitation-message">
                Together with their families, we joyfully invite you to witness
                and bless the sacred union of
              </p>

              <section className="couple">
                <motion.div
                  className="person"
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.8 }}
                >
                  <p className="person-label">THE GROOM</p>
                  <h2>Arun Vijayan</h2>
                  <p className="parents">
                    Son of
                    <br />
                    Vijaya Kumar &amp; Udayakumari
                  </p>
                </motion.div>

                <motion.div
                  className="ampersand"
                  animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart size={30} strokeWidth={1.1} />
                  <span>&amp;</span>
                </motion.div>

                <motion.div
                  className="person"
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55, duration: 0.8 }}
                >
                  <p className="person-label">THE BRIDE</p>
                  <h2>Pooja VS</h2>
                  <p className="parents">
                    Daughter of
                    <br />
                    Salim Raj Mohan &amp; Sreeja J
                  </p>
                </motion.div>
              </section>

              <div className="divider-ornament">
                <span />
                <Flower2 size={19} strokeWidth={1.2} />
                <span />
              </div>

              <section className="event-details">
                <p className="section-kicker">THE WEDDING CEREMONY</p>

                <div className="date-display">
                  <motion.span
                    className="date-day"
                    initial={{ opacity: 0, scale: 0.6 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring" }}
                  >
                    24
                  </motion.span>
                  <div className="date-month">
                    <span>JANUARY</span>
                    <strong>2027</strong>
                  </div>
                </div>

                <p className="weekday">SUNDAY · 24 JANUARY 2027</p>

                <div className="detail-row">
                  <div className="detail-icon">
                    <Clock3 size={21} />
                  </div>
                  <div>
                    <span className="detail-label">THALIKETTU</span>
                    <strong>8:00 AM</strong>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon">
                    <MapPin size={21} />
                  </div>
                  <div>
                    <span className="detail-label">VENUE</span>
                    <strong>Guruvayoor Temple</strong>
                    <p>Guruvayur, Kerala, India</p>
                  </div>
                </div>

                <a
                  className="map-button"
                  href="https://www.google.com/maps/search/?api=1&query=Guruvayur+Sri+Krishna+Temple+Kerala"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin size={17} />
                  View Location
                  <ExternalLink size={15} />
                </a>
              </section>

              <section className="countdown-section">
                <p className="section-kicker">COUNTING DOWN TO FOREVER</p>
                <div className="countdown">
                  {[
                    ["DAYS", countdown.days],
                    ["HOURS", countdown.hours],
                    ["MINUTES", countdown.minutes],
                    ["SECONDS", countdown.seconds],
                  ].map(([label, value]) => (
                    <div className="countdown-item" key={label}>
                      <strong>{String(value).padStart(2, "0")}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rsvp-section">
                <p className="section-kicker">KINDLY RESPOND</p>

                <h2 className="rsvp-title">Will You Join Us?</h2>

                <p className="rsvp-description">
                  Please let us know your name and how many guests will be
                  attending.
                </p>

                <form className="rsvp-form" onSubmit={submitRsvp}>
                  <div className="rsvp-field">
                    <label htmlFor="guestName">Your Name</label>
                    <input
                      id="guestName"
                      type="text"
                      placeholder="Enter your full name"
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      maxLength={150}
                      autoComplete="name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* <div className="rsvp-field">
                    <label htmlFor="guestPax">Number of Guests</label>
                    <select
                      id="guestPax"
                      value={guestPax}
                      onChange={(event) => setGuestPax(event.target.value)}
                      required
                      disabled={isSubmitting}
                    >
                      {Array.from({ length: 30 }, (_, index) => index + 1).map(
                        (pax) => (
                          <option key={pax} value={pax}>
                            {pax} {pax === 1 ? "Guest" : "Guests"}
                          </option>
                        )
                      )}
                    </select>
                  </div> */}

                  <button
                    type="submit"
                    className="rsvp-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Attendance"}
                  </button>

                  {rsvpStatus && (
                    <p className="rsvp-status" role="status" aria-live="polite">
                      {rsvpStatus}
                    </p>
                  )}
                </form>
              </section>

              <footer className="invitation-footer">
                <p className="footer-message">
                  Your presence and blessings will make our day truly special.
                </p>

                <p className="footer-script">With love &amp; gratitude</p>

                <p className="footer-note">
                  MADE WITH LOVE <Heart size={12} fill="currentColor" />
                </p>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
