export const SITE = {
  name: "STLTH Pawn",
  phone: "0416 273 699",
  phoneHref: "tel:+61416273699",
  email: "tappo@mail.com",
  areas: ["Brisbane", "Ipswich", "Gold Coast", "Toowoomba"],
  maxLoanPercent: 60,
  maxTermMonths: 3,
} as const;

export const ASSETS = [
  { slug: "car", label: "Car" },
  { slug: "motorbike", label: "Motorbike" },
  { slug: "caravan", label: "Caravan" },
  { slug: "trailer", label: "Trailer" },
  { slug: "boat", label: "Boat / jet ski" },
  { slug: "other", label: "Something else" },
] as const;

export const FEES = [
  { term: "Up to 14 days", rate: "10%", note: "of the loan amount" },
  { term: "Up to 1 month", rate: "20%", note: "of the loan amount" },
];
