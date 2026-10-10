export interface Brand { id: string; name: {tr: string; en: string}; category: string; aliases: string[]; domains: string[]; asset: string | null; color: string | null; assetNotes: { [key: string]: unknown }; domainSource: string }
export const brandCatalog: readonly Brand[] = [
  {
    "id": "amazon",
    "name": {
      "tr": "Amazon",
      "en": "Amazon"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "amazon.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://amazon.com"
    },
    "domainSource": "https://amazon.com"
  },
  {
    "id": "amazon-prime",
    "name": {
      "tr": "Amazon Prime",
      "en": "Amazon Prime"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "primevideo.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://primevideo.com"
    },
    "domainSource": "https://primevideo.com"
  },
  {
    "id": "netflix",
    "name": {
      "tr": "Netflix",
      "en": "Netflix"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "netflix.com"
    ],
    "asset": "netflix.svg",
    "color": "#E50914",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://brand.netflix.com/en/assets/logos",
      "guidelines": "https://brand.netflix.com/en/assets/logos",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://netflix.com"
  },
  {
    "id": "hbo-max",
    "name": {
      "tr": "HBO Max",
      "en": "HBO Max"
    },
    "category": "video",
    "aliases": [
      "Max"
    ],
    "domains": [
      "hbomax.com"
    ],
    "asset": "hbo-max.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://commons.wikimedia.org/wiki/File:Max_2025_logo.svg",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://hbomax.com"
  },
  {
    "id": "youtube-premium",
    "name": {
      "tr": "YouTube Premium",
      "en": "YouTube Premium"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "youtube.com"
    ],
    "asset": "youtube-premium.svg",
    "color": "#FF0000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors",
      "guidelines": "https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://youtube.com"
  },
  {
    "id": "youtube",
    "name": {
      "tr": "YouTube",
      "en": "YouTube"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "youtube.com"
    ],
    "asset": "youtube.svg",
    "color": "#FF0000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors",
      "guidelines": "https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://youtube.com"
  },
  {
    "id": "google-account",
    "name": {
      "tr": "Google Account",
      "en": "Google Account"
    },
    "category": "productivity",
    "aliases": [
      "Google Hesabı"
    ],
    "domains": [
      "accounts.google.com"
    ],
    "asset": "google-account.svg",
    "color": "#4285F4",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://partnermarketinghub.withgoogle.com",
      "guidelines": "https://about.google/brand-resource-center/brand-elements/",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://accounts.google.com"
  },
  {
    "id": "apple-account",
    "name": {
      "tr": "Apple Account",
      "en": "Apple Account"
    },
    "category": "productivity",
    "aliases": [
      "Apple Hesabı"
    ],
    "domains": [
      "account.apple.com"
    ],
    "asset": "apple-account.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.apple.com",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://account.apple.com"
  },
  {
    "id": "icloud",
    "name": {
      "tr": "iCloud",
      "en": "iCloud"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "icloud.com"
    ],
    "asset": "iCloud.svg",
    "color": "#3693F3",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://commons.wikimedia.org/wiki/File:ICloud_logo.svg",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://icloud.com"
  },
  {
    "id": "gmail",
    "name": {
      "tr": "Gmail",
      "en": "Gmail"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "mail.google.com"
    ],
    "asset": "gmail.svg",
    "color": "#EA4335",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://fonts.gstatic.com/s/i/productlogos/gmail_2020q4/v8/192px.svg",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://mail.google.com"
  },
  {
    "id": "outlook",
    "name": {
      "tr": "Outlook",
      "en": "Outlook"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "outlook.live.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://outlook.live.com"
    },
    "domainSource": "https://outlook.live.com"
  },
  {
    "id": "yahoo",
    "name": {
      "tr": "Yahoo",
      "en": "Yahoo"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "yahoo.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://yahoo.com"
    },
    "domainSource": "https://yahoo.com"
  },
  {
    "id": "edevlet",
    "name": {
      "tr": "e-Devlet",
      "en": "e-Devlet"
    },
    "category": "government",
    "aliases": [
      "E Devlet"
    ],
    "domains": [
      "turkiye.gov.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://turkiye.gov.tr"
    },
    "domainSource": "https://turkiye.gov.tr"
  },
  {
    "id": "mhrs",
    "name": {
      "tr": "MHRS",
      "en": "MHRS"
    },
    "category": "government",
    "aliases": [],
    "domains": [
      "mhrs.gov.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://mhrs.gov.tr"
    },
    "domainSource": "https://mhrs.gov.tr"
  },
  {
    "id": "enabiz",
    "name": {
      "tr": "e-Nabız",
      "en": "e-Nabız"
    },
    "category": "government",
    "aliases": [
      "e Nabiz"
    ],
    "domains": [
      "enabiz.gov.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://enabiz.gov.tr"
    },
    "domainSource": "https://enabiz.gov.tr"
  },
  {
    "id": "hepsiburada",
    "name": {
      "tr": "Hepsiburada",
      "en": "Hepsiburada"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "hepsiburada.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://hepsiburada.com"
    },
    "domainSource": "https://hepsiburada.com"
  },
  {
    "id": "trendyol",
    "name": {
      "tr": "Trendyol",
      "en": "Trendyol"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "trendyol.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://trendyol.com"
    },
    "domainSource": "https://trendyol.com"
  },
  {
    "id": "instagram",
    "name": {
      "tr": "Instagram",
      "en": "Instagram"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "instagram.com"
    ],
    "asset": "instagram.svg",
    "color": "#FF0069",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://about.meta.com/brand/resources/instagram",
      "guidelines": "https://about.meta.com/brand/resources/instagram",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://instagram.com"
  },
  {
    "id": "facebook",
    "name": {
      "tr": "Facebook",
      "en": "Facebook"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "facebook.com"
    ],
    "asset": "facebook.svg",
    "color": "#0866FF",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://about.meta.com/brand/resources/facebook/logo",
      "guidelines": "https://about.meta.com/brand/resources/facebook/logo",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://facebook.com"
  },
  {
    "id": "spotify",
    "name": {
      "tr": "Spotify",
      "en": "Spotify"
    },
    "category": "music",
    "aliases": [],
    "domains": [
      "spotify.com"
    ],
    "asset": "spotify.svg",
    "color": "#1ED760",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://developer.spotify.com/documentation/general/design-and-branding/#using-our-logo",
      "guidelines": "https://developer.spotify.com/documentation/general/design-and-branding/#using-our-logo",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://spotify.com"
  },
  {
    "id": "apple-music",
    "name": {
      "tr": "Apple Music",
      "en": "Apple Music"
    },
    "category": "music",
    "aliases": [],
    "domains": [
      "music.apple.com"
    ],
    "asset": "apple-music.svg",
    "color": "#FA243C",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.apple.com/itunes/marketing-on-music/identity-guidelines.html#apple-music-icon",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://music.apple.com"
  },
  {
    "id": "fizy",
    "name": {
      "tr": "fizy",
      "en": "fizy"
    },
    "category": "music",
    "aliases": [],
    "domains": [
      "fizy.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://fizy.com"
    },
    "domainSource": "https://fizy.com"
  },
  {
    "id": "turkcell",
    "name": {
      "tr": "Turkcell",
      "en": "Turkcell"
    },
    "category": "telecom",
    "aliases": [],
    "domains": [
      "turkcell.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://turkcell.com.tr"
    },
    "domainSource": "https://turkcell.com.tr"
  },
  {
    "id": "vodafone",
    "name": {
      "tr": "Vodafone",
      "en": "Vodafone"
    },
    "category": "telecom",
    "aliases": [],
    "domains": [
      "vodafone.com.tr"
    ],
    "asset": "vodafone.svg",
    "color": "#E60000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://web.vodafone.com.eg",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://vodafone.com.tr"
  },
  {
    "id": "turk-telekom",
    "name": {
      "tr": "Türk Telekom",
      "en": "Türk Telekom"
    },
    "category": "telecom",
    "aliases": [
      "Turk Telekom"
    ],
    "domains": [
      "turktelekom.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://turktelekom.com.tr"
    },
    "domainSource": "https://turktelekom.com.tr"
  },
  {
    "id": "superonline",
    "name": {
      "tr": "Superonline",
      "en": "Superonline"
    },
    "category": "telecom",
    "aliases": [],
    "domains": [
      "superonline.net"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://superonline.net"
    },
    "domainSource": "https://superonline.net"
  },
  {
    "id": "gain",
    "name": {
      "tr": "GAIN",
      "en": "GAIN"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "gain.tv"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://gain.tv"
    },
    "domainSource": "https://gain.tv"
  },
  {
    "id": "exxen",
    "name": {
      "tr": "Exxen",
      "en": "Exxen"
    },
    "category": "video",
    "aliases": [
      "Exen"
    ],
    "domains": [
      "exxen.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://exxen.com"
    },
    "domainSource": "https://exxen.com"
  },
  {
    "id": "bein-connect",
    "name": {
      "tr": "beIN CONNECT",
      "en": "beIN CONNECT"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "beinconnect.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://beinconnect.com.tr"
    },
    "domainSource": "https://beinconnect.com.tr"
  },
  {
    "id": "tod",
    "name": {
      "tr": "TOD",
      "en": "TOD"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "todtv.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://todtv.com.tr"
    },
    "domainSource": "https://todtv.com.tr"
  },
  {
    "id": "sahibinden",
    "name": {
      "tr": "sahibinden",
      "en": "sahibinden"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "sahibinden.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://sahibinden.com"
    },
    "domainSource": "https://sahibinden.com"
  },
  {
    "id": "migros",
    "name": {
      "tr": "Migros",
      "en": "Migros"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "migros.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://migros.com.tr"
    },
    "domainSource": "https://migros.com.tr"
  },
  {
    "id": "halkbank",
    "name": {
      "tr": "Halkbank",
      "en": "Halkbank"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "halkbank.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://halkbank.com.tr"
    },
    "domainSource": "https://halkbank.com.tr"
  },
  {
    "id": "ziraat",
    "name": {
      "tr": "Ziraat Bankası",
      "en": "Ziraat Bankası"
    },
    "category": "banking",
    "aliases": [
      "Ziraat"
    ],
    "domains": [
      "ziraatbank.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://ziraatbank.com.tr"
    },
    "domainSource": "https://ziraatbank.com.tr"
  },
  {
    "id": "bankkart",
    "name": {
      "tr": "Bankkart Mobil",
      "en": "Bankkart Mobil"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "bankkart.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://bankkart.com.tr"
    },
    "domainSource": "https://bankkart.com.tr"
  },
  {
    "id": "chatgpt",
    "name": {
      "tr": "ChatGPT",
      "en": "ChatGPT"
    },
    "category": "ai",
    "aliases": [
      "OpenAI"
    ],
    "domains": [
      "chatgpt.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://chatgpt.com"
    },
    "domainSource": "https://chatgpt.com"
  },
  {
    "id": "gemini",
    "name": {
      "tr": "Gemini",
      "en": "Gemini"
    },
    "category": "ai",
    "aliases": [
      "Bard"
    ],
    "domains": [
      "gemini.google.com"
    ],
    "asset": "gemini.svg",
    "color": "#8E75B2",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://gemini.google.com",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://gemini.google.com"
  },
  {
    "id": "grok",
    "name": {
      "tr": "Grok",
      "en": "Grok"
    },
    "category": "ai",
    "aliases": [],
    "domains": [
      "grok.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://grok.com"
    },
    "domainSource": "https://grok.com"
  },
  {
    "id": "claude",
    "name": {
      "tr": "Claude",
      "en": "Claude"
    },
    "category": "ai",
    "aliases": [],
    "domains": [
      "claude.ai"
    ],
    "asset": "claude.svg",
    "color": "#D97757",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://claude.ai",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://claude.ai"
  },
  {
    "id": "getir",
    "name": {
      "tr": "Getir",
      "en": "Getir"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "getir.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://getir.com"
    },
    "domainSource": "https://getir.com"
  },
  {
    "id": "yemeksepeti",
    "name": {
      "tr": "Yemeksepeti",
      "en": "Yemeksepeti"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "yemeksepeti.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://yemeksepeti.com"
    },
    "domainSource": "https://yemeksepeti.com"
  },
  {
    "id": "mobile-legends",
    "name": {
      "tr": "Mobile Legends: Bang Bang",
      "en": "Mobile Legends: Bang Bang"
    },
    "category": "games",
    "aliases": [
      "Mobile Legends"
    ],
    "domains": [
      "mobilelegends.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://mobilelegends.com"
    },
    "domainSource": "https://mobilelegends.com"
  },
  {
    "id": "shazam",
    "name": {
      "tr": "Shazam",
      "en": "Shazam"
    },
    "category": "music",
    "aliases": [],
    "domains": [
      "shazam.com"
    ],
    "asset": "shazam.svg",
    "color": "#0088FF",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://shazam.com",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://shazam.com"
  },
  {
    "id": "arabam",
    "name": {
      "tr": "arabam.com",
      "en": "arabam.com"
    },
    "category": "shopping",
    "aliases": [],
    "domains": [
      "arabam.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://arabam.com"
    },
    "domainSource": "https://arabam.com"
  },
  {
    "id": "zoom",
    "name": {
      "tr": "Zoom",
      "en": "Zoom"
    },
    "category": "productivity",
    "aliases": [
      "zoom.us"
    ],
    "domains": [
      "zoom.com"
    ],
    "asset": "zoom.svg",
    "color": "#0B5CFF",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://brand.zoom.us/media-library/",
      "guidelines": "https://brand.zoom.us/usage-legal/",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://zoom.com"
  },
  {
    "id": "kariyer",
    "name": {
      "tr": "kariyer.net",
      "en": "kariyer.net"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "kariyer.net"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://kariyer.net"
    },
    "domainSource": "https://kariyer.net"
  },
  {
    "id": "linkedin",
    "name": {
      "tr": "LinkedIn",
      "en": "LinkedIn"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "linkedin.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://linkedin.com"
    },
    "domainSource": "https://linkedin.com"
  },
  {
    "id": "reddit",
    "name": {
      "tr": "Reddit",
      "en": "Reddit"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "reddit.com"
    ],
    "asset": "reddit.svg",
    "color": "#FF4500",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.redditinc.com/brand",
      "guidelines": "https://www.redditinc.com/brand",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://reddit.com"
  },
  {
    "id": "okcupid",
    "name": {
      "tr": "OkCupid",
      "en": "OkCupid"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "okcupid.com"
    ],
    "asset": "okcupid.svg",
    "color": "#0500BE",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://okcupid.com/press",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://okcupid.com"
  },
  {
    "id": "tinder",
    "name": {
      "tr": "Tinder",
      "en": "Tinder"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "tinder.com"
    ],
    "asset": "tinder.svg",
    "color": "#FF6B6B",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.gotinder.com/press",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://tinder.com"
  },
  {
    "id": "bionluk",
    "name": {
      "tr": "Bionluk",
      "en": "Bionluk"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "bionluk.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://bionluk.com"
    },
    "domainSource": "https://bionluk.com"
  },
  {
    "id": "dropbox",
    "name": {
      "tr": "Dropbox",
      "en": "Dropbox"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "dropbox.com"
    ],
    "asset": "dropbox.svg",
    "color": "#0061FF",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.dropbox.com/branding",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://dropbox.com"
  },
  {
    "id": "telegram",
    "name": {
      "tr": "Telegram",
      "en": "Telegram"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "telegram.org"
    ],
    "asset": "telegram.svg",
    "color": "#26A5E4",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://telegram.org/tour/screenshots",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://telegram.org"
  },
  {
    "id": "whatsapp",
    "name": {
      "tr": "WhatsApp",
      "en": "WhatsApp"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "whatsapp.com"
    ],
    "asset": "whatsapp.svg",
    "color": "#25D366",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://about.meta.com/brand/resources/whatsapp/whatsapp-brand",
      "guidelines": "https://about.meta.com/brand/resources/whatsapp/whatsapp-brand",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://whatsapp.com"
  },
  {
    "id": "is-bankasi",
    "name": {
      "tr": "Türkiye İş Bankası",
      "en": "Türkiye İş Bankası"
    },
    "category": "banking",
    "aliases": [
      "İş Bankası",
      "Isbank"
    ],
    "domains": [
      "isbank.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://isbank.com.tr"
    },
    "domainSource": "https://isbank.com.tr"
  },
  {
    "id": "akbank",
    "name": {
      "tr": "Akbank",
      "en": "Akbank"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "akbank.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://akbank.com"
    },
    "domainSource": "https://akbank.com"
  },
  {
    "id": "garanti-bbva",
    "name": {
      "tr": "Garanti BBVA",
      "en": "Garanti BBVA"
    },
    "category": "banking",
    "aliases": [
      "Garanti"
    ],
    "domains": [
      "garantibbva.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://garantibbva.com.tr"
    },
    "domainSource": "https://garantibbva.com.tr"
  },
  {
    "id": "yapi-kredi",
    "name": {
      "tr": "Yapı Kredi",
      "en": "Yapı Kredi"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "yapikredi.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://yapikredi.com.tr"
    },
    "domainSource": "https://yapikredi.com.tr"
  },
  {
    "id": "vakifbank",
    "name": {
      "tr": "VakıfBank",
      "en": "VakıfBank"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "vakifbank.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://vakifbank.com.tr"
    },
    "domainSource": "https://vakifbank.com.tr"
  },
  {
    "id": "qnb",
    "name": {
      "tr": "QNB",
      "en": "QNB"
    },
    "category": "banking",
    "aliases": [
      "QNB Finansbank",
      "Finansbank"
    ],
    "domains": [
      "qnb.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://qnb.com.tr"
    },
    "domainSource": "https://qnb.com.tr"
  },
  {
    "id": "denizbank",
    "name": {
      "tr": "DenizBank",
      "en": "DenizBank"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "denizbank.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://denizbank.com"
    },
    "domainSource": "https://denizbank.com"
  },
  {
    "id": "enpara",
    "name": {
      "tr": "Enpara",
      "en": "Enpara"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "enpara.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://enpara.com"
    },
    "domainSource": "https://enpara.com"
  },
  {
    "id": "kuveyt-turk",
    "name": {
      "tr": "Kuveyt Türk",
      "en": "Kuveyt Türk"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "kuveytturk.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://kuveytturk.com.tr"
    },
    "domainSource": "https://kuveytturk.com.tr"
  },
  {
    "id": "turkiye-finans",
    "name": {
      "tr": "Türkiye Finans",
      "en": "Türkiye Finans"
    },
    "category": "banking",
    "aliases": [],
    "domains": [
      "turkiyefinans.com.tr"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://turkiyefinans.com.tr"
    },
    "domainSource": "https://turkiyefinans.com.tr"
  },
  {
    "id": "steam",
    "name": {
      "tr": "Steam",
      "en": "Steam"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "store.steampowered.com"
    ],
    "asset": "steam.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://partner.steamgames.com/doc/marketing/branding",
      "guidelines": "https://partner.steamgames.com/doc/marketing/branding",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://store.steampowered.com"
  },
  {
    "id": "epic-games",
    "name": {
      "tr": "Epic Games",
      "en": "Epic Games"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "epicgames.com"
    ],
    "asset": "epic-games.svg",
    "color": "#313131",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://dev.epicgames.com/docs/services/en-US/EpicAccountServices/DesignGuidelines/index.html#epicgamesbrandguidelines",
      "guidelines": "https://dev.epicgames.com/docs/services/en-US/EpicAccountServices/DesignGuidelines/index.html#epicgamesbrandguidelines",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://epicgames.com"
  },
  {
    "id": "riot-games",
    "name": {
      "tr": "Riot Games",
      "en": "Riot Games"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "riotgames.com"
    ],
    "asset": "riot-games.svg",
    "color": "#EB0029",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.riotgames.com/en/press",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://riotgames.com"
  },
  {
    "id": "playstation",
    "name": {
      "tr": "PlayStation",
      "en": "PlayStation"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "playstation.com"
    ],
    "asset": "playstation.svg",
    "color": "#0070D1",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.playstation.com/en-us/",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://playstation.com"
  },
  {
    "id": "xbox",
    "name": {
      "tr": "Xbox",
      "en": "Xbox"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "xbox.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://xbox.com"
    },
    "domainSource": "https://xbox.com"
  },
  {
    "id": "minecraft",
    "name": {
      "tr": "Minecraft",
      "en": "Minecraft"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "minecraft.net"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://minecraft.net"
    },
    "domainSource": "https://minecraft.net"
  },
  {
    "id": "roblox",
    "name": {
      "tr": "Roblox",
      "en": "Roblox"
    },
    "category": "games",
    "aliases": [],
    "domains": [
      "roblox.com"
    ],
    "asset": "roblox.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.roblox.com",
      "guidelines": "https://en.help.roblox.com/hc/en-us/articles/115001708126-Roblox-Name-and-Logo-Community-Usage-Guidelines",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://roblox.com"
  },
  {
    "id": "discord",
    "name": {
      "tr": "Discord",
      "en": "Discord"
    },
    "category": "social",
    "aliases": [],
    "domains": [
      "discord.com"
    ],
    "asset": "discord.svg",
    "color": "#5865F2",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://discord.com/branding",
      "guidelines": "https://discord.com/branding",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://discord.com"
  },
  {
    "id": "canva",
    "name": {
      "tr": "Canva",
      "en": "Canva"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "canva.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://canva.com"
    },
    "domainSource": "https://canva.com"
  },
  {
    "id": "notion",
    "name": {
      "tr": "Notion",
      "en": "Notion"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "notion.so"
    ],
    "asset": "notion.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://www.notion.so",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://notion.so"
  },
  {
    "id": "github",
    "name": {
      "tr": "GitHub",
      "en": "GitHub"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "github.com"
    ],
    "asset": "github.svg",
    "color": "#181717",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://github.com/logos",
      "guidelines": "https://github.com/logos",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://github.com"
  },
  {
    "id": "adobe",
    "name": {
      "tr": "Adobe",
      "en": "Adobe"
    },
    "category": "productivity",
    "aliases": [],
    "domains": [
      "adobe.com"
    ],
    "asset": null,
    "color": null,
    "assetNotes": {
      "reason": "No reviewed redistributable asset available; neutral text fallback.",
      "source": "https://adobe.com"
    },
    "domainSource": "https://adobe.com"
  },
  {
    "id": "blu-tv",
    "name": {
      "tr": "HBO Max (formerly BluTV)",
      "en": "HBO Max (formerly BluTV)"
    },
    "category": "video",
    "aliases": [
      "BluTV"
    ],
    "domains": [
      "hbomax.com"
    ],
    "asset": "blu-tv.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://commons.wikimedia.org/wiki/File:Max_2025_logo.svg",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://hbomax.com"
  },
  {
    "id": "mubi",
    "name": {
      "tr": "MUBI",
      "en": "MUBI"
    },
    "category": "video",
    "aliases": [],
    "domains": [
      "mubi.com"
    ],
    "asset": "mubi.svg",
    "color": "#000000",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://mubi.com",
      "guidelines": null,
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://mubi.com"
  },
  {
    "id": "deezer",
    "name": {
      "tr": "Deezer",
      "en": "Deezer"
    },
    "category": "music",
    "aliases": [],
    "domains": [
      "deezer.com"
    ],
    "asset": "deezer.svg",
    "color": "#A238FF",
    "assetNotes": {
      "collection": "Simple Icons 16.34.0",
      "license": "CC0-1.0",
      "source": "https://deezerbrand.com/document/37#/-/logo",
      "guidelines": "https://deezerbrand.com/document/37#/-/logo",
      "notice": "Brand trademarks remain with their owners. Identification only; no endorsement."
    },
    "domainSource": "https://deezer.com"
  }
];

function normalize(value: string): string { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en").replaceAll("ı", "i"); }
export function searchBrands(query: string, category?: string): readonly Brand[] { const search=normalize(query); return brandCatalog.filter(brand => (!category || brand.category===category) && normalize([brand.name.tr,brand.name.en,...brand.aliases,...brand.domains].join(" ")).includes(search)); }
export function findBrand(name: string): Brand | undefined { const key=normalize(name.trim()); return brandCatalog.find(brand => [brand.id,brand.name.tr,brand.name.en,...brand.aliases].some(value=>normalize(value)===key)); }
