export function toBengaliNumerals(num: number | string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

export function formatPriceBDT(
  amount: number,
  language: "bn" | "en" = "bn",
  showSymbol: boolean = true
): string {
  const formattedEn = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);

  if (language === "bn") {
    const formattedBn = toBengaliNumerals(formattedEn);
    return showSymbol ? `৳${formattedBn}` : formattedBn;
  }

  return showSymbol ? `৳${formattedEn}` : formattedEn;
}

export function isValidBDPhoneNumber(phone: string): boolean {
  // Accepts: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX
  const cleaned = phone.replace(/[\s-]/g, "");
  const bdPhoneRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;
  return bdPhoneRegex.test(cleaned);
}

export function formatBDPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+880")) {
    return cleaned;
  }
  if (cleaned.startsWith("880")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("01")) {
    return `+88${cleaned}`;
  }
  return phone;
}

export function formatDate(dateString: string, language: "bn" | "en" = "bn"): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (language === "bn") {
      const day = toBengaliNumerals(date.getDate());
      const monthNamesBn = [
        "জানুয়ারি",
        "ফেব্রুয়ারি",
        "মার্চ",
        "এপ্রিল",
        "মে",
        "জুন",
        "জুলাই",
        "আগস্ট",
        "সেপ্টেম্বর",
        "অক্টোবর",
        "নভেম্বর",
        "ডিসেম্বর",
      ];
      const month = monthNamesBn[date.getMonth()];
      const year = toBengaliNumerals(date.getFullYear());
      return `${day} ${month}, ${year}`;
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}
