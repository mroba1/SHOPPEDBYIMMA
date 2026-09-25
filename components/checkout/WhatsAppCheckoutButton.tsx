import { orderMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { WhatsAppIcon } from "@/components/ui/Icons";

export function WhatsAppCheckoutButton({ code, className, label = "Continue to WhatsApp" }: { code: string; className?: string; label?: string }) {
  return (
    <a
      href={whatsappLink(orderMessage(code))}
      target="_blank"
      rel="noopener"
      className={cn(
        "group relative inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-blush px-8 text-sm font-bold tracking-[0.16em] text-charcoal uppercase shadow-[0_18px_40px_-18px_rgba(226,189,170,0.9)] transition active:scale-[0.98]",
        className,
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <WhatsAppIcon width={22} height={22} />
      {label}
    </a>
  );
}
