export const TRIVIA = [
  {
    id: "bact_001",
    tag: "PATOGEN ENTERIK",
    scientific_name: "Escherichia coli",
    common_name: "Bakteri E. coli",
    short: "E. coli",
    category: "Patogen saluran cerna",
    habitat: "Air kotor, makanan terkontaminasi feses, daging kurang matang.",
    danger_level: "Sedang",
    symptom: "Diare akut, kram perut, mual, dan demam ringan.",
    prevention: "Cuci tangan 20 detik dengan sabun, rebus air hingga mendidih, dan simpan makanan tertutup.",
    nutrients: ["Air mineral bersih", "Zinc", "Oralit"],
    fun_fact: "Tidak semua E. coli jahat. Sebagian strain justru hidup normal di usus manusia dan membantu mencerna makanan.",
    quiz: {
      question: "Langkah paling tepat untuk mencegah kontaminasi E. coli pada air minum adalah?",
      options: [
        "Menyaring air dengan kain biasa",
        "Merebus air hingga mendidih",
        "Menyimpan air di wadah terbuka",
        "Mendinginkan air tanpa dimasak"
      ],
      correct_index: 1,
      explanation: "Merebus air hingga mendidih membunuh sebagian besar bakteri patogen, termasuk E. coli. Menyaring dengan kain tidak menghilangkan bakteri."
    }
  },
  {
    id: "bact_002",
    tag: "PATOGEN ORAL",
    scientific_name: "Streptococcus mutans",
    common_name: "Bakteri S. mutans",
    short: "S. mutans",
    category: "Patogen rongga mulut",
    habitat: "Plak gigi dan sisa makanan manis yang menempel di permukaan gigi.",
    danger_level: "Ringan sampai sedang",
    symptom: "Karies gigi, nyeri saat mengunyah, gigi berlubang, dan bau mulut.",
    prevention: "Sikat gigi dua kali sehari dengan fluorida, gunakan benang gigi, dan batasi konsumsi gula.",
    nutrients: ["Air putih", "Fluorida", "Kalsium"],
    fun_fact: "S. mutans mengubah gula menjadi asam yang mengikis email gigi. Semakin sering ngemil manis, semakin lama gigi terpapar asam.",
    quiz: {
      question: "Mengapa konsumsi gula berlebih meningkatkan risiko karies gigi?",
      options: [
        "Gula langsung melubangi email gigi",
        "Bakteri mulut mengubah gula menjadi asam perusak email",
        "Gula membuat gigi berubah warna saja",
        "Gula membunuh semua bakteri baik di mulut"
      ],
      correct_index: 1,
      explanation: "Streptococcus mutans memfermentasi gula menjadi asam. Asam inilah yang menurunkan pH mulut dan mengikis email gigi hingga terjadi karies."
    }
  },
  {
    id: "bact_003",
    tag: "PATOGEN PANGAN",
    scientific_name: "Salmonella enterica",
    common_name: "Bakteri Salmonella",
    short: "Salmonella",
    category: "Patogen keamanan pangan",
    habitat: "Telur mentah, daging unggas, susu tidak pasteurisasi, dan air terkontaminasi.",
    danger_level: "Sedang sampai tinggi",
    symptom: "Diare, demam, kram perut hebat, dan dehidrasi.",
    prevention: "Masak makanan hingga matang, pisahkan talenan mentah dan matang, serta cuci tangan sebelum mengolah makanan.",
    nutrients: ["Air mineral bersih", "Oralit", "Protein matang"],
    fun_fact: "Salmonella dapat bertahan di telur mentah. Memasak hingga suhu aman adalah cara paling efektif untuk menonaktifkannya.",
    quiz: {
      question: "Cara paling efektif mencegah infeksi Salmonella dari daging ayam adalah?",
      options: [
        "Mencuci daging dengan air dingin",
        "Memasak hingga matang sempurna",
        "Menyimpan di suhu ruang",
        "Menambahkan banyak bumbu pedas"
      ],
      correct_index: 1,
      explanation: "Panas saat memasak membunuh Salmonella. Mencuci daging mentah justru dapat menyebarkan bakteri ke permukaan dapur."
    }
  },
  {
    id: "bact_004",
    tag: "PATOGEN LAMBUNG",
    scientific_name: "Helicobacter pylori",
    common_name: "Bakteri H. pylori",
    short: "H. pylori",
    category: "Patogen lambung",
    habitat: "Lapisan lendir lambung manusia, dapat bertahan pada suasana asam.",
    danger_level: "Sedang",
    symptom: "Nyeri ulu hati, mual, kembung, dan risiko tukak lambung.",
    prevention: "Jaga kebersihan makanan dan alat makan, cuci tangan, kelola stres, dan makan teratur dengan serat cukup.",
    nutrients: ["Serat pangan", "Air putih", "Probiotik"],
    fun_fact: "H. pylori mampu menetralkan asam lambung di sekitarnya sehingga bisa bertahan hidup di lingkungan yang sangat asam.",
    quiz: {
      question: "Kebiasaan yang membantu menjaga kesehatan lambung dari H. pylori adalah?",
      options: [
        "Makan sangat pedas setiap hari",
        "Melewatkan makan agar lambung kosong",
        "Makan teratur dengan serat dan menjaga kebersihan alat makan",
        "Berbagi alat makan tanpa mencucinya"
      ],
      correct_index: 2,
      explanation: "Pola makan teratur, serat cukup, dan kebersihan alat makan membantu menjaga mukosa lambung serta mengurangi risiko penularan H. pylori."
    }
  }
];

export function getTrivia(id) {
  return TRIVIA.find((item) => item.id === id) || TRIVIA[0];
}
