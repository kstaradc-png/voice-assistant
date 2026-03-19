import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  Camera,
  ChevronDown,
  Globe,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Lang = "hi" | "en";
type AppTab = "home" | "camera" | "contacts" | "settings";
type ListeningState = "idle" | "listening" | "processing";

interface Contact {
  name: string;
  nameHi: string;
  emoji: string;
}

const CONTACTS: Contact[] = [
  { name: "Raj", nameHi: "राज", emoji: "👨" },
  { name: "Priya", nameHi: "प्रिया", emoji: "👩" },
  { name: "Anil", nameHi: "अनिल", emoji: "👨‍💼" },
  { name: "Mummy", nameHi: "मम्मी", emoji: "👩‍👧" },
  { name: "Papa", nameHi: "पापा", emoji: "👨‍👧" },
];

const TUTORIAL_STEPS = [
  {
    titleHi: "स्वागत है सारथी में!",
    titleEn: "Welcome to Sarthi!",
    textHi:
      "सारथी आपका ऑफलाइन voice assistant है। यह पूरी तरह हिंदी और अंग्रेजी में काम करता है।",
    textEn:
      "Sarthi is your offline voice assistant. It works completely in Hindi and English.",
  },
  {
    titleHi: "Wake Word",
    titleEn: "Wake Word",
    textHi: "'सुनो जी' बोलें या माइक बटन दबाएं। Assistant सुनने लगेगा।",
    textEn:
      "Say 'Suno Ji' or press the mic button. The assistant will start listening.",
  },
  {
    titleHi: "Commands",
    titleEn: "Voice Commands",
    textHi:
      "'समय बताओ', 'तारीख बताओ', 'राज को कॉल करो', 'कैमरा खोलो' जैसे commands बोलें।",
    textEn:
      "Say commands like 'Tell time', 'Tell date', 'Call Raj', 'Open camera'.",
  },
  {
    titleHi: "Camera Vision",
    titleEn: "Camera Vision",
    textHi:
      "'कैमरा खोलो' बोलकर Camera tab खोलें। सारथी सामने की चीज़ें पहचानकर बताएगा।",
    textEn:
      "Open Camera tab to detect objects. Sarthi will identify and describe what's in view.",
  },
  {
    titleHi: "बधाई हो! 🎉",
    titleEn: "All Done! 🎉",
    textHi: "आप सारथी use करने के लिए तैयार हैं। बस बोलें और सारथी काम करेगा!",
    textEn:
      "You're ready to use Sarthi. Just speak and Sarthi will take action!",
  },
];

function speak(text: string, lang: Lang, rate = 1, pitch = 1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang === "hi" ? "hi-IN" : "en-US";
  utt.rate = rate;
  utt.pitch = pitch;
  window.speechSynthesis.speak(utt);
}

function Waveform({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <div
      className="flex items-center justify-center gap-[3px] h-12 w-full"
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, i) => i).map((barIdx) => {
        const delay = (barIdx / bars) * 1.2;
        const barKey = `waveform-bar-index-${barIdx}`;
        return (
          <div
            key={barKey}
            className="rounded-full transition-all duration-300"
            style={{
              width: "3px",
              height: active
                ? `${20 + Math.sin(barIdx * 0.8) * 14 + 10}px`
                : "6px",
              minHeight: "6px",
              maxHeight: "48px",
              background: "oklch(0.58 0.20 258)",
              opacity: active ? 0.85 : 0.3,
              animation: active
                ? `wave-bar ${0.8 + (barIdx % 4) * 0.15}s ease-in-out ${delay}s infinite`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function MicButton({
  state,
  onClick,
  label,
}: {
  state: ListeningState;
  onClick: () => void;
  label: string;
}) {
  const isActive = state === "listening" || state === "processing";
  return (
    <div className="relative flex flex-col items-center gap-4">
      {isActive && (
        <>
          <span
            className="absolute rounded-full border-2"
            style={{
              width: 160,
              height: 160,
              top: "50%",
              left: "50%",
              borderColor: "oklch(0.58 0.20 258 / 0.5)",
              animation: "ring-pulse 1.5s ease-out infinite",
            }}
          />
          <span
            className="absolute rounded-full border-2"
            style={{
              width: 160,
              height: 160,
              top: "50%",
              left: "50%",
              borderColor: "oklch(0.58 0.20 258 / 0.3)",
              animation: "ring-pulse 1.5s ease-out 0.6s infinite",
            }}
          />
        </>
      )}
      <button
        type="button"
        data-ocid="mic.primary_button"
        onClick={onClick}
        aria-label={label}
        className="relative rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-4"
        style={{
          width: 96,
          height: 96,
          background: isActive
            ? "linear-gradient(135deg, oklch(0.52 0.22 258), oklch(0.45 0.18 270))"
            : "linear-gradient(135deg, oklch(0.58 0.20 258), oklch(0.48 0.18 260))",
          animation: isActive
            ? "mic-glow 0.8s ease-in-out infinite"
            : "mic-glow 2s ease-in-out infinite",
          outlineColor: "oklch(0.58 0.20 258)",
        }}
      >
        {state === "processing" ? (
          <span
            className="w-6 h-6 rounded-full border-t-white animate-spin"
            style={{
              border: "3px solid oklch(1 0 0 / 0.3)",
              borderTopColor: "white",
            }}
          />
        ) : isActive ? (
          <MicOff className="text-white" size={36} />
        ) : (
          <Mic className="text-white" size={36} />
        )}
      </button>
    </div>
  );
}

function CallingOverlay({
  contact,
  onEnd,
  lang,
}: {
  contact: Contact;
  onEnd: () => void;
  lang: Lang;
}) {
  return (
    <div
      data-ocid="calling.modal"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "oklch(0.04 0 0 / 0.97)" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={`ring-${i}`}
          className="absolute rounded-full border-2"
          style={{
            width: 180 + i * 60,
            height: 180 + i * 60,
            borderColor: "oklch(0.58 0.20 258 / 0.3)",
            animation: `call-ring 2s ease-out ${i * 0.6}s infinite`,
          }}
        />
      ))}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4"
        style={{ background: "oklch(0.15 0 0)" }}
      >
        {contact.emoji}
      </div>
      <h2
        className="text-3xl font-bold text-white mb-1"
        style={{ fontFamily: "BricolageGrotesque, Montserrat, sans-serif" }}
      >
        {lang === "hi" ? contact.nameHi : contact.name}
      </h2>
      <p className="text-gray-400 mb-10">
        {lang === "hi" ? "कॉल कर रहे हैं..." : "Calling..."}
      </p>
      <div className="flex gap-6">
        <button
          type="button"
          data-ocid="calling.confirm_button"
          className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "oklch(0.48 0.18 145)" }}
          aria-label={lang === "hi" ? "उठाएं" : "Answer"}
        >
          <Phone className="text-white" size={24} />
        </button>
        <button
          type="button"
          data-ocid="calling.cancel_button"
          onClick={onEnd}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "oklch(0.55 0.22 27)" }}
          aria-label={lang === "hi" ? "काटें" : "End Call"}
        >
          <PhoneOff className="text-white" size={24} />
        </button>
      </div>
    </div>
  );
}

function TutorialModal({
  open,
  onClose,
  lang,
  voiceRate,
  voicePitch,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  voiceRate: number;
  voicePitch: number;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const s = TUTORIAL_STEPS[step];
    speak(lang === "hi" ? s.textHi : s.textEn, lang, voiceRate, voicePitch);
  }, [step, open, lang, voiceRate, voicePitch]);

  const cur = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="tutorial.dialog"
        className="border-border max-w-lg"
        style={{ background: "oklch(0.1 0 0)" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl text-white"
            style={{ fontFamily: "BricolageGrotesque, sans-serif" }}
          >
            {lang === "hi" ? cur.titleHi : cur.titleEn}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          {TUTORIAL_STEPS.map((tutStep) => (
            <div
              key={tutStep.titleEn}
              className="h-1.5 rounded-full flex-1 transition-all duration-300"
              style={{
                background:
                  TUTORIAL_STEPS.indexOf(tutStep) <= step
                    ? "oklch(0.58 0.20 258)"
                    : "oklch(0.22 0 0)",
              }}
            />
          ))}
        </div>
        <p className="text-gray-400 leading-relaxed">
          {lang === "hi" ? cur.textHi : cur.textEn}
        </p>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            data-ocid="tutorial.close_button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <X size={14} />
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
          <Button
            data-ocid="tutorial.confirm_button"
            onClick={() => {
              if (isLast) onClose();
              else setStep((s) => s + 1);
            }}
            className="text-white hover:opacity-90"
            style={{ background: "oklch(0.58 0.20 258)" }}
          >
            {isLast
              ? lang === "hi"
                ? "समाप्त"
                : "Done"
              : lang === "hi"
                ? "अगला →"
                : "Next →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CameraPanel({
  lang,
  voiceRate,
  voicePitch,
}: {
  lang: Lang;
  voiceRate: number;
  voicePitch: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lastSpokenRef = useRef<string>("");
  const lastSpokenTimeRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    setActive(false);
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    try {
      setStatus(lang === "hi" ? "कैमरा शुरू हो रहा है..." : "Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus(
        lang === "hi" ? "AI मॉडल लोड हो रहा है..." : "Loading AI model...",
      );
      const cocoSsd = (window as any).cocoSsd;
      if (!cocoSsd) throw new Error("coco-ssd not loaded");
      if (!modelRef.current) modelRef.current = await cocoSsd.load();
      setActive(true);
      setStatus("");
      const detect = async () => {
        if (!videoRef.current || !canvasRef.current || !modelRef.current)
          return;
        const predictions = await modelRef.current.detect(videoRef.current);
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        const { videoWidth: w, videoHeight: h } = videoRef.current;
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        ctx.clearRect(0, 0, w, h);
        for (const pred of predictions) {
          const [x, y, bw, bh] = pred.bbox;
          ctx.strokeStyle = "#1E88FF";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, bw, bh);
          ctx.fillStyle = "#1E88FF";
          ctx.fillRect(x, y - 20, bw, 20);
          ctx.fillStyle = "white";
          ctx.font = "14px sans-serif";
          ctx.fillText(
            `${pred.class} ${Math.round(pred.score * 100)}%`,
            x + 4,
            y - 4,
          );
        }
        if (predictions.length > 0) {
          const labels = predictions.map((p: any) => p.class).join(", ");
          const now = Date.now();
          if (
            labels !== lastSpokenRef.current ||
            now - lastSpokenTimeRef.current > 5000
          ) {
            lastSpokenRef.current = labels;
            lastSpokenTimeRef.current = now;
            speak(
              lang === "hi" ? `मैं देख रहा हूँ: ${labels}` : `I can see: ${labels}`,
              lang,
              voiceRate,
              voicePitch,
            );
          }
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      detect();
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <section className="flex flex-col items-center gap-4 w-full">
      <h2
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "BricolageGrotesque, sans-serif" }}
      >
        {lang === "hi" ? "कैमरा विज़न" : "Camera Vision"}
      </h2>
      <p className="text-gray-400 text-center max-w-md">
        {lang === "hi"
          ? "AI सामने की वस्तुएं पहचानेगा और आवाज़ में बताएगा।"
          : "AI will detect objects in view and describe them aloud."}
      </p>
      <div
        className="relative rounded-xl overflow-hidden border border-border w-full max-w-2xl aspect-video flex items-center justify-center"
        style={{ background: "oklch(0.1 0 0)" }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          aria-label="Camera feed"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Camera size={48} className="text-gray-600" />
            {status && <p className="text-gray-400 text-sm">{status}</p>}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {!active ? (
          <Button
            data-ocid="camera.primary_button"
            onClick={startCamera}
            className="text-white hover:opacity-90"
            style={{ background: "oklch(0.58 0.20 258)" }}
          >
            <Camera size={16} className="mr-2" />
            {lang === "hi" ? "कैमरा शुरू करें" : "Start Camera"}
          </Button>
        ) : (
          <Button
            data-ocid="camera.cancel_button"
            onClick={stopCamera}
            variant="destructive"
          >
            <X size={16} className="mr-2" />
            {lang === "hi" ? "बंद करें" : "Stop Camera"}
          </Button>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>("hi");
  const [tab, setTab] = useState<AppTab>("home");
  const [listenState, setListenState] = useState<ListeningState>("idle");
  const [transcript, setTranscript] = useState("");
  const [callingContact, setCallingContact] = useState<Contact | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1);
  const [voicePitch, setVoicePitch] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const t = useCallback(
    (hi: string, en: string) => (lang === "hi" ? hi : en),
    [lang],
  );

  const handleVoiceCommand = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      const now = new Date();
      if (lower.includes("समय") || lower.includes("time")) {
        const ts = now.toLocaleTimeString(lang === "hi" ? "hi-IN" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        speak(
          t(`अभी ${ts} बज रहे हैं।`, `Current time is ${ts}.`),
          lang,
          voiceRate,
          voicePitch,
        );
      } else if (lower.includes("तारीख") || lower.includes("date")) {
        const ds = now.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        speak(t(`आज ${ds} है।`, `Today is ${ds}.`), lang, voiceRate, voicePitch);
      } else if (
        lower.includes("हेलो") ||
        lower.includes("hello") ||
        lower.includes("नमस्ते")
      ) {
        speak(
          t(
            "नमस्ते! मैं सारथी हूँ। आपकी क्या मदद कर सकता हूँ?",
            "Hello! I'm Sarthi. How can I help you?",
          ),
          lang,
          voiceRate,
          voicePitch,
        );
      } else if (lower.includes("कॉल") || lower.includes("call")) {
        const found = CONTACTS.find(
          (c) =>
            lower.includes(c.nameHi) || lower.includes(c.name.toLowerCase()),
        );
        const contact = found || CONTACTS[0];
        setCallingContact(contact);
        speak(
          t(`${contact.nameHi} को कॉल कर रहे हैं।`, `Calling ${contact.name}.`),
          lang,
          voiceRate,
          voicePitch,
        );
      } else if (lower.includes("कैमरा") || lower.includes("camera")) {
        setTab("camera");
        speak(
          t("कैमरा खुल रहा है।", "Opening camera."),
          lang,
          voiceRate,
          voicePitch,
        );
      } else if (lower.includes("ट्यूटोरियल") || lower.includes("tutorial")) {
        setShowTutorial(true);
      } else if (lower.includes("मदद") || lower.includes("help")) {
        speak(
          t(
            "Available commands: समय बताओ, तारीख बताओ, हेलो, राज को कॉल करो, कैमरा खोलो, ट्यूटोरियल।",
            "Available commands: Tell time, Tell date, Hello, Call Raj, Open camera, Tutorial.",
          ),
          lang,
          voiceRate,
          voicePitch,
        );
      } else if (lower.includes("सुनो जी") || lower.includes("suno ji")) {
        speak(
          t("जी, बोलिए! मैं सुन रहा हूँ।", "Yes, please speak! I'm listening."),
          lang,
          voiceRate,
          voicePitch,
        );
      } else {
        speak(
          t(
            "समझ नहीं आया, दोबारा बोलें।",
            "Sorry, I didn't understand. Please try again.",
          ),
          lang,
          voiceRate,
          voicePitch,
        );
      }
    },
    [lang, voiceRate, voicePitch, t],
  );

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListenState("listening");
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setListenState("processing");
      handleVoiceCommand(text);
      setTimeout(() => setListenState("idle"), 1500);
    };
    rec.onerror = () => setListenState("idle");
    rec.onend = () =>
      setListenState((prev) => (prev === "listening" ? "idle" : prev));
    recognitionRef.current = rec;
    rec.start();
  }, [speechSupported, lang, handleVoiceCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListenState("idle");
  }, []);

  const toggleMic = useCallback(() => {
    if (listenState === "idle") startListening();
    else stopListening();
  }, [listenState, startListening, stopListening]);

  const navItems: { id: AppTab; labelHi: string; labelEn: string }[] = [
    { id: "home", labelHi: "होम", labelEn: "Home" },
    { id: "camera", labelHi: "कैमरा", labelEn: "Camera" },
    { id: "contacts", labelHi: "संपर्क", labelEn: "Contacts" },
    { id: "settings", labelHi: "सेटिंग", labelEn: "Settings" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.06 0 0)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-sm"
        style={{ background: "oklch(0.07 0 0 / 0.95)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.58 0.20 258)" }}
          >
            <Mic size={18} className="text-white" />
          </div>
          <span
            className="font-bold text-xl tracking-wider text-white"
            style={{ fontFamily: "BricolageGrotesque, Montserrat, sans-serif" }}
          >
            सारथी
          </span>
        </div>
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setTab(item.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color:
                  tab === item.id ? "oklch(0.7 0.20 258)" : "oklch(0.55 0 0)",
                background:
                  tab === item.id
                    ? "oklch(0.58 0.20 258 / 0.15)"
                    : "transparent",
              }}
            >
              {lang === "hi" ? item.labelHi : item.labelEn}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-ocid="lang.toggle"
            onClick={() => setLang((l) => (l === "hi" ? "en" : "hi"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium text-white transition-colors"
            style={{ borderColor: "oklch(0.22 0 0)" }}
            aria-label="Toggle language"
          >
            <Globe size={14} />
            {lang === "hi" ? "HI" : "EN"}
          </button>
          <button
            type="button"
            className="md:hidden p-1 text-gray-500 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="md:hidden border-b border-border"
          style={{ background: "oklch(0.09 0 0)" }}
        >
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMobileMenuOpen(false);
              }}
              className="w-full px-6 py-3 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {lang === "hi" ? item.labelHi : item.labelEn}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1">
        {/* HOME */}
        {tab === "home" && (
          <>
            <section
              data-ocid="hero.section"
              className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 animate-fade-in-up"
            >
              <Badge
                className="mb-6 text-xs uppercase tracking-widest"
                style={{
                  background: "oklch(0.58 0.20 258 / 0.1)",
                  borderColor: "oklch(0.58 0.20 258 / 0.4)",
                  color: "oklch(0.7 0.20 258)",
                }}
              >
                <WifiOff size={12} className="mr-1" />
                {t("100% ऑफलाइन", "100% Offline")}
              </Badge>

              <h1
                className="font-black uppercase tracking-tight mb-4 text-white"
                style={{
                  fontFamily: "BricolageGrotesque, Montserrat, sans-serif",
                  fontSize: "clamp(3rem, 8vw, 5rem)",
                  lineHeight: 1.05,
                }}
              >
                सारथी
              </h1>
              <p
                className="text-gray-400 max-w-xl mb-10"
                style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)" }}
              >
                {t(
                  "आपका Voice Assistant। हमेशा उपलब्ध। पूरी तरह Offline।",
                  "Your Voice Assistant. Available Anytime. Works Offline.",
                )}
              </p>

              {!speechSupported && (
                <div
                  className="mb-6 px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "oklch(0.55 0.22 27 / 0.15)",
                    border: "1px solid oklch(0.55 0.22 27 / 0.4)",
                    color: "oklch(0.7 0.22 27)",
                  }}
                >
                  {t(
                    "⚠️ आपका browser Speech Recognition support नहीं करता। Chrome या Edge use करें।",
                    "⚠️ Your browser doesn't support Speech Recognition. Use Chrome or Edge.",
                  )}
                </div>
              )}

              <MicButton
                state={listenState}
                onClick={toggleMic}
                label={t(
                  "माइक बटन – बोलने के लिए दबाएं",
                  "Mic button – tap to speak",
                )}
              />

              <p className="mt-5 text-sm font-medium tracking-widest text-gray-500 uppercase">
                {listenState === "listening"
                  ? t("सुन रहा हूँ...", "Listening...")
                  : listenState === "processing"
                    ? t("समझ रहा हूँ...", "Processing...")
                    : t("बोलें", "TAP TO SPEAK")}
              </p>

              {transcript && (
                <div
                  data-ocid="hero.panel"
                  className="mt-4 px-5 py-2.5 rounded-full text-sm text-white border border-border"
                  style={{ background: "oklch(0.13 0 0)" }}
                >
                  "{transcript}"
                </div>
              )}

              <div className="mt-10 w-full max-w-lg">
                <Waveform active={listenState === "listening"} />
              </div>

              <div className="mt-8 flex gap-3 flex-wrap justify-center">
                <Button
                  data-ocid="tutorial.open_modal_button"
                  onClick={() => setShowTutorial(true)}
                  variant="outline"
                  className="border-border text-white hover:bg-white/5"
                >
                  <BookOpen size={16} className="mr-2" />
                  {t("Tutorial", "Tutorial")}
                </Button>
                <Button
                  data-ocid="demo_call.open_modal_button"
                  onClick={() => setCallingContact(CONTACTS[0])}
                  variant="outline"
                  className="border-border text-white hover:bg-white/5"
                >
                  <Phone size={16} className="mr-2" />
                  {t("Demo Call", "Demo Call")}
                </Button>
              </div>
            </section>

            {/* Features */}
            <section
              data-ocid="features.section"
              className="px-4 md:px-8 py-16 max-w-5xl mx-auto"
            >
              <h2
                className="font-bold text-center text-white mb-3"
                style={{
                  fontFamily: "BricolageGrotesque, sans-serif",
                  fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                }}
              >
                {t("मुख्य विशेषताएं", "Key Features")}
              </h2>
              <p className="text-center text-gray-400 mb-10">
                {t(
                  "सारथी की शक्तिशाली capabilities",
                  "Powerful capabilities of Sarthi",
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    icon: <WifiOff size={22} />,
                    tH: "ऑफलाइन Access",
                    tE: "Offline Access",
                    dH: "Internet के बिना पूरा काम करे",
                    dE: "Works fully without internet",
                    id: "features.item.1",
                  },
                  {
                    icon: <Mic size={22} />,
                    tH: "Voice Control",
                    tE: "Voice Control",
                    dH: "100% Hands-free operation",
                    dE: "100% Hands-free operation",
                    id: "features.item.2",
                  },
                  {
                    icon: <Camera size={22} />,
                    tH: "Camera Vision",
                    tE: "Camera Vision",
                    dH: "AI से object detection",
                    dE: "AI-powered object detection",
                    id: "features.item.3",
                  },
                  {
                    icon: <Phone size={22} />,
                    tH: "Daily Assistant",
                    tE: "Daily Assistant",
                    dH: "Call, time, date, reminders",
                    dE: "Calls, time, date, reminders",
                    id: "features.item.4",
                  },
                ].map((feat) => (
                  <div
                    key={feat.id}
                    data-ocid={feat.id}
                    className="rounded-xl p-6 border border-border flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1"
                    style={{ background: "oklch(0.12 0 0)" }}
                  >
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{
                        background: "oklch(0.58 0.20 258 / 0.12)",
                        color: "oklch(0.7 0.20 258)",
                      }}
                    >
                      {feat.icon}
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-white mb-1"
                        style={{ fontFamily: "BricolageGrotesque, sans-serif" }}
                      >
                        {lang === "hi" ? feat.tH : feat.tE}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {lang === "hi" ? feat.dH : feat.dE}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works */}
            <section
              data-ocid="howto.section"
              className="px-4 py-16"
              style={{ background: "oklch(0.08 0 0)" }}
            >
              <div className="max-w-3xl mx-auto text-center">
                <h2
                  className="font-bold text-white mb-3"
                  style={{
                    fontFamily: "BricolageGrotesque, sans-serif",
                    fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                  }}
                >
                  {t("कैसे काम करता है?", "How It Works")}
                </h2>
                <p className="text-gray-400 mb-12">
                  {t("तीन आसान steps", "Three simple steps")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      num: "01",
                      tH: "माइक दबाएं या 'सुनो जी' बोलें",
                      tE: "Tap mic or say 'Suno Ji'",
                      id: "howto.item.1",
                    },
                    {
                      num: "02",
                      tH: "हिंदी या English में command बोलें",
                      tE: "Speak your command in Hindi or English",
                      id: "howto.item.2",
                    },
                    {
                      num: "03",
                      tH: "सारथी सुनेगा और action लेगा",
                      tE: "Sarthi responds and takes action",
                      id: "howto.item.3",
                    },
                  ].map((step) => (
                    <div
                      key={step.id}
                      data-ocid={step.id}
                      className="flex flex-col items-center gap-3"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl text-white"
                        style={{
                          fontFamily: "BricolageGrotesque, sans-serif",
                          background:
                            "linear-gradient(135deg, oklch(0.58 0.20 258), oklch(0.45 0.18 270))",
                        }}
                      >
                        {step.num}
                      </div>
                      <p className="text-white font-medium">
                        {lang === "hi" ? step.tH : step.tE}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Commands */}
            <section className="px-4 md:px-8 py-16 max-w-5xl mx-auto">
              <h2
                className="font-bold text-white mb-8 text-center"
                style={{
                  fontFamily: "BricolageGrotesque, sans-serif",
                  fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                }}
              >
                {t("Voice Commands", "Voice Commands")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    hi: "'समय बताओ'",
                    en: "'Tell me the time'",
                    act: t("→ समय बताएगा", "→ Tells current time"),
                  },
                  {
                    hi: "'तारीख बताओ'",
                    en: "'Tell me the date'",
                    act: t("→ तारीख बताएगा", "→ Tells today's date"),
                  },
                  {
                    hi: "'राज को कॉल करो'",
                    en: "'Call Raj'",
                    act: t("→ Call करेगा", "→ Places a call"),
                  },
                  {
                    hi: "'कैमरा खोलो'",
                    en: "'Open camera'",
                    act: t("→ Camera खोलेगा", "→ Opens camera"),
                  },
                  {
                    hi: "'हेलो'",
                    en: "'Hello'",
                    act: t("→ Greeting देगा", "→ Greets you"),
                  },
                  {
                    hi: "'मदद'",
                    en: "'Help'",
                    act: t("→ Commands बताएगा", "→ Lists commands"),
                  },
                ].map((cmd) => (
                  <div
                    key={cmd.en}
                    className="flex items-center justify-between px-5 py-3.5 rounded-lg border border-border"
                    style={{ background: "oklch(0.11 0 0)" }}
                  >
                    <span
                      className="font-mono font-medium"
                      style={{ color: "oklch(0.7 0.20 258)" }}
                    >
                      {lang === "hi" ? cmd.hi : cmd.en}
                    </span>
                    <span className="text-gray-500 text-sm">{cmd.act}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* CAMERA */}
        {tab === "camera" && (
          <section className="px-4 py-16 max-w-4xl mx-auto animate-fade-in-up">
            <CameraPanel
              lang={lang}
              voiceRate={voiceRate}
              voicePitch={voicePitch}
            />
          </section>
        )}

        {/* CONTACTS */}
        {tab === "contacts" && (
          <section
            data-ocid="contacts.section"
            className="px-4 py-16 max-w-xl mx-auto animate-fade-in-up"
          >
            <h2
              className="font-bold text-white mb-2 text-center"
              style={{
                fontFamily: "BricolageGrotesque, sans-serif",
                fontSize: "clamp(1.6rem, 4vw, 2rem)",
              }}
            >
              {t("संपर्क", "Contacts")}
            </h2>
            <p className="text-gray-400 text-center mb-8">
              {t("Voice से call करें", "Call by voice command")}
            </p>
            <div className="flex flex-col gap-3">
              {CONTACTS.map((c, i) => (
                <div
                  key={c.name}
                  data-ocid={`contacts.item.${i + 1}`}
                  className="flex items-center justify-between px-5 py-4 rounded-xl border border-border transition-all"
                  style={{ background: "oklch(0.12 0 0)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.emoji}</span>
                    <div>
                      <p className="text-white font-medium">
                        {lang === "hi" ? c.nameHi : c.name}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {t(`'${c.nameHi} को कॉल करो'`, `'Call ${c.name}'`)}
                      </p>
                    </div>
                  </div>
                  <Button
                    data-ocid={`contacts.delete_button.${i + 1}`}
                    onClick={() => setCallingContact(c)}
                    size="sm"
                    className="text-white hover:opacity-90"
                    style={{ background: "oklch(0.58 0.20 258)" }}
                  >
                    <Phone size={14} className="mr-1" />
                    {t("Call", "Call")}
                  </Button>
                </div>
              ))}
            </div>
            <div
              className="mt-8 p-5 rounded-xl border text-center"
              style={{
                background: "oklch(0.58 0.20 258 / 0.05)",
                borderColor: "oklch(0.58 0.20 258 / 0.2)",
              }}
            >
              <Mic
                size={20}
                className="mx-auto mb-2"
                style={{ color: "oklch(0.7 0.20 258)" }}
              />
              <p className="text-gray-400 text-sm">
                {t(
                  "आप voice से भी call कर सकते हैं। बस माइक दबाएं और बोलें: 'राज को कॉल करो'",
                  "You can also call by voice. Tap mic and say: 'Call Raj'",
                )}
              </p>
            </div>
          </section>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <section
            data-ocid="settings.section"
            className="px-4 py-16 max-w-xl mx-auto animate-fade-in-up"
          >
            <h2
              className="font-bold text-white mb-8 text-center"
              style={{
                fontFamily: "BricolageGrotesque, sans-serif",
                fontSize: "clamp(1.6rem, 4vw, 2rem)",
              }}
            >
              {t("सेटिंग", "Settings")}
            </h2>
            <div
              className="rounded-xl border border-border p-6 flex flex-col gap-8"
              style={{ background: "oklch(0.12 0 0)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {t("भाषा", "Language")}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t("हिंदी / English", "Hindi / English")}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="settings.toggle"
                  onClick={() => setLang((l) => (l === "hi" ? "en" : "hi"))}
                  className="px-5 py-2 rounded-full border border-border text-white font-medium flex items-center gap-2"
                >
                  <Globe size={16} />
                  {lang === "hi" ? "HI" : "EN"}
                </button>
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">
                      {t("आवाज़ की गति", "Voice Speed")}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {voiceRate.toFixed(1)}x
                    </p>
                  </div>
                  <Volume2 size={18} className="text-gray-500" />
                </div>
                <Slider
                  data-ocid="settings.input"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceRate]}
                  onValueChange={([v]) => setVoiceRate(v)}
                  aria-label="Voice speed"
                />
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-white font-medium">
                      {t("आवाज़ का Pitch", "Voice Pitch")}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {voicePitch.toFixed(1)}
                    </p>
                  </div>
                  <Mic size={18} className="text-gray-500" />
                </div>
                <Slider
                  data-ocid="settings.select"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voicePitch]}
                  onValueChange={([v]) => setVoicePitch(v)}
                  aria-label="Voice pitch"
                />
              </div>
              <div className="pt-2 border-t border-border">
                <Button
                  data-ocid="settings.primary_button"
                  onClick={() => setShowTutorial(true)}
                  className="w-full text-white"
                  style={{ background: "oklch(0.58 0.20 258)" }}
                >
                  <BookOpen size={16} className="mr-2" />
                  {t("Tutorial शुरू करें", "Start Tutorial")}
                </Button>
              </div>
            </div>
            <div
              className="mt-6 p-4 rounded-xl border border-border text-center"
              style={{ background: "oklch(0.1 0 0)" }}
            >
              <p className="text-gray-500 text-sm">
                🔒{" "}
                {t(
                  "सारथी पूरी तरह Privacy-first है। कोई data बाहर नहीं जाता।",
                  "Sarthi is fully privacy-first. No data leaves your device.",
                )}
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border px-6 py-10"
        style={{ background: "oklch(0.07 0 0)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.58 0.20 258)" }}
                >
                  <Mic size={14} className="text-white" />
                </div>
                <span
                  className="font-bold text-white tracking-wider"
                  style={{ fontFamily: "BricolageGrotesque, sans-serif" }}
                >
                  सारथी
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                {t(
                  "दृष्टिहीन उपयोगकर्ताओं के लिए offline voice assistant।",
                  "Offline voice assistant for visually impaired users.",
                )}
              </p>
            </div>
            <div>
              <p className="text-white font-medium mb-3">
                {t("Quick Links", "Quick Links")}
              </p>
              <div className="flex flex-col gap-2">
                {["Accessibility", "Privacy", "Support"].map((l) => (
                  <a
                    key={l}
                    href="/"
                    className="text-gray-500 text-sm hover:text-white transition-colors"
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-medium mb-3">
                {t("Connect", "Connect")}
              </p>
              <div className="flex gap-3">
                {["T", "G", "L"].map((s) => (
                  <a
                    key={s}
                    href="/"
                    className="w-9 h-9 rounded-lg flex items-center justify-center border border-border text-gray-500 hover:text-white hover:border-blue-500/50 transition-colors text-xs font-bold"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} सारथी.
            </p>
            <p className="text-gray-600 text-sm">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {callingContact && (
        <CallingOverlay
          contact={callingContact}
          onEnd={() => setCallingContact(null)}
          lang={lang}
        />
      )}
      <TutorialModal
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        lang={lang}
        voiceRate={voiceRate}
        voicePitch={voicePitch}
      />
    </div>
  );
}
