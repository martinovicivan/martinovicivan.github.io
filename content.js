// ─────────────────────────────────────────────────────────────────────────────
//  content.js — all the content of the site lives here.
//  Edit this file; you should not need to touch app.js or style.css.
//  Text fields may contain HTML (<a href>, <b>, <em>, …).
//  Everything below is PLACEHOLDER content — replace it with your own.
// ─────────────────────────────────────────────────────────────────────────────

window.SITE = {
  name: "Ivan Martinović",
  // other spellings of your name that should be highlighted in author lists
  nameAliases: ["I. Martinović", "Ivan Martinovic"],
  notebook: "ivan_martinovic.ipynb", // shown in the tab bar / title
  position: "PhD Student",
  affiliation: "Faculty of Electrical Engineering and Computing, University of Zagreb",
  affiliationShort: "FER, University of Zagreb",
  description: "Ivan Martinović — PhD student at FER, University of Zagreb. Research, publications and teaching.",

  photo: "assets/me_fer.webp", // transparent background, blends into either theme; empty → initials
  interests: [
    "self-supervised learning",
    "semi-supervised learning",
    "multimodal foundation models",
  ],

  bio: [
    `I am a third-year PhD student at the <a href="https://www.fer.unizg.hr/en">Faculty of Electrical Engineering and Computing (FER)</a>, University of Zagreb. I have been lucky to work with great supervisors: the late <a href="https://www.fer.unizg.hr/sinisa.segvic">Prof. Siniša Šegvić</a>, under whom I began my PhD, <a href="https://www.fer.unizg.hr/jan.snajder">Prof. Jan Šnajder</a> at the University of Zagreb, and <a href="https://yukimasano.github.io/">Prof. Yuki M. Asano</a> at the <a href="https://fundamentalailab.github.io/">Fundamental AI Lab (FunAI)</a>, University of Technology Nuremberg.`,
    `My research focuses on <b>label-efficient learning from images and videos</b>, in particular semi-supervised and self-supervised learning. I am also interested in <b>open-vocabulary inference</b>, especially segmentation, and in vision-language models. I am always happy to collaborate or just chat about any of this (and beyond!), so don't hesitate to <a href="#contact">reach out</a>.`,
  ],

  // order here = order of the buttons; "email" becomes a mailto: link
  links: {
    email: "ivan.martinovic@fer.hr",
    scholar: "https://scholar.google.com/citations?user=sQqOCocAAAAJ",
    github: "https://github.com/martinovicivan",
    linkedin: "https://www.linkedin.com/in/ivan-martinovi%C4%87-895a28343/",
    cv: "#cv", // opens cv.ipynb; set to "assets/cv.pdf" once there is a PDF
  },
  office: "Unska 3, 10000 Zagreb, Croatia",

  // ── news ──────────────────────────────────────────────────────────────────
  newsShown: 4, // rows visible before "show all"
  news: [
    { date: "2026-09", text: `<b>I Have a Stream</b> was accepted to <b>NeurIPS 2026</b>! <a href="https://martinovicivan.github.io/StreamMAE/">Project page</a>` },
    { date: "2026-09", text: `<b>MC-PanDA++</b> was accepted to the <b>International Journal of Computer Vision (IJCV)</b>.` },
    { date: "2026-06", text: `Won <b>1st place</b> in the LaRS Panoptic Segmentation Challenge at the <a href="https://openaccess.thecvf.com/content/CVPR2026W/MaCVi/papers/Kiefer_4th_Workshop_on_Maritime_Computer_Vision_MaCVi_Challenge_Overview_CVPRW_2026_paper.pdf">MaCVi workshop</a>, CVPR 2026.` },
    { date: "2025-09", text: `Started a research visit at the <a href="https://fundamentalailab.github.io/">Fundamental AI Lab (FunAI)</a>, University of Technology Nuremberg, hosted by Prof. Yuki M. Asano.` },
  ],

  // ── publications ──────────────────────────────────────────────────────────
  // venue: short badge text · venueFull: shown under the authors
  // selected: true → marking any paper adds a "selected / all" toggle (selected is the default view)
  // links: any of pdf, openreview, arxiv, code, project, video, slides, poster (or your own keys)
  //        the title links to project, else pdf, else openreview, else arxiv
  // bibtex: optional — generated automatically when left out
  // image: optional thumbnail, e.g. "assets/papers/one.png"
  publications: [
    {
      title: "I Have a Stream: Making Self-Supervised Learning Work on Continuous Video",
      authors: ["Ivan Martinović", "Lukas Knobel", "Yuki M. Asano"],
      venue: "NeurIPS 2026",
      venueFull: "Advances in Neural Information Processing Systems",
      year: 2026,
      links: {
        arxiv: "https://arxiv.org/abs/2609.40333",
        code: "https://github.com/martinovicivan/StreamMAE",
        project: "https://martinovicivan.github.io/StreamMAE/",
      },
      abstract: "Self-supervised learning draws inspiration from infant visual development, yet standard training pipelines bear little resemblance to it: images are independently sampled and globally shuffled across epochs. We study self-supervised learning from continuous video streams, where frames are consumed in temporal order using strict sliding-window batches, without global reshuffling or multi-epoch replay. To this end, we construct WT++, a 95-hour urban walking-tour video dataset for streaming pretraining. Combined with a comprehensive evaluation suite we find that contrastive and distillation-based methods struggle in this setting, while MAE is more robust but still falls short of standard i.i.d. pretraining. We find that high inter-batch similarity, caused by sliding-window consumption across consecutive batches, does not explain this gap. The main challenge is high intra-batch similarity, where frames within each batch are near-duplicates. To mitigate this, we propose StreamMAE, which preserves the core MAE reconstruction objective while adapting the input pipeline with stream-aware regularization and motion-biased crop selection. StreamMAE outperforms streaming baselines, matches i.i.d. MAE trained on the same video data, remains competitive with ImageNet-pretrained MAE, and scales positively as the pretraining stream grows from 12 to 95 hours.",
    },
    {
      title: "MC-PanDA++: Simpler, Stronger, and More Robust Domain-Adaptive Panoptic Segmentation",
      authors: ["Ivan Martinović", "Josip Šarić", "Yuki M. Asano", "Siniša Šegvić"],
      venue: "IJCV 2026",
      venueFull: "International Journal of Computer Vision",
      year: 2026,
      type: "article",
      links: {
        arxiv: "https://arxiv.org/abs/2609.39681",
        code: "https://github.com/martinovicivan/MC-PanDA",
      },
      abstract: "Unsupervised domain adaptation (UDA) reduces the annotation burden in panoptic segmentation by leveraging a cost-effectively labeled source domain (e.g., synthetic) and an unlabeled target domain to bridge the distribution gap. Existing panoptic UDA methods rely on teacher-student consistency learning built upon suboptimal per-pixel segmentation architectures. In contrast, state-of-the-art mask transformers are rarely adopted due to their pronounced vulnerability to confirmation bias in consistency learning, where erroneous teacher predictions are reinforced during training. Our earlier approach, MC-PanDA, mitigates this issue through fine-grained confidence estimation, which suppresses gradients from unreliable masks while sampling informative yet reliable locations for loss computation. However, this method entails a complex multi-stage training and requires careful hyperparameter tuning. This work presents MC-PanDA++, which addresses these limitations by introducing: (i) self-supervised vision encoders that provide a stronger and more robust initialization, further reducing the reliance on human annotations, (ii) per-class, self-adapting mask-wide loss scaling that stabilizes training and enables the usage of a single set of hyperparameters across domains, and (iii) a single-stage training pipeline that decreases overall conceptual complexity. Together, these improvements result in a conceptually simpler, better-performing, and more robust method for domain-adaptive panoptics.",
    },
    {
      title: "SPAR: Single-Pass Any-Resolution ViT for Open-vocabulary Segmentation",
      authors: ["Naomi Kombol", "Ivan Martinović", "Siniša Šegvić", "Giorgos Tolias"],
      venue: "CVPR 2026",
      venueFull: "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
      year: 2026,
      links: {
        pdf: "https://openaccess.thecvf.com/content/CVPR2026/papers/Kombol_SPAR_Single-Pass_Any-Resolution_ViT_for_Open-vocabulary_Segmentation_CVPR_2026_paper.pdf",
        code: "https://github.com/naomikombol/SPAR",
        project: "https://naomikombol.github.io/SPAR/",
      },
      abstract: "Foundational Vision Transformers (ViTs) have limited effectiveness in tasks requiring fine-grained spatial understanding, due to their fixed pre-training resolution and inherently coarse patch-level representations. These challenges are especially pronounced in dense prediction scenarios, such as open-vocabulary segmentation with ViT-based vision-language models, where high-resolution inputs are essential for accurate pixel-level reasoning. Existing approaches typically process large-resolution images using a sliding-window strategy at the pre-training resolution. While this improves accuracy through finer strides, it comes at a significant computational cost. We introduce SPAR: Single-Pass Any-Resolution ViT, a resolution-agnostic dense feature extractor designed for efficient high-resolution inference. We distill the spatial reasoning capabilities of a finely-strided, sliding-window teacher into a single-pass student using a feature regression loss, without requiring architectural changes or pixel-level supervision. Applied to open-vocabulary segmentation, SPAR improves single-pass baselines by up to 10.5 mIoU and even surpasses the teacher, demonstrating effectiveness in efficient, high-resolution reasoning.",
    },
    {
      title: "EAST: Early Action Prediction Sampling Strategy with Token Masking",
      authors: ["Iva Sović", "Ivan Martinović", "Marin Oršić"],
      venue: "ICLR 2026",
      venueFull: "International Conference on Learning Representations",
      year: 2026,
      links: {
        openreview: "https://openreview.net/forum?id=3Genv8DQgf",
      },
      abstract: "Early action prediction seeks to anticipate an action before it fully unfolds, but limited visual evidence makes this task especially challenging. We introduce EAST, a simple and efficient framework that enables a model to reason about incomplete observations. In our empirical study, we identify key components when training early action prediction models. Our key contribution is a randomized training strategy that samples a time step separating observed and unobserved video frames, enabling a single model to generalize seamlessly across all test-time observation ratios. We further show that joint learning on both observed and future (oracle) representations significantly boosts performance, even allowing an encoder-only model to excel. To improve scalability, we propose a token masking procedure that cuts memory usage in half and accelerates training by 2x with negligible accuracy loss. Combined with a forecasting decoder, EAST sets a new state of the art on NTU60, SSv2, and UCF101, surpassing previous best work by 10.1, 7.7, and 3.9 percentage points, respectively.",
    },
    {
      title: "DEARLi: Decoupled Enhancement of Recognition and Localization for Semi-supervised Panoptic Segmentation",
      authors: ["Ivan Martinović", "Josip Šarić", "Marin Oršić", "Matej Kristan", "Siniša Šegvić"],
      venue: "ICCVW 2025",
      venueFull: "IEEE/CVF International Conference on Computer Vision Workshops (Findings of ICCV)",
      year: 2025,
      award: "Oral",
      links: {
        pdf: "https://openaccess.thecvf.com/content/ICCV2025W/Findings/papers/Martinovic_DEARLi_Decoupled_Enhancement_of_Recognition_and_Localization_for_Semi-supervised_Panoptic_ICCVW_2025_paper.pdf",
        code: "https://github.com/martinovicivan/DEARLi",
      },
      abstract: "Pixel-level annotation is expensive and time-consuming. Semi-supervised segmentation methods address this challenge by learning models on few labeled images alongside a large corpus of unlabeled images. Although foundation models could further account for label scarcity, effective mechanisms for their exploitation remain underexplored. We address this by devising a novel semi-supervised panoptic approach fueled by two dedicated foundation models. We enhance recognition by complementing unsupervised mask-transformer consistency with zero-shot classification of CLIP features. We enhance localization by class-agnostic decoder warm-up with respect to SAM pseudo-labels. The resulting decoupled enhancement of recognition and localization (DEARLi) particularly excels in the most challenging semi-supervised scenarios with large taxonomies and limited labeled data. Moreover, DEARLi outperforms the state of the art in semi-supervised semantic segmentation by a large margin while requiring 8x less GPU memory, in spite of being trained only for the panoptic objective. We observe 29.9 PQ and 38.9 mIoU on ADE20K with only 158 labeled images.",
    },
    {
      title: "What Holds Back Open-Vocabulary Segmentation?",
      authors: ["Josip Šarić*", "Ivan Martinović*", "Matej Kristan", "Siniša Šegvić"],
      venue: "ICCVW 2025",
      venueFull: "IEEE/CVF International Conference on Computer Vision Workshops (What is Next in Multimodal Foundation Models?)",
      year: 2025,
      links: {
        pdf: "https://openaccess.thecvf.com/content/ICCV2025W/MMFM/papers/Saric_What_Holds_Back_Open-Vocabulary_Segmentation_ICCVW_2025_paper.pdf",
      },
      abstract: "Standard segmentation setups are unable to deliver models that can recognize concepts outside the training taxonomy. Open-vocabulary approaches promise to close this gap through language-image pretraining on billions of image-caption pairs. Unfortunately, we observe that the promise is not delivered due to several bottlenecks that have caused the performance to plateau for almost two years. This paper proposes novel oracle components that identify and decouple these bottlenecks by taking advantage of the groundtruth information. The presented validation experiments deliver important empirical findings that provide a deeper insight into the failures of open-vocabulary models and suggest prominent approaches to unlock the future research.",
    },
    {
      title: "MC-PanDA: Mask Confidence for Panoptic Domain Adaptation",
      authors: ["Ivan Martinović", "Josip Šarić", "Siniša Šegvić"],
      venue: "ECCV 2024",
      venueFull: "European Conference on Computer Vision",
      year: 2024,
      links: {
        pdf: "https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/09103.pdf",
        code: "https://github.com/martinovicivan/MC-PanDA",
      },
      abstract: "Domain adaptive panoptic segmentation promises to resolve the long tail of corner cases in natural scene understanding. Previous state of the art addresses this problem with cross-task consistency, careful system-level optimization and heuristic improvement of teacher predictions. In contrast, we propose to build upon remarkable capability of mask transformers to estimate their own prediction uncertainty. Our method avoids noise amplification by leveraging fine-grained confidence of panoptic teacher predictions. In particular, we modulate the loss with mask-wide confidence and discourage back-propagation in pixels with uncertain teacher or confident student. Experimental evaluation on standard benchmarks reveals a substantial contribution of the proposed selection techniques. We report 47.4 PQ on Synthia→Cityscapes, which corresponds to an improvement of 6.2 percentage points over the state of the art.",
    },
  ],

  // ── teaching ──────────────────────────────────────────────────────────────
  teaching: [
    { term: "2023–now", course: "Deep Learning", role: "teaching assistant", url: "" },
    { term: "2023–now", course: "Computer Vision", role: "teaching assistant", url: "" },
    { term: "2023–now", course: "3D Computer Vision", role: "teaching assistant", url: "" },
    { term: "2023–now", course: "Design Patterns", role: "teaching assistant", url: "" },
    { term: "2023–now", course: "Mentoring BSc and MSc students", role: "", url: "" },
  ],

  // ── cv.ipynb ──────────────────────────────────────────────────────────────
  // when / title / org / place / items (bullet points; HTML allowed)
  cv: {
    updated: "2026-10-03",
    hobbies: "running (a lot), watching/playing football", // shown as a comment in the last cell
    education: [
      {
        when: "Oct 2023 – present",
        title: "PhD in Computing",
        org: "Faculty of Electrical Engineering and Computing, University of Zagreb",
        place: "Zagreb, Croatia",
        items: [
          `Doctoral study programme “Electrical Engineering and Computing”`,
          `Supervisors: <a href="https://yukimasano.github.io/">Prof. Yuki M. Asano</a> (University of Technology Nuremberg) and <a href="https://www.fer.unizg.hr/jan.snajder">Prof. Jan Šnajder</a>; previously the late <a href="https://www.fer.unizg.hr/sinisa.segvic">Prof. Siniša Šegvić</a>`,
        ],
      },
      {
        when: "Oct 2021 – Jul 2023",
        title: "MSc in Computer Science",
        org: "Faculty of Electrical Engineering and Computing, University of Zagreb",
        place: "Zagreb, Croatia",
        items: [
          `Thesis: <a href="https://www.zemris.fer.hr/~ssegvic/project/pubs/martinovic23ms.pdf"><i>Application of language embeddings for semantic segmentation</i></a> <span class="lang">(in Croatian)</span>`,
          `Supervisor: Prof. Siniša Šegvić`,
        ],
      },
      {
        when: "Oct 2018 – Jul 2021",
        title: "BSc in Computer Science",
        org: "Faculty of Electrical Engineering and Computing, University of Zagreb",
        place: "Zagreb, Croatia",
        items: [
          `Thesis: <a href="https://dabar.srce.hr/en/islandora/object/fer%3A9979"><i>Implementation of recurrent neural network and application for next word prediction</i></a> <span class="lang">(in Croatian)</span>`,
          `Project: HaHackathon — Detecting and Rating Humor and Offense (SemEval 2021)`,
          `Supervisor: Prof. Jan Šnajder`,
        ],
      },
    ],
    experience: [
      {
        when: "Oct 2023 – present",
        title: "Research Assistant & PhD Student",
        org: "Faculty of Electrical Engineering and Computing, University of Zagreb",
        place: "Zagreb, Croatia",
        items: [
          `Teaching assistant: Deep Learning, Computer Vision, 3D Computer Vision, Design Patterns`,
          `Project: Research, development and production of new mobility vehicles and supporting infrastructure (NPOO.C1.4.R5-I2.01)`,
        ],
      },
      {
        when: "Sep 2025 – Mar 2026",
        title: "Visiting Researcher",
        org: `<a href="https://fundamentalailab.github.io/">Fundamental AI Lab (FunAI)</a>, University of Technology Nuremberg`,
        place: "Nuremberg, Germany",
        items: [`Host: <a href="https://yukimasano.github.io/">Prof. Yuki M. Asano</a>`],
      },
      {
        when: "Oct 2019 – Jul 2023",
        title: "Student Teaching Assistant",
        org: "Faculty of Electrical Engineering and Computing, University of Zagreb",
        place: "Zagreb, Croatia",
        items: [
          `Machine Learning 1, Deep Learning 1, Text Analysis and Retrieval, Introduction to Artificial Intelligence, Design Patterns, Operating Systems, Probability and Statistics, Discrete Mathematics 1, Mathematical Analysis 1 & 2`,
        ],
      },
      {
        when: "Jun 2021 – Jun 2023",
        title: "Research Intern in Natural Language Processing",
        org: "RealNetworks",
        place: "Zagreb, Croatia",
        items: [
          `Model pruning and distillation, text generation, and prompt-based multi-label classification`,
        ],
      },
      {
        when: "Jun 2020 – Oct 2020",
        title: "Software Engineer Intern",
        org: "CROZ",
        place: "Zagreb, Croatia",
      },
    ],
    awards: [
      { date: "Jun 2026", award: "1st place, LaRS Panoptic Segmentation Challenge", details: `MaCVi Workshop @ CVPR 2026 · team FER Zagreb · <a href="https://openaccess.thecvf.com/content/CVPR2026W/MaCVi/papers/Kiefer_4th_Workshop_on_Maritime_Computer_Vision_MaCVi_Challenge_Overview_CVPRW_2026_paper.pdf">challenge report</a> · <a href="assets/certificate_macvi.pdf">certificate</a>` },
      { date: "Dec 2023", award: "Graduated <i>summa cum laude</i>", details: "MSc in Computer Science, FER" },
      { date: "Oct 2022", award: "University of Zagreb Rector's Award", details: `With Rino Čala · <a href="assets/papers/rectors-award-2022.pdf"><i>Implementation of conversational models with personality traits</i></a> <span class="lang">(in Croatian)</span>` },
      { date: "2019–2021", award: "Dean's Award “Josip Lončar” (3×)", details: "Top 1% of students: 1st year (2019), 2nd year (2020), and the Special Dean's Award for excellence in undergraduate studies (2021)" },
    ],
  },

  endComment: "# for a chat / collab, say hi :)", // last cell of the main notebook
  updated: "2026-10-03",
  footer: `© 2026 Ivan Martinović`,
};
