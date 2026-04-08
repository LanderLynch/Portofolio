const firebaseStorageMediaBase =
  "https://firebasestorage.googleapis.com/v0/b/portofolio-jsfolio.firebasestorage.app/o/";

function buildStorageMediaUrl(path) {
  return firebaseStorageMediaBase + encodeURIComponent(path) + "?alt=media";
}

const november2025HaflahFolder =
  "photography/2025/November/haflah khotmul Qur'an dan imtihan ke-4/";

const november2025HaflahFiles = [
  "DSCF1650.JPG",
  "DSCF1652.JPG",
  "DSCF1653.JPG",
  "DSCF1654.JPG",
  "DSCF1657.JPG",
  "DSCF1661.JPG",
  "DSCF1662.JPG",
  "DSCF1663.JPG",
  "DSCF1664.JPG",
  "DSCF1665.JPG",
  "DSCF1666.JPG",
  "DSCF1667.JPG",
  "DSCF1670.JPG",
  "DSCF1671.JPG",
  "DSCF1672.JPG",
  "DSCF1674.JPG",
  "DSCF1675.JPG",
  "DSCF1676.JPG",
  "DSCF1677.JPG",
  "DSCF1678.JPG",
  "DSCF1679.JPG",
  "DSCF1681.JPG",
  "DSCF1682.JPG",
  "DSCF1683.JPG",
  "DSCF1684.JPG",
  "DSCF1685.JPG",
  "DSCF1686.JPG",
  "DSCF1687.JPG",
  "DSCF1713.JPG",
  "DSCF1714.JPG",
  "DSCF1715.JPG",
  "DSCF1716.JPG",
  "DSCF1718.JPG",
  "DSCF1719.JPG",
  "DSCF1720.JPG",
  "DSCF1721.JPG",
  "DSCF1722.JPG",
  "DSCF1723.JPG",
  "DSCF1724.JPG",
  "DSCF1725.JPG",
  "DSCF1727.JPG",
  "DSCF1734.JPG",
  "DSCF1735.JPG",
  "DSCF1736.JPG",
  "DSCF1737.JPG",
  "DSCF1740.JPG",
  "DSCF1742.JPG",
  "DSCF1746.JPG",
  "DSCF1747.JPG",
  "DSCF1750.JPG",
  "DSCF1752.JPG",
  "DSCF1753.JPG",
  "DSCF1754.JPG"
];

const november2025HaflahImages = november2025HaflahFiles.map(function (fileName) {
  return buildStorageMediaUrl(november2025HaflahFolder + fileName);
});

const cosplayDraft2024Folder =
  "photography/2024/Cosplay draft/";

const cosplayDraft2024RandomFiles = [
  "DSCF7145.JPG",
  "DSCF7183.JPG",
  "DSCF7474.JPG",
  "DSCF7704.JPG",
  "DSCF7723.JPG",
  "DSCF7724.JPG"
];

const cosplayDraft2024RandomImages = cosplayDraft2024RandomFiles.map(function (fileName) {
  return buildStorageMediaUrl(cosplayDraft2024Folder + fileName);
});

function buildSortImages(folderPath, fileNames) {
  return fileNames.map(function (fileName) {
    return buildStorageMediaUrl(folderPath + fileName);
  });
}

const cosplayDraftAndrianFolder =
  "photography/2024/Cosplay draft/@andrian_m.r.a/";
const cosplayDraftAndrianFiles = [
  "DSCF9453.JPG",
  "DSCF9454.JPG",
  "DSCF9455.JPG",
  "DSCF9456.JPG"
];
const cosplayDraftAndrianImages = buildSortImages(
  cosplayDraftAndrianFolder,
  cosplayDraftAndrianFiles
);

const cosplayDraftFedriFolder =
  "photography/2024/Cosplay draft/@fe.d.ri/";
const cosplayDraftFedriFiles = [
  "DSCF9416.JPG",
  "DSCF9417.JPG",
  "DSCF9418.JPG",
  "DSCF9419.JPG",
  "DSCF9469.JPG",
  "DSCF9470.JPG"
];
const cosplayDraftFedriImages = buildSortImages(
  cosplayDraftFedriFolder,
  cosplayDraftFedriFiles
);

const cosplayDraftMarceliaFolder =
  "photography/2024/Cosplay draft/@marcelia_ellia/";
const cosplayDraftMarceliaFiles = [
  "DSCF9449.JPG",
  "DSCF9450.JPG",
  "DSCF9451.JPG",
  "DSCF9452.JPG",
  "DSCF9457.JPG",
  "DSCF9458.JPG",
  "DSCF9459.JPG",
  "DSCF9460.JPG",
  "DSCF9461.JPG",
  "DSCF9462.JPG",
  "DSCF9463.JPG",
  "DSCF9464.JPG"
];
const cosplayDraftMarceliaImages = buildSortImages(
  cosplayDraftMarceliaFolder,
  cosplayDraftMarceliaFiles
);

const cosplayDraftMrizkyFolder =
  "photography/2024/Cosplay draft/@mrizky_04_/";
const cosplayDraftMrizkyFiles = [
  "DSCF1550.JPG",
  "DSCF1551.JPG",
  "DSCF1552.JPG",
  "DSCF9466.JPG",
  "DSCF9467.JPG",
  "DSCF9468.JPG"
];
const cosplayDraftMrizkyImages = buildSortImages(
  cosplayDraftMrizkyFolder,
  cosplayDraftMrizkyFiles
);

const cosplayDraftFinaRinaFolder =
  "photography/2024/Cosplay draft/Fina Rina/";
const cosplayDraftFinaRinaFiles = [
  "DSCF1567.JPG",
  "DSCF1568.JPG",
  "DSCF1576.JPG",
  "DSCF1578.JPG",
  "DSCF1581.JPG"
];
const cosplayDraftFinaRinaImages = buildSortImages(
  cosplayDraftFinaRinaFolder,
  cosplayDraftFinaRinaFiles
);

const january2026TeamBuildingFolder =
  "photography/2026/January/Team building Akademi Imigrasi/";
const january2026TeamBuildingFiles = [
  "DSCF2099 (Small).JPG",
  "DSCF2100 (Small).JPG",
  "DSCF2101 (Small).JPG",
  "DSCF2102 (Small).JPG",
  "DSCF2106 (Small).JPG",
  "DSCF2107 (Small).JPG",
  "DSCF2108 (Small).JPG",
  "DSCF2109 (Small).JPG",
  "DSCF2110 (Small).JPG",
  "DSCF2111 (Small).JPG",
  "DSCF2112 (Small).JPG",
  "DSCF2114 (Small).JPG",
  "DSCF2117 (Small).JPG",
  "DSCF2119 (Small).JPG",
  "DSCF2120 (Small).JPG",
  "DSCF2121 (Small).JPG",
  "DSCF2122 (Small).JPG",
  "DSCF2123 (Small).JPG",
  "DSCF2124 (Small).JPG",
  "DSCF2125 (Small).JPG",
  "DSCF2126 (Small).JPG",
  "DSCF2127 (Small).JPG",
  "DSCF2129 (Small).JPG",
  "DSCF2130 (Small).JPG",
  "DSCF2131 (Small).JPG",
  "DSCF2132 (Small).JPG",
  "DSCF2133 (Small).JPG",
  "DSCF2134 (Small).JPG",
  "DSCF2135 (Small).JPG",
  "DSCF2136 (Small).JPG",
  "DSCF2137 (Small).JPG",
  "DSCF2138 (Small).JPG",
  "DSCF2140 (Small).JPG",
  "DSCF2141 (Small).JPG",
  "DSCF2142 (Small).JPG",
  "DSCF2143 (Small).JPG",
  "DSCF2144 (Small).JPG",
  "DSCF2145 (Small).JPG",
  "DSCF2153 (Small).JPG",
  "DSCF2165 (Small).JPG",
  "DSCF2167 (Small).JPG",
  "DSCF2170 (Small).JPG",
  "DSCF2172 (Small).JPG",
  "DSCF2176 (Small).JPG",
  "DSCF2177 (Small).JPG",
  "DSCF2178 (Small).JPG",
  "DSCF2179 (Small).JPG",
  "DSCF2180 (Small).JPG",
  "DSCF2182 (Small).JPG",
  "DSCF2183 (Small).JPG",
  "DSCF2184 (Small).JPG",
  "DSCF2185 (Small).JPG",
  "DSCF2186 (Small).JPG",
  "DSCF2187 (Small).JPG",
  "DSCF2188 (Small).JPG",
  "DSCF2189 (Small).JPG",
  "DSCF2191 (Small).JPG",
  "DSCF2192 (Small).JPG",
  "DSCF2194 (Small).JPG",
  "DSCF2201 (Small).JPG",
  "DSCF2209 (Small).JPG",
  "DSCF2218 (Small).JPG",
  "DSCF2219 (Small).JPG",
  "DSCF2221 (Small).JPG"
];
const january2026TeamBuildingImages = buildSortImages(
  january2026TeamBuildingFolder,
  january2026TeamBuildingFiles
);

const january2026HaflahFolder =
  "photography/2026/January/Haflah Khotmul Qur'an dan Imtihan Ke-5/";
const january2026HaflahFiles = [
  "DSCF2233 (Small).JPG",
  "DSCF2234 (Small).JPG",
  "DSCF2240 (Small).JPG",
  "DSCF2242 (Small).JPG",
  "DSCF2243 (Small).JPG",
  "DSCF2244 (Small).JPG",
  "DSCF2245 (Small).JPG",
  "DSCF2246 (Small).JPG",
  "DSCF2247 (Small).JPG"
];
const january2026HaflahImages = buildSortImages(
  january2026HaflahFolder,
  january2026HaflahFiles
);

window.photographyArchive = [
  {
    year: 2026,
    slug: "team-building-akademi-imigrasi",
    title: "Team Building Akademi Imigrasi",
    dateLabel: "January 2026",
    projectType: "Client Team Building Documentation",
    location: "Team building event coverage and group activity documentation",
    description:
      "A team building documentation set for Akademi Imigrasi, covering candid interactions, activity moments, and group atmosphere across the January 2026 event.",
    coverImage: buildStorageMediaUrl(january2026TeamBuildingFolder + "DSCF2188 (Small).JPG"),
    images: january2026TeamBuildingImages
  },
  {
    year: 2026,
    slug: "haflah-khotmul-quran-dan-imtihan-ke-5",
    title: "Haflah Khotmul Qur'an dan Imtihan Ke-5",
    dateLabel: "January 2026",
    projectType: "Client Event Documentation",
    location: "January 2026 event coverage archive",
    description:
      "A January 2026 Haflah documentation set covering stage moments, guest interactions, and event atmosphere for Haflah Khotmul Qur'an dan Imtihan Ke-5.",
    folderLink: "https://drive.google.com/drive/folders/1v-Xc4U4ZH5AdOmRByrPEfJp4nHnyvo1O?usp=sharing",
    coverImage: buildStorageMediaUrl(january2026HaflahFolder + "DSCF2233 (Small).JPG"),
    images: january2026HaflahImages
  },
  {
    year: 2025,
    slug: "haflah-khotmul-quran-dan-imtihan-ke-4",
    title: "Haflah Khotmul Qur'an dan Imtihan Ke-4",
    dateLabel: "November 16, 2025",
    projectType: "Client Event Documentation",
    location: "Client to client photography work",
    description:
      "A full event photography set covering stage moments, family interactions, group portraits, candid reactions, and the overall atmosphere of Haflah Khotmul Qur'an dan Imtihan Ke-4.",
    coverImage: buildStorageMediaUrl(november2025HaflahFolder + "DSCF1753.JPG"),
    images: november2025HaflahImages
  },
  {
    year: 2024,
    slug: "cosplay-draft",
    title: "Cosplay Draft",
    dateLabel: "2024 Archive Draft",
    projectType: "Creative Portrait Study",
    location: "Random photography studies and casual cosplay experiments",
    description:
      "A flexible cosplay draft archive built for mixed portrait experiments, spontaneous framing tests, and looser photography moments that do not need a full event-style gallery structure.",
    coverImage: buildStorageMediaUrl(cosplayDraft2024Folder + "DSCF7724.JPG"),
    images: cosplayDraft2024RandomImages,
    sorts: [
      {
        id: "random-photography",
        label: "Random Photography",
        description:
          "A mixed set of random cosplay draft photos pulled from the new 2024 insert folder so individual frames can be chosen from one clean sort.",
        coverImage: buildStorageMediaUrl(cosplayDraft2024Folder + "DSCF7724.JPG"),
        images: cosplayDraft2024RandomImages
      },
      {
        id: "andrian-mra",
        label: "@andrian_m.r.a",
        description:
          "A focused cosplay draft subset for @andrian_m.r.a so the folder can be opened as its own selection instead of staying buried inside storage.",
        coverImage: buildStorageMediaUrl(cosplayDraftAndrianFolder + "DSCF9453.JPG"),
        images: cosplayDraftAndrianImages
      },
      {
        id: "fe-d-ri",
        label: "@fe.d.ri",
        description:
          "A dedicated sort for @fe.d.ri that keeps this folder readable as its own mini portrait set inside the 2024 cosplay draft archive.",
        coverImage: buildStorageMediaUrl(cosplayDraftFedriFolder + "DSCF9416.JPG"),
        images: cosplayDraftFedriImages
      },
      {
        id: "marcelia-ellia",
        label: "@marcelia_ellia",
        description:
          "A dedicated sort for @marcelia_ellia so the inserted folder can be browsed directly from the photography page with its own cover and frame list.",
        coverImage: buildStorageMediaUrl(cosplayDraftMarceliaFolder + "DSCF9449.JPG"),
        images: cosplayDraftMarceliaImages
      },
      {
        id: "mrizky-04",
        label: "@mrizky_04_",
        description:
          "A compact sort for @mrizky_04_ that opens the new folder as a separate choice under Cosplay Draft.",
        coverImage: buildStorageMediaUrl(cosplayDraftMrizkyFolder + "DSCF9466.JPG"),
        images: cosplayDraftMrizkyImages
      },
      {
        id: "fina-rina",
        label: "Fina Rina",
        description:
          "A dedicated sort for the Fina Rina folder so this new cosplay draft set can be browsed as its own selection inside the 2024 archive.",
        coverImage: buildStorageMediaUrl(cosplayDraftFinaRinaFolder + "DSCF1567.JPG"),
        images: cosplayDraftFinaRinaImages
      }
    ]
  }
];
