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

window.photographyArchive = [
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
  }
];
