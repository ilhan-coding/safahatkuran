# Data-source notes

## Qur’an text and page verification

The application continues to use AlQuran Cloud as its verified Uthmani-text source. The `/kuran` page text and page/ayah metadata are checked against this source before rendering. For the exact physical-line composition, the reader uses the pinned QPC1 KFGQPC V1 604-page layout data described below. The QPC word groups and AlQuran Cloud Uthmani words are aligned by normalized Arabic character stream, not by assuming that both datasets split every word at the same whitespace boundary. AlQuran Cloud’s own spelling remains the displayed text.

- [AlQuran Cloud API](https://alquran.cloud/api)
- Page query used for runtime source verification: `https://api.alquran.cloud/v1/page/{page}/quran-uthmani`

## Printed 604-page line layout

The reader obtains page-line grouping and word-to-ayah positions from the `QPC1` KFGQPC V1 layout data in [zonetecde/mushaf-layout](https://github.com/zonetecde/mushaf-layout), pinned to commit `421e9eaa991897ecd50d7abb79160651a45976d3`. The layout package's `package.json` declares ISC; its README distinguishes the embedded QPC fonts and notes that the repository's code license does not relicense those third-party fonts. This project does not fetch, bundle, or use those fonts. It uses the line/word layout metadata and validates its ordered normalized Arabic character stream against AlQuran Cloud before display.

- [Pinned page 005 layout JSON](https://raw.githubusercontent.com/zonetecde/mushaf-layout/421e9eaa991897ecd50d7abb79160651a45976d3/mushaf/QPC1/page-005.json)
- [Pinned page 150 layout JSON](https://raw.githubusercontent.com/zonetecde/mushaf-layout/421e9eaa991897ecd50d7abb79160651a45976d3/mushaf/QPC1/page-150.json)
- [Project package metadata](https://raw.githubusercontent.com/zonetecde/mushaf-layout/421e9eaa991897ecd50d7abb79160651a45976d3/package.json)

QUL's [KFGQPC V1 1405H layout resource](https://qul.tarteel.ai/resources/mushaf-layout/15) corroborates the 604-page layout identity. QUL documentation says to check repository and dataset-specific terms before production use; its downloadable resource is not used here.

## Yasser Al-Dosari word-synchronized audio

The word-following option uses the `Yasser Al Dosari (Murattal)` full-surah `.opus` stream and matching `.pb` segment file from [Quranic-Recitation-Data](https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data), pinned to dataset revision `fc2d3dc82fe96af3eecb3897395e395d4a004c57`. The dataset card declares Apache-2.0 and describes segments with one-based word positions and millisecond timestamps. Audio and timings are requested from the same pinned revision; the legacy MP3Quran Yasser option remains separate and uses verse-level timing only.

- [Dataset card and Apache-2.0 declaration](https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data)
- [Pinned Yasser Al-Dosari, surah 001 audio](https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data/resolve/fc2d3dc82fe96af3eecb3897395e395d4a004c57/Yasser%20Al%20Dosari%20%28Murattal%29/Full%20Surah/001/001.opus)
- [Pinned Yasser Al-Dosari, surah 001 timing](https://huggingface.co/datasets/zaibihassan/Quranic-Recitation-Data/resolve/fc2d3dc82fe96af3eecb3897395e395d4a004c57/Yasser%20Al%20Dosari%20%28Murattal%29/Full%20Surah/001/001.pb)
- [QUL word-segment schema reference](https://qul.tarteel.ai/resources/recitation/103/docs)

### Verified binary payload semantics

The pinned `.pb` files were inspected directly. Top-level field 1 is the surah number (it matches the corresponding file for all 114 surahs), field 2 is audio duration in milliseconds, and repeated field 3 entries contain a `surah:ayah` key and that verse’s segment list. Each segment carries a one-based word index, text, start milliseconds and end milliseconds in fields 1–4. Some audible words contain more than one timed segment with the same word index; the reader therefore highlights by word index and accepts multiple ordered time windows for that word. Runtime parsing checks the expected surah, ayah key, word index/text and duration bounds rather than treating field 1 as a schema version.
