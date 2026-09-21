export type SocialIcon = "facebook" | "instagram" | "phone";

export type Social = {
  href: string;
  label: string;
  icon: SocialIcon;
};

export const socials: Social[] = [
  {
    href: "https://www.facebook.com/xpubgirne",
    label: "Facebook",
    icon: "facebook",
  },
  {
    href: "https://www.instagram.com/xpubgirne/",
    label: "Instagram",
    icon: "instagram",
  },
  {
    href: "tel:+905338547040",
    label: "Phone",
    icon: "phone",
  },
];
