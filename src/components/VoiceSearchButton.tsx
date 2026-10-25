import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

// Uses the browser's speech service only; no reading history is uploaded by the app.
export function VoiceSearchButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const recognition = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    const current = recognition.current;
    if (current) {
      current.onresult = null;
      current.onerror = null;
      current.onend = null;
      current.abort();
    }
    recognition.current = null;
  }, []);

  const start = () => {
    if (recognition.current) {
      recognition.current.stop();
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) {
      setMessage("البحث بالصوت غير مدعوم في هذا الجهاز أو المتصفح. يمكنك البحث بالكتابة.");
      return;
    }
    const current = new Constructor();
    let received = false;
    let failed = false;
    current.lang = "ar-SA";
    current.continuous = false;
    current.interimResults = false;
    current.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" ").trim();
      if (!text) return;
      received = true;
      onTranscript(text);
      setMessage("");
    };
    current.onerror = (event) => {
      failed = true;
      setListening(false);
      const messages: Record<string, string> = {
        "not-allowed": "لم يُسمح باستخدام الميكروفون. اسمح به من إعدادات جهازك أو المتصفح ثم حاول مجددًا.",
        "service-not-allowed": "خدمة البحث بالصوت غير متاحة في هذا المتصفح. يمكنك البحث بالكتابة.",
        "audio-capture": "تعذّر الوصول إلى الميكروفون. تأكد من أنه متاح ثم حاول مجددًا.",
        "network": "تعذّر الاتصال بخدمة الصوت. تأكد من الإنترنت ثم حاول مجددًا.",
        "no-speech": "لم أسمع كلامًا واضحًا. اضغط الميكروفون وحاول مجددًا.",
        "language-not-supported": "خدمة الصوت لا تدعم العربية على هذا الجهاز. يمكنك البحث بالكتابة.",
      };
      setMessage(event.error === "aborted" ? "" : messages[event.error] ?? "تعذّر البحث بالصوت. حاول مجددًا أو استخدم الكتابة.");
    };
    current.onend = () => {
      if (recognition.current !== current) return;
      recognition.current = null;
      setListening(false);
      if (!received && !failed) setMessage("لم أسمع كلامًا واضحًا. اضغط الميكروفون وحاول مجددًا.");
    };
    recognition.current = current;
    setMessage("");
    try {
      current.start();
      setListening(true);
    } catch {
      recognition.current = null;
      setListening(false);
      setMessage("تعذّر تشغيل الميكروفون. حاول مجددًا أو استخدم الكتابة.");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="default"
        onClick={start}
        aria-label={listening ? "إيقاف البحث بالصوت" : "البحث بالصوت"}
        aria-pressed={listening}
        title={listening ? "إيقاف البحث بالصوت" : "البحث بالصوت"}
        className={`h-11 shrink-0 rounded-full border-gold/50 px-4 text-base font-bold ${listening ? "bg-primary text-primary-foreground ring-2 ring-gold" : "bg-card text-primary"}`}
      >
        {listening ? <Square aria-hidden="true" /> : <Mic aria-hidden="true" />}
        <span>{listening ? "إيقاف الاستماع" : "بحث بالصوت"}</span>
      </Button>
      {(listening || message) && (
        <p role="status" className="order-last w-full text-center text-sm text-primary">
          {listening ? "أستمع الآن…" : message}
        </p>
      )}
    </>
  );
}