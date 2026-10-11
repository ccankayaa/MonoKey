export interface Brand { tileBackground?: string; id: string; name: {tr: string; en: string}; category: string; aliases: string[]; domains: string[]; asset: string | null; color: string | null; assetNotes: { [key: string]: unknown }; domainSource: string }
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
    "asset": "amazon.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.amazon.com/favicon.ico",
      "sha256": "a42e0f0f27b02c64ec149302a59907a90b42e71b15baa900578748f1795279ca",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://amazon.com",
    "tileBackground": "#ffffff"
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
    "asset": "amazon-prime.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.primevideo.com/apple-touch-icon.png",
      "sha256": "8348b4415e38d9344cd1b3ff582e34bbd02aa5ec0ac1f2a5439ad89d936eabfa",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://primevideo.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://netflix.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://hbomax.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://youtube.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://youtube.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://accounts.google.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://account.apple.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://icloud.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://mail.google.com",
    "tileBackground": "#ffffff"
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
    "asset": "outlook.png",
    "color": null,
    "assetNotes": {
      "source": "https://res.public.onecdn.static.microsoft/assets/mail/pwa/v4/pngs/apple-touch-icon.png",
      "sha256": "2d4abee01d85232cb80629835c5be15285e4698da7dccff7ddf94811261fdda5",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://outlook.live.com",
    "tileBackground": "#ffffff"
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
    "asset": "yahoo.png",
    "color": null,
    "assetNotes": {
      "source": "https://s.yimg.com/cv/apiv2/icons/yahoo.png",
      "sha256": "528a272085d9733149e123df5484bbc7e1a522418cf57da16a5b0a29fa1e0b9d",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://yahoo.com",
    "tileBackground": "#ffffff"
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
    "asset": "edevlet.png",
    "color": null,
    "assetNotes": {
      "source": "https://cdn.e-devlet.gov.tr/themes/izmir/images/favicons/favicon-196x196.1.8.0.png",
      "sha256": "084c73167f11b86b1113325f2c0683bf9f48d4b08a9be6369264fbddf0f8b1a5",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://turkiye.gov.tr",
    "tileBackground": "#ffffff"
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
    "asset": "mhrs.png",
    "color": null,
    "assetNotes": {
      "source": "https://mhrs.gov.tr/img/apple-touch-icon.png",
      "sha256": "8a7bf7fbbb799f31001bd1197c87e01eb4225a4257b4ee282fbc8e78316c66f9",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://mhrs.gov.tr",
    "tileBackground": "#ffffff"
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
    "asset": "enabiz.png",
    "color": null,
    "assetNotes": {
      "source": "https://enabiz.gov.tr/assets/favicon/favicon-16x16.png?v=yX3I6hjj0an5pdAInO_u7wmF80Ro798vQge0cC8O18k",
      "sha256": "1021aca24ff03b6bead135b0bf700ceba085a66d6408c8db864f20449d044e1b",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://enabiz.gov.tr",
    "tileBackground": "#ffffff"
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
    "asset": "hepsiburada.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.hepsiburada.com/favicon.ico",
      "sha256": "6ad416aefccd07e8b8170b2856cd26c64c458163620bf700ef1369bcdc0efb70",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://hepsiburada.com",
    "tileBackground": "#ffffff"
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
    "asset": "trendyol.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.trendyol.com/favicon.ico",
      "sha256": "8e07359102580dc2c8f6146d4bca05c9747508bf50f8ff1739d3439b003e97d6",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://trendyol.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://instagram.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://facebook.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://spotify.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://music.apple.com",
    "tileBackground": "#ffffff"
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
    "asset": "fizy.png",
    "color": null,
    "assetNotes": {
      "source": "https://fizy.com/landing/apple-icon.png?apple-icon.3rcjkg9xavq2a.png",
      "sha256": "c898ea63dec2dbfa5d98267ad298d2884b9ec13374cd29a4b738861ab2bd58a0",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://fizy.com",
    "tileBackground": "#ffffff"
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
    "asset": "turkcell.png",
    "color": null,
    "assetNotes": {
      "source": "https://ffo3gv1cf3ir.merlincdn.net/static_lib/assetsv2/common/images/favicon.ico?20261011_03-111700",
      "sha256": "23731792ba56fe87afb9ce1c45ce56bc42087f35e1ecc35c37747e7e665f6011",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://turkcell.com.tr",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://vodafone.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "turk-telekom.png",
    "color": null,
    "assetNotes": {
      "source": "https://asset.turktelekom.com.tr/SiteAssets/images/favicon.ico",
      "sha256": "d8a2fb2bc5285c83da8a1c0462035b1431ac1aa7c6696377c1f8b903d7b04b19",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://turktelekom.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "superonline.png",
    "color": null,
    "assetNotes": {
      "source": "https://s.superonline.net/SiteAssets/img/favicon.png?v=20261011_04",
      "sha256": "24411b2a4d24b2985c943958f3b9074e536453449df6e3d6059975e9c1463042",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://superonline.net",
    "tileBackground": "#ffffff"
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
    "asset": "gain.png",
    "color": null,
    "assetNotes": {
      "source": "https://gain.tv/apple-touch-icon.png",
      "sha256": "4e7a42f299f2c06d295ba61a61c7ca7243b34cfe290af66af3896cd94a9026e0",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://gain.tv",
    "tileBackground": "#ffffff"
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
    "asset": "exxen.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.exxen.com/favicon.ico",
      "sha256": "de6a48dfb7d5f996413a15e9289c238c841c24245b8465bb63440a0521f5cd96",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://exxen.com",
    "tileBackground": "#ffffff"
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
    "asset": "bein-connect.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.beinconnect.com.tr/apple-touch-icon.png",
      "sha256": "80fbdc204dc292194a85e7a0ef42583804639b6ff2a15bdb38202e2e52fc45a0",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://beinconnect.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "tod.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.todtv.com.tr/apple-touch-icon.png",
      "sha256": "826bdf277239a8f2c6f9f41b83de746e76e5ab82f470b077cd39e2ea3a9c0ce1",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://todtv.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "sahibinden.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.sahibinden.com/favicon.ico",
      "sha256": "254692f6ba6328f585392ed185b3207d252bdcd5c84a3a14a54f6410efe35f53",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://sahibinden.com",
    "tileBackground": "#ffffff"
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
    "asset": "migros.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.migros.com.tr:443/assets/images/seo/new/apple-touch-icon-precomposed.png",
      "sha256": "f1fdda5b9f3f643480f06af6d0e673c92df7f6fbebb9b388294ff857c59acf07",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://migros.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "halkbank.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.halkbank.com.tr/etc.clientlibs/corporate-website/clientlibs/clientlib-site/resources/images/touch-icons/halkbank-180x180.png",
      "sha256": "b97eb2a4b59a620bbd1fdd62770fdcd781d56e5d0cf036ef7e5d17c9b1916b3e",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://halkbank.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "ziraat.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.ziraatbank.com.tr/SiteAssets/images/favicon.ico",
      "sha256": "8dd394cff59321f170d77adaf10c15d5c70a8bd19e13e9b097aa1bf6b4f44abc",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://ziraatbank.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "bankkart.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.bankkart.com.tr/favicon.ico",
      "sha256": "13b36fe0cd5544657495063f4aad539ece90e117517b0f5d5ca4937304a17a9e",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://bankkart.com.tr",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://gemini.google.com",
    "tileBackground": "#ffffff"
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
    "asset": "grok.png",
    "color": null,
    "assetNotes": {
      "source": "https://grok.com/images/android-chrome-512x512.png",
      "sha256": "8c8cccf41bbd5242e4fce0f4206909b227a88a13e639775561ba6b4c89697121",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://grok.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://claude.ai",
    "tileBackground": "#ffffff"
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
    "asset": "yemeksepeti.png",
    "color": null,
    "assetNotes": {
      "source": "https://micro-assets.foodora.com/favicons/ys/apple-touch-icon-180x180.png",
      "sha256": "320984bf6efcd27942722a27708025630128997af37f4667fe9e9fb262a38b25",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://yemeksepeti.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://shazam.com",
    "tileBackground": "#ffffff"
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
    "asset": "arabam.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.arabam.com/arabam-favicon-144x144.png",
      "sha256": "7eaa8c3ce82a45254f319c46de5a90cfb3cbb553569732d59c0f2e9bc85dea70",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://arabam.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://zoom.com",
    "tileBackground": "#ffffff"
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
    "asset": "kariyer.png",
    "color": null,
    "assetNotes": {
      "source": "https://img-kariyer.mncdn.com/Images/favicon_new.png",
      "sha256": "72a016e2d2cd9a7d81ff87b5ae242323bb37e9ab980a09173a811c98ef60c0c7",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://kariyer.net",
    "tileBackground": "#ffffff"
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
    "asset": "linkedin.png",
    "color": null,
    "assetNotes": {
      "source": "https://static.licdn.com/sc/h/eahiplrwoq61f4uan012ia17i",
      "sha256": "a5658ffdd2cc3ce2a9e07e2fa1fe32079b33ccd94ff2099dd6b8debbf697e3de",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Service identification only. Owner trademarks/copyright retained; no endorsement or general redistribution license asserted."
    },
    "domainSource": "https://linkedin.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://reddit.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://okcupid.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://tinder.com",
    "tileBackground": "#ffffff"
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
    "asset": "bionluk.png",
    "color": null,
    "assetNotes": {
      "source": "https://gcdn.bionluk.com/site/icon/faviconsv2/apple-icon-180x180.png",
      "sha256": "c64eacbc9c0bb95b7e0b6c8573dc58dfc8237a4a503eb9e1c7d58fbe95c398b2",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://bionluk.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://dropbox.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://telegram.org",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://whatsapp.com",
    "tileBackground": "#ffffff"
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
    "asset": "is-bankasi.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.isbank.com.tr/StaticFiles/Isbank/images/icons/favicon.ico",
      "sha256": "7744ed9c8e722f2c54438da755202d534f764e82d6a9b06801b00bce39778946",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://isbank.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "akbank.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.akbank.com/SiteAssets/img/favicon.ico",
      "sha256": "1c419ecae3b7369c13f8d32b34d6d8496ddc996dfef0ece8174248fc9bc5f1fa",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://akbank.com",
    "tileBackground": "#ffffff"
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
    "asset": "garanti-bbva.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.garantibbva.com.tr/apple-touch-icon-180x180.png",
      "sha256": "3b35b07343e05c13bce3d9cfbe349f4b0bb0f8fbb689ed2cd0fa53822884e75e",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://garantibbva.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "yapi-kredi.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.yapikredi.com.tr/favicon.ico",
      "sha256": "3395ff6b09ee74ba021e7c86ed774f9232dca2a50244d4f5b961677c5763676e",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://yapikredi.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "vakifbank.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.vakifbank.com.tr/Templates/Default/assets/img/favicon.ico",
      "sha256": "bf91f13e9fe1b756fa072b09d27604f93576f408ae105baf364e63681cba6743",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://vakifbank.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "qnb.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.qnb.com.tr/_assets/img/finansbank.gif",
      "sha256": "0654d0bd23425977501a27908410305ee589041e55aa1f0a545b7559a0135182",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://qnb.com.tr",
    "tileBackground": "#ffffff"
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
    "asset": "enpara.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.enpara.com/favicon.ico",
      "sha256": "e8eed8a588261ac7a55476df581c2e8145e0525a9b21b58bdba4977af486e65c",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://enpara.com",
    "tileBackground": "#ffffff"
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
    "asset": "kuveyt-turk.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.kuveytturk.com.tr/_assets/img/icon/icon-180x180.png",
      "sha256": "352f9d26e81559ee25f10b704be7c016f9ab8e9524be8c4536aab8b9a5656df5",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://kuveytturk.com.tr",
    "tileBackground": "#1f2937"
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
    "asset": "turkiye-finans.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.turkiyefinans.com.tr/SiteAssets/favicon.ico?v=2",
      "sha256": "90a00e2bd67ad7056f9038ca2a17ec14cdb53509256f141512da661ce383a689",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Service identification only. Owner trademarks/copyright retained; no endorsement or general redistribution license asserted."
    },
    "domainSource": "https://turkiyefinans.com.tr",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://store.steampowered.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://epicgames.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://riotgames.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://playstation.com",
    "tileBackground": "#ffffff"
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
    "asset": "xbox.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.xbox.com/favicon-512.png",
      "sha256": "b7fa5ae38427843f7cea3c7175276beca9a32291bdc50d32d55cbce36167c6c0",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://xbox.com",
    "tileBackground": "#ffffff"
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
    "asset": "minecraft.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.minecraft.net/etc.clientlibs/minecraftnet/clientlibs/clientlib-site/resources/apple-icon-180x180.png",
      "sha256": "00dbaf34eb85e8bcedcbbb1420df2f45a3e59e63b66a553cab1096f46b24d603",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://minecraft.net",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://roblox.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://discord.com",
    "tileBackground": "#ffffff"
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
    "asset": "canva.png",
    "color": null,
    "assetNotes": {
      "source": "https://static.canva.com/static/images/favicon.ico",
      "sha256": "2bba6f6189f58949b52a7a90bd332c9f1216d5fe0abf7b202759b9b3d504640f",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://canva.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://notion.so",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://github.com",
    "tileBackground": "#ffffff"
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
    "asset": "adobe.png",
    "color": null,
    "assetNotes": {
      "source": "https://www.adobe.com/favicon.ico",
      "sha256": "75c6458ef968c90e7d09591224d796b07bcd2359278d8cae7fcba150a2fb8345",
      "checkedAt": "2026-10-11",
      "type": "Official site identity asset",
      "usage": "Identifies a user-selected service. Trademark and copyright remain with the owner; no endorsement or general redistribution license asserted. Replace or remove if the owner disallows this use."
    },
    "domainSource": "https://adobe.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://hbomax.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://mubi.com",
    "tileBackground": "#ffffff"
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
    "domainSource": "https://deezer.com",
    "tileBackground": "#ffffff"
  }
];

function normalize(value: string): string { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en").replaceAll("Ä±", "i"); }
export function searchBrands(query: string, category?: string): readonly Brand[] { const search=normalize(query); return brandCatalog.filter(brand => (!category || brand.category===category) && normalize([brand.name.tr,brand.name.en,...brand.aliases,...brand.domains].join(" ")).includes(search)); }
export function findBrand(name: string): Brand | undefined { const key=normalize(name.trim()); return brandCatalog.find(brand => [brand.id,brand.name.tr,brand.name.en,...brand.aliases].some(value=>normalize(value)===key)); }
