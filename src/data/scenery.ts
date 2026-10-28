export type SceneryImage = {
  src: string
  alt: string
  credit: string
  source: string
  license: string
}

const commons = (file: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

export const scenery = {
  castle: {
    src: commons('Eltz Castle, from the pathway leading to the castle from the surrounding Eltz Forest (landscape).jpg'),
    alt: 'Замок Эльц среди леса и холмов',
    credit: 'Hammondtravels / Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Eltz_Castle,_from_the_pathway_leading_to_the_castle_from_the_surrounding_Eltz_Forest_(landscape).jpg',
    license: 'CC BY-SA 4.0',
  },
  nightCastle: {
    src: 'https://images.unsplash.com/photo-1520833071959-5cff9bb18065?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=1800',
    alt: 'Освещённый собор под звёздным небом',
    credit: 'Matthew Feeney / Unsplash',
    source: 'https://unsplash.com/photos/castle-during-night-time-W_T6Wi3h5iU',
    license: 'Unsplash License',
  },
  forest: {
    src: commons('Forest with Mist 1.JPG', 1400),
    alt: 'Туманный лес с мягким утренним светом',
    credit: 'Quant / Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Forest_with_Mist_1.JPG',
    license: 'CC BY-SA 3.0',
  },
  roses: {
    src: commons('RG Rose Garden.jpg', 1200),
    alt: 'Розовый сад с дорожкой между цветами',
    credit: 'GardenLover2008 / Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:RG_Rose_Garden.jpg',
    license: 'CC BY 3.0',
  },
} satisfies Record<string, SceneryImage>
