(function (root) {
  const copy = {
    id: {
      title: "Form Feedback Customer",
      intro:
        "Terima kasih telah menggunakan layanan PT. Ichikara.\nMohon luangkan waktu sejenak untuk memberikan penilaian dan masukan anda.\nFeedback dari Anda sangat berharga untuk peningkatan kualitas layanan kami",
      fields: [
        "Nama Perusahaan",
        "Nama",
        "Nama Interpreter",
        "Periode tugas",
        "Kritik",
        "Saran",
        "RATING",
      ],
      section: "Feedback Customer",
      aspects: [
        "Kesopanan dan sikap Interpreter",
        "Kedisiplinan selama bertugas",
        "Kemampuan Bahasa Indonesia",
        "Kemampuan Bahasa Jepang",
        "Ketepatan Interpreter dalam menterjemahkan",
        "Inisiatif / Interaktif",
      ],
      submit: "Kirim feedback",
      required: "Semua pertanyaan wajib diisi.",
      success: "Terima kasih. Feedback Anda telah tersimpan.",
      error: "Feedback belum dapat diproses. Silakan coba lagi.",
      sending: "Mengirim…",
    },
    ja: {
      title: "お客様アンケート",
      intro:
        "このたびはPT. Ichikaraのサービスをご利用いただき、誠にありがとうございます。\nお手数ですが、サービスの評価とご意見をお聞かせください。\n皆様からのご意見を、今後のサービス品質向上に活かしてまいります。",
      fields: [
        "会社名",
        "ご回答者氏名",
        "通訳者名",
        "業務実施日",
        "改善が必要な点",
        "ご提案・ご要望",
        "総合評価",
      ],
      section: "サービスについてのご評価",
      aspects: [
        "通訳者の礼儀・態度",
        "業務中の規律・時間厳守",
        "インドネシア語能力",
        "日本語能力",
        "通訳の正確さ",
        "主体性・積極的なコミュニケーション",
      ],
      submit: "回答を送信する",
      required: "すべての項目にご回答ください。",
      success: "ご回答ありがとうございます。回答を保存しました。",
      error: "送信できませんでした。もう一度お試しください。",
      sending: "送信中…",
    },
    en: {
      title: "Customer Feedback Form",
      intro:
        "Thank you for using PT. Ichikara’s services.\nPlease take a moment to share your assessment and feedback.\nYour feedback is valuable in helping us improve the quality of our services.",
      fields: [
        "Company name",
        "Name",
        "Interpreter name",
        "Assignment date",
        "Criticism",
        "Suggestions",
        "RATING",
      ],
      section: "Customer Feedback",
      aspects: [
        "Interpreter’s courtesy and attitude",
        "Discipline during the assignment",
        "Indonesian language proficiency",
        "Japanese language proficiency",
        "Accuracy of interpretation",
        "Initiative / Interaction",
      ],
      submit: "Submit feedback",
      required: "All questions are required.",
      success: "Thank you. Your feedback has been saved.",
      error: "Your feedback could not be processed. Please try again.",
      sending: "Submitting…",
    },
  };
  if (typeof module !== "undefined") module.exports = copy;
  else root.CustomerSatisfactionCopy = copy;
})(typeof window !== "undefined" ? window : globalThis);
