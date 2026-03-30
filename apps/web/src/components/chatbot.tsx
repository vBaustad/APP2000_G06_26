import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hei! Jeg kan hjelpe deg med turer, aktiviteter, vanskelighetsgrad og innlogging.",
    },
  ]);
  const [input, setInput] = useState("");

  function getBotResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes("lett")) {
      return "Jeg anbefaler at du ser etter turer med lav vanskelighetsgrad og kort varighet.";
    }

    if (message.includes("middels")) {
      return "Turer med middels vanskelighetsgrad passer fint hvis du vil ha litt utfordring uten at det blir for krevende.";
    }

    if (message.includes("vanskelig") || message.includes("hard")) {
      return "Da kan du utforske mer krevende turer med høyere vanskelighetsgrad og lengre varighet.";
    }

    if (message.includes("vinter") || message.includes("ski") || message.includes("snø")) {
      return "Du kan utforske vinteraktiviteter som skiturer og fjellturer i snø.";
    }

    if (message.includes("sykkel")) {
      return "Vi har flere aktiviteter for sykkelturer. Prøv å se etter turer som passer ditt nivå.";
    }

    if (message.includes("fjell")) {
      return "Fjellturer er perfekte hvis du ønsker utsikt og litt mer utfordring.";
    }

    if (message.includes("vann") || message.includes("strand") || message.includes("sjø")) {
      return "Du kan se etter turer nær vann og kystområder dersom du ønsker en roligere naturopplevelse.";
    }

    if (message.includes("logg inn") || message.includes("innlogging") || message.includes("login")) {
      return "For å logge inn kan du trykke på innloggingsknappen øverst på siden.";
    }

    if (message.includes("konto") || message.includes("bruker")) {
      return "På profilsiden kan du se og administrere brukerkontoen din.";
    }

    if (message.includes("hjelp") || message.includes("kontakt")) {
      return "Hvis du trenger hjelp, kan du kontakte oss via kontaktskjemaet på nettsiden.";
    }

    if (message.includes("aktivitet") || message.includes("aktiviteter")) {
      return "Du kan utforske aktiviteter som fjelltur, sykkel, vinteraktiviteter og turer nær vann.";
    }

    if (message.includes("tur")) {
      return "Jeg kan hjelpe deg med å finne turer basert på aktivitet og vanskelighetsgrad.";
    }

    return "Beklager, jeg forstår ikke helt spørsmålet ennå. Prøv å spørre om turer, aktiviteter, vanskelighetsgrad eller innlogging.";
  }

  function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
    };

    const botMessage: Message = {
      sender: "bot",
      text: getBotResponse(input),
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-green-700 text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col overflow-hidden z-50">
          <div className="bg-green-700 text-white px-4 py-3 font-semibold flex items-center justify-between">
            <span>Turbot</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  message.sender === "user"
                    ? "ml-auto bg-green-700 text-white"
                    : "mr-auto bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 flex gap-2 bg-white">
            <input
              type="text"
              placeholder="Skriv en melding..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <button
              onClick={handleSend}
              className="bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}