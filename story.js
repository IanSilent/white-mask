// The case, in Russian and English.
// Text markup: [[slipId|phrase]] marks a "slip" the player can catch by clicking it.
'use strict';
const L = (ru, en) => ({ ru, en });

const UI = {
  title: L('Белая маска', 'The White Mask'),
  sub: L('Петербург. Маскарад. Полночь уже пробила.', 'St. Petersburg. A masquerade. Midnight has already struck.'),
  start: L('Войти в зал', 'Enter the ball'),
  how: L('A / D или стрелки — идти · E — говорить · Tab — записная книжка · можно мышью',
         'A / D or arrows — walk · E — talk · Tab — notebook · mouse works too'),
  next: L('Дальше', 'Continue'),
  leave: L('Уйти', 'Leave'),
  back: L('← Назад', '← Back'),
  show: L('Показать обмолвку…', 'Show a slip…'),
  name: L('Назвать маску…', 'Name the mask…'),
  whoIs: L('Кто под маской?', 'Who is behind the mask?'),
  proof: L('Что о ней говорят другие?', 'What do others say of this mask?'),
  whichSlip: L('Какую обмолвку показать?', 'Which slip do you show?'),
  spent: L('Вычеркнуто отработанных', 'Crossed out as spent'),
  noSlips: L('В книжке пока пусто.', 'The notebook is empty so far.'),
  caught: L('Обмолвка записана', 'Slip noted'),
  book: L('Книжка', 'Notebook'),
  bookNames: L('Список из зеркала', 'The list from the mirror'),
  bookSlips: L('Обмолвки', 'Slips'),
  under: L('под маской', 'behind the mask'),
  unknown: L('маска неизвестна', 'mask unknown'),
  close: L('Закрыть', 'Close'),
  talk: L('говорить', 'talk'),
  look: L('осмотреть', 'examine'),
  go: L('пройти', 'go'),
  mirror: L('к зеркалу', 'approach the mirror'),
  candleOut: L('Гаснет свеча. Осталось', 'A candle goes out. Left'),
  candleTip: L('Свечи — право на ошибку. Назовёшь маску не тем именем или зря обвинишь во лжи — одна погаснет. Погаснут все — отвечать Дьяволу придётся сразу.', 'Candles are your room for error. Name a mask wrongly, or accuse one of lying without cause, and one goes out. When all are out, you must answer the Devil at once.'),
  end: L('Конец', 'The End'),
  again: L('Сыграть ещё раз', 'Play again'),
  threads: L('Нитей распутано', 'Threads untangled'),
  candles: L('Свечей осталось', 'Candles left'),
  masksOff: L('Масок снято', 'Masks removed'),
  hint: L('Спросить совета', 'Ask for advice'),
  returnBack: L('Вернуться к свечам', 'Return to the candlelight'),
  underside: L('Изнанка', 'The Underside'),
  ready: L('Отвечать Дьяволу', 'Answer the Devil'),
  verdictQ: L('Назови имя', 'Give a name'),
  lie: L('Уличить во лжи…', 'Catch in a lie…'),
  whichLie: L('Что из сказанного — ложь?', 'Which of these is a lie?'),
  lieProof: L('Что этому противоречит?', 'What contradicts it?'),
  caughtLie: L('Маска поймана на лжи', 'The mask is caught lying'),
  lies: L('Поймано на лжи', 'Caught lying'),
  answers: L('Верных ответов Дьяволу', 'Right answers to the Devil'),
};

const ROOMS = {
  gallery: L('Зеркальная галерея', 'The Mirror Gallery'),
  hall: L('Бальный зал', 'The Ballroom'),
  buffet: L('Буфетная', 'The Buffet Room'),
  cards: L('Карточная', 'The Card Room'),
};

const MASKS = {
  exec: L('Палач', 'The Executioner'),
  harlequin: L('Арлекин', 'The Harlequin'),
  fox: L('Лиса', 'The Fox'),
  owl: L('Сова', 'The Owl'),
  raven: L('Ворон', 'The Raven'),
  devil: L('Голос', 'The Voice'),
  body: L('Буфетная', 'The Buffet Room'),
};

const NAMES = {
  ladov: { n: L('Павел Ладов', 'Pavel Ladov'), d: L('Ревнивый муж.', 'The jealous husband.') },
  zorina: { n: L('Княгиня Лидия Зорина', 'Princess Lidia Zorina'), d: L('Подруга Веры.', 'Vera\'s friend.') },
  olenin: { n: L('Корнет Дмитрий Оленин', 'Cornet Dmitri Olenin'), d: L('Гусар.', 'A hussar.') },
  renner: { n: L('Барон Карл Реннер', 'Baron Karl Renner'), d: L('Кредитор Ладова.', 'Ladov\'s creditor.') },
  turova: { n: L('Графиня Софья Турова', 'Countess Sofia Turova'), d: L('Всегда в чёрном.', 'Always in black.') },
  vyunov: { n: L('Осип Вьюнов', 'Osip Vyunov'), d: L('Мелкий чиновник.', 'A petty clerk.') },
  belsky: { n: L('Григорий Бельский', 'Grigory Belsky'), d: L('Старый знакомый.', 'An old acquaintance.') },
};

// Every slip the player can collect: who said it and the phrase as it goes into the notebook.
const SLIPS = {
  wrist: { who: 'body', q: L('На левом запястье светлая полоска: браслет носили долго и сняли недавно', 'A pale band on the left wrist: a bracelet worn for years, gone only lately') },
  cold: { who: 'exec', q: L('Я сам подал ей холодное', 'I served her the cold drink myself') },
  jingle: { who: 'exec', q: L('У неё на руке было пусто — а у шута звенело', 'Her wrist was bare — and the jester\'s was jingling') },
  note: { who: 'exec', q: L('Ночная птица принесла записку', 'A night bird brought a note') },
  remedy: { who: 'exec', q: L('Лекарство от позора мне отсыпали за зелёным сукном — даром', 'The cure for shame was measured out to me over the green baize — free of charge') },
  ring: { who: 'exec', q: L('Он знал мою привычку стучать перстнем — а я его не помню', 'He knew my habit of tapping my ring — and I do not remember him') },
  hand: { who: 'exec', q: L('Почерк чужой, старательный — так пишут за деньги', 'A hired hand, painstaking — the way one writes for money') },
  trophy: { who: 'harlequin', q: L('Трофей от дамы, которая не назвала себя', 'A trophy from a lady who gave no name') },
  epaulet: { who: 'harlequin', q: L('Клянусь честью мундира, я не знал, чьё это золото', 'On the honour of my uniform, I did not know whose gold it was') },
  foxgave: { who: 'harlequin', q: L('Лиса сама застегнула его мне на руку — как своё', 'The Fox clasped it on my wrist herself — as if it were hers') },
  glove: { who: 'harlequin', q: L('Под рыжим мехом у неё была чёрная траурная перчатка', 'Under the red fur she wore a black mourning glove') },
  clerk: { who: 'fox', q: L('Сова кланяется каждому столоначальнику — так кланяются только канцелярские', 'The owl bows to every head of department — only office folk bow like that') },
  coins: { who: 'owl', q: L('Чёрный платил по одной монете, старыми — так платит не барон, а тот, кто долго копил', 'The black one paid coin by coin, old ones — not the way a baron pays, but one who has saved for a long time') },
  owlmoney: { who: 'raven', q: L('Сова с утра занимала на извозчика — и к полуночи уже звенит', 'The owl was borrowing cab fare this morning — and by midnight it jingles') },
  sawfall: { who: 'raven', q: L('Я видел, как браслет упал у колонны и как рыжая лапа его накрыла', 'I saw the bracelet fall by the column and a red paw cover it') },
  widow: { who: 'fox', q: L('Мне давно положено только смотреть', 'I have long been allowed only to watch') },
  column: { who: 'fox', q: L('Он лежал у колонны, ничей', 'It lay by the column, belonging to no one') },
  ravensaw: { who: 'fox', q: L('Ворон стоял рядом и видел, как я подняла. Он поклонился мне', 'The Raven stood close and saw me pick it up. He bowed to me') },
  post: { who: 'owl', q: L('Я почта, а почта писем не читает', 'I am the post, and the post does not read letters') },
  paid: { who: 'owl', q: L('Диктовал тот, кто больше не играет, но от стола не отходит', 'It was dictated by one who no longer plays yet never leaves the table') },
  seven: { who: 'raven', q: L('Семь лет я только смотрю игру', 'For seven years I have only watched the game') },
};

const OBJECTS = {
  body: {
    text: L(
      'Под шалью — молодая женщина. Лицо спокойное и отчего-то знакомое. [[wrist|На левом запястье светлая полоска: браслет носили долго и сняли недавно]]. На столике рядом — бокал с недопитым лимонадом.',
      'Under the shawl lies a young woman. Her face is calm and, for some reason, familiar. [[wrist|A pale band on the left wrist: a bracelet worn for years, gone only lately]]. On the little table beside her stands a glass of unfinished lemonade.'),
  },
};

const NPC = {
  exec: {
    name: 'ladov', proofs: ['cold'],
    intro: L(
      'Тише. Она спит. Она всегда просила холодного после вальса — [[cold|я сам подал ей холодное]]. Сам. Никому не доверил.',
      'Hush. She is asleep. She always asked for something cold after a waltz — [[cold|I served her the cold drink myself]]. Myself. I trusted no one else.'),
    idle: L('Вы опять здесь. Говорите тише.', 'You again. Keep your voice down.'),
    topics: [
      { id: 'role', label: L('О костюме', 'About the costume'), text: L(
        'Палач не выбирает, кого казнить. Ему приносят приговор — он исполняет. Сегодня мне принесли.',
        'An executioner does not choose whom to execute. He is handed a sentence — he carries it out. Tonight I was handed one.') },
      { id: 'her', label: L('О ней', 'About her'), text: L(
        'Она смеялась весь вечер. Так смеются, когда есть что прятать… [[jingle|У неё на руке было пусто — а у шута звенело]]. Я умею считать. Я всю жизнь считал чужие карты.',
        'She laughed all evening. One laughs like that with something to hide… [[jingle|Her wrist was bare — and the jester\'s was jingling]]. I know how to count. I spent my life counting other people\'s cards.') },
      { id: 'cure', label: L('О том, что было в бокале', 'About what was in the glass'), text: L(
        'Есть болезни, от которых не зовут доктора. Мне подсказали лекарство. Оно подействовало.',
        'There are illnesses one does not call a doctor for. I was told of a cure. It worked.') },
    ],
    react: {
      wrist: L('Пусто, да. Я смотрел на эту руку весь вечер. Спросите шута, отчего он звенит.',
               'Bare, yes. I watched that hand all evening. Ask the jester why he jingles.'),
    },
    def: L('Мне всё равно, что там шепчут. Я уже всё услышал.', 'I do not care what they whisper out there. I have heard enough.'),
    // spoken on the Underside: ragged lines, '~' marks an echo
    unmask: [
      L('Ладов. Да. Здесь можно без колпака — здесь и так всё красное.', 'Ladov. Yes. No need for the hood here — everything is red already.'),
      L('Рука. Моя. Бокал был холодный, рука холоднее.', 'The hand. Mine. The glass was cold; the hand was colder.'),
      L('~раз — браслет на шуте. два — [[note|ночная птица принесла записку]]. три.', '~one — the bracelet on the jester. two — [[note|a night bird brought a note]]. three.'),
      L('[[remedy|Лекарство от позора мне отсыпали за зелёным сукном — даром]]. Я ещё сказал спасибо.', '[[remedy|The cure for shame was measured out to me over the green baize — free of charge]]. I even said thank you.'),
      L('Я не спросил её. Спросить — значит услышать ответ. Я всю жизнь боялся проиграть — и поставил её.', 'I did not ask her. To ask is to hear the answer. All my life I feared losing — so I staked her.'),
      L('~она пила и смотрела на меня. она думала, это забота.', '~she drank and looked at me. she thought it was care.'),
    ],
    after: [
      { id: 'note', label: L('О записке', 'About the note'), text: L(
        'Одна строчка: «Ищите браслет вашей жены на чужой руке». [[hand|Почерк чужой, старательный — так пишут за деньги]]. Я сжёг её. Она всё равно горит.',
        'One line: "Look for your wife\'s bracelet on another\'s wrist." [[hand|A hired hand, painstaking — the way one writes for money]]. I burned it. It burns still.') },
      { id: 'friend', label: L('О том, кто дал порошок', 'About the one who gave the powder'), text: L(
        'Лица я не видел — перья, клюв. [[ring|Он знал мою привычку стучать перстнем — а я его не помню]]. Я многих не помню из тех, кого обыграл.',
        'I saw no face — feathers, a beak. [[ring|He knew my habit of tapping my ring — and I do not remember him]]. I do not remember many of those I beat at cards.') },
      { id: 'innocent', label: L('Сказать: она не дарила браслета', 'Tell him: she never gave the bracelet away'),
        need: s => s.has('column') || s.has('foxgave'), text: L(
        '…Не говорите. Не надо. Тогда я убил не изменницу. Тогда я просто убил.',
        '…Do not say it. Do not. Then I did not kill an unfaithful wife. Then I simply killed.') },
    ],
  },

  harlequin: {
    name: 'olenin', proofs: ['epaulet', 'jingle'],
    intro: L(
      'А, белая! Скучная маска, зато честная. А я сегодня с добычей: [[trophy|трофей от дамы, которая не назвала себя]], — только рыжий мех да горькие духи. Слышите, как звенит?',
      'Ah, the white one! A dull mask, but an honest one. I, however, have spoils tonight: [[trophy|a trophy from a lady who gave no name]] — only red fur and bitter perfume. Hear how it jingles?'),
    // what the mask has claimed (shown when the player accuses it of lying), and the one claim that can be disproved
    claims: {
      intro: L('«Трофей мне подарила дама без имени»', '"A lady with no name gave me the trophy"'),
      self: L('«Я человек мирный: перо, чернила, присутствие»', '"I am a peaceable man: pen, ink, the office"'),
      trophy: L('«Замужние дарят щедрее»', '"Married women give more freely"'),
      death: L('«Я пью шампанское и оттого бессмертен»', '"I drink champagne and am therefore immortal"'),
    },
    lie: { stmt: 'self', by: ['epaulet'], crack: L(
      '…Тише вы! Ну, мундир, не чернила — что с того? Даму я всё равно не выдам. Скажу одно, и то потому, что страшно: [[glove|под рыжим мехом у неё была чёрная траурная перчатка]]. Я ещё подумал — к чему бы.',
      '…Quiet! Very well, a uniform, not ink — what of it? I still will not give the lady away. One thing only, and only because I am frightened: [[glove|under the red fur she wore a black mourning glove]]. I even wondered what for.') },
    idle: L('Белая! Всё бродите? Танцевать надо, танцевать!', 'White one! Still wandering? One ought to dance, dance!'),
    topics: [
      { id: 'self', label: L('О себе', 'About yourself'), text: L(
        'Я? Человек самый мирный: перо, чернила, присутствие с девяти. Оттого и отплясываю за весь год разом.',
        "Me? The most peaceable of men: pen, ink, the office from nine. Hence I dance a whole year's worth in one night.") },
      { id: 'trophy', label: L('О трофее', 'About the trophy'), text: L(
        'Золото, змейка, глаза из граната. Даме, видно, не жаль. Я всегда говорю: замужние дарят щедрее — им есть за что платить. Шутка! На маскараде всё шутка.',
        'Gold, a little serpent, garnets for eyes. The lady did not grudge it, clearly. I always say: married women give more freely — they have more to pay for. A joke! Everything is a joke at a masquerade.') },
      { id: 'death', label: L('О том, что в буфетной', 'About the buffet room'), text: L(
        'Говорят, кому-то стало дурно от лимонада. Я пью шампанское и оттого бессмертен.',
        'They say someone took ill from the lemonade. I drink champagne and am therefore immortal.') },
    ],
    react: {
      jingle: L('Звенел, и что? Я обошёл с ним весь зал. Даже палач обернулся — вот как блестит! Зависть — лучший комплимент.',
                'I jingled, what of it? I carried it round the whole ballroom. Even the executioner turned to look — that is how it shines! Envy is the finest compliment.'),
      wrist: L('Чья… рука? Погодите. Это та дама, в буфетной?.. [[epaulet|Клянусь честью мундира, я не знал, чьё это золото]]. Мне его надели. Я только… носил.',
               'Whose… wrist? Wait. The lady in the buffet room?.. [[epaulet|On the honour of my uniform, I did not know whose gold it was]]. It was put on me. I only… wore it.'),
    },
    def: L('Не понимаю и понимать не хочу. Танцуйте, белая!', 'I do not understand and do not care to. Dance, white one!'),
    // spoken on the Underside: ragged lines, '~' marks an echo
    unmask: [
      L('Оленин. Корнет. Тут не звенит… почему тут ничего не звенит?', 'Olenin. Cornet. Nothing jingles here… why does nothing jingle here?'),
      L('На лестнице, под часами. [[foxgave|Лиса сама застегнула его мне на руку — как своё]]. «Залог. Имени не ищите».', 'On the staircase, under the clock. [[foxgave|The Fox clasped it on my wrist herself — as if it were hers]]. "A pledge. Do not seek my name."'),
      L('Я пошёл звенеть. Мне двадцать лет, у меня долги и ни одной победы — а тут золото, и все смотрят.', 'Off I went to jingle. I am twenty, I have debts and not one conquest — and here was gold, and everyone looking.'),
      L('~замужние дарят щедрее. замужние дарят щедрее. я сказал это палачу в лицо.', "~married women give more freely. married women give more freely. i said it to the executioner's face."),
      L('Я не знал, чья она жена. Я и не спросил. Мне было всё равно, чьё это, — лишь бы моё.', 'I did not know whose wife she was. I never asked. I did not care whose it was — so long as it was mine.'),
    ],
    after: [
      { id: 'fox', label: L('О Лисе', 'About the Fox'), text: L(
        'Голос низкий, руки дрожали. Так своё не дарят. Теперь-то я понимаю.',
        'A low voice, trembling hands. One does not give away one\'s own like that. I see it now.') },
    ],
  },

  fox: {
    name: 'turova', proofs: ['foxgave', 'column', 'trophy', 'glove', 'sawfall'],
    intro: L(
      'Вы не танцуете? Я тоже. [[widow|Мне давно положено только смотреть]] — вот я и смотрю. Отсюда видно всех, а меня — никому.',
      'You do not dance? Neither do I. [[widow|I have long been allowed only to watch]] — so I watch. From here one sees everyone and is seen by none.'),
    claims: {
      intro: L('«Мне давно положено только смотреть»', '"I have long been allowed only to watch"'),
      self: L('«Я здесь с мужем, он у карт»', '"I am here with my husband; he is at the cards"'),
      seen: L('«Здесь весь вечер что-нибудь роняют»', '"All evening people drop things here"'),
      death: L('«Веселье здесь плохо кончается»', '"Merriment ends badly here"'),
    },
    lie: { stmt: 'self', by: ['glove'], crack: L(
      '…Мужа нет. Три года как нет — вы довольны? Я стою здесь и смотрю, потому что больше мне ничего не осталось. Зато вижу всех. [[clerk|Вон та сова кланяется каждому столоначальнику — так кланяются только канцелярские]]. Ступайте мучить её.',
      '…There is no husband. Not for three years — are you satisfied? I stand here and watch because nothing else is left to me. But I see everyone. [[clerk|That owl over there bows to every head of department — only office folk bow like that]]. Go and torment it instead.') },
    idle: L('Опять вы. У этой колонны становится людно.', 'You again. It is getting crowded by this column.'),
    topics: [
      { id: 'self', label: L('О себе', 'About yourself'), text: L(
        'Я здесь с мужем. Он где-то у карт — он всегда где-то у карт.',
        'I am here with my husband. He is somewhere at the cards — he is always somewhere at the cards.') },
      { id: 'seen', label: L('О том, что отсюда видно', 'About what one sees from here'), text: L(
        'Здесь весь вечер что-нибудь роняют: веера, слова, репутации. Поднимать не обязательно. Но иногда вещь лежит так сиротливо…',
        'All evening people drop things here: fans, words, reputations. One need not pick them up. But sometimes a thing lies there so forlorn…') },
      { id: 'death', label: L('О той, что в буфетной', 'About the woman in the buffet room'), text: L(
        'Бедняжка. Говорят, она была весела весь вечер. Веселье здесь плохо кончается.',
        'Poor thing. They say she was merry all evening. Merriment ends badly here.') },
    ],
    react: {
      trophy: L('Мало ли рыжих мехов в Петербурге. И духи с горечью нынче у каждой второй.',
                'Petersburg is full of red furs. And every second woman wears a bitter perfume this season.'),
      foxgave: L('…Он рассказал. Мальчишка. Хорошо: [[column|он лежал у колонны, ничей]]. Я не крала. Я подняла.',
                 '…He told you. The boy. Very well: [[column|it lay by the column, belonging to no one]]. I did not steal. I picked it up.'),
      wrist: L('Не показывайте мне этого. Я не хочу знать, чья это была рука.',
               'Do not show me that. I do not wish to know whose wrist it was.'),
    },
    def: L('Вы говорите загадками. Я тоже умею, но сегодня устала.', 'You speak in riddles. I can too, but tonight I am tired.'),
    // spoken on the Underside: ragged lines, '~' marks an echo
    unmask: [
      L('Турова. Софья. Здесь меня видно — как неприятно.', 'Turova. Sofia. I can be seen here — how unpleasant.'),
      L('Три года в чёрном. Замечать меня перестали на второй. Сегодня я надела рыжее, чтобы мальчик меня запомнил.', 'Three years in black. By the second they had stopped noticing me. Tonight I wore red so that a boy would remember me.'),
      L('Своё дарить нельзя — мои вещи знает весь город. А этот лежал у колонны. С вензелем. Я прочла вензель.', 'I could not give anything of mine — the whole city knows my things. But this one lay by the column. Monogrammed. I read the monogram.'),
      L('~верну потом. верну потом. потом.', '~i will return it later. return it later. later.'),
      L('[[ravensaw|Ворон стоял рядом и видел, как я подняла. Он поклонился мне]] — как кланяются своим.', "[[ravensaw|The Raven stood close and saw me pick it up. He bowed to me]] — the way one bows to one's own kind."),
      L('Я не желала ей зла. Я о ней вообще не думала. Вот мой грех: не думала.', 'I wished her no harm. I did not think of her at all. That is my sin: I did not think.'),
    ],
    after: [
      { id: 'raven', label: L('О Вороне', 'About the Raven'), text: L(
        'Он ничего не сказал. Вот что страшно: хватило бы одного слова — мне, ей, кому угодно. Он поклонился и ушёл к картам.',
        'He said nothing. That is the dreadful part: one word would have done — to me, to her, to anyone. He bowed and went back to the cards.') },
    ],
  },

  owl: {
    name: 'vyunov', proofs: ['note', 'hand', 'clerk', 'owlmoney'],
    intro: L(
      'Угу. Белая маска, чистая бумага. Не желаете ли поручение? Я дёшев и нем. [[post|Я почта, а почта писем не читает]].',
      'Hoo. A white mask, a clean sheet. Any errand for me? I am cheap and mute. [[post|I am the post, and the post does not read letters]].'),
    claims: {
      intro: L('«Я почта, а почта писем не читает»', '"I am the post, and the post does not read letters"'),
      self: L('«У меня и свои должники есть»', '"I have debtors of my own"'),
      errand: L('«Сегодня я носил одно поручение»', '"I carried one errand tonight"'),
      death: L('«В буфетную я не ходок»', '"I do not go near the buffet room"'),
    },
    lie: { stmt: 'self', by: ['owlmoney'], crack: L(
      'Угу… Ну, занимал. Должников нет, есть заказчики. Сегодняшний — в чёрных перьях. [[coins|Платил по одной монете, старыми — так платит не барон, а тот, кто долго копил]]. Больше не скажу: дальше уже дороже.',
      'Hoo… Well, I borrowed. No debtors — clients. Tonight\'s one wears black feathers. [[coins|He paid coin by coin, old ones — not the way a baron pays, but one who has saved for a long time]]. I shall say no more: beyond this it costs extra.') },
    idle: L('Угу. Опять без поручения?', 'Hoo. No errand again?'),
    topics: [
      { id: 'self', label: L('О себе', 'About yourself'), text: L(
        'Не смотрите, что перья серые. У меня и свои должники есть — просто я люблю быть полезным.',
        'Never mind the grey feathers. I have debtors of my own — I simply like to be of use.') },
      { id: 'errand', label: L('О поручениях этого вечера', 'About tonight\'s errands'), text: L(
        'Одно носил. Крылья целы, клюв на замке. Адресат остался доволен… нет, не то слово. Адресат остался убеждён.',
        'I carried one. Wings intact, beak locked. The addressee was pleased… no, wrong word. The addressee was convinced.') },
      { id: 'death', label: L('О буфетной', 'About the buffet room'), text: L(
        'Я в буфетную не ходок. Там нынче сквозит.',
        'I do not go near the buffet room. There is a draught in there tonight.') },
    ],
    react: {
      hand: L('Старательный почерк… Мало ли кто пишет за деньги. Это ремесло, а не улика.', 'A painstaking hand… Plenty of people write for money. That is a trade, not evidence.'),
      note: L('Птица, птица… Ночью все птицы серы. Ну, носил. Носить — не писать.',
              'A bird, a bird… All birds are grey at night. Well, I carried it. Carrying is not writing.'),
      seven: L('Угу. О тех, кто сидит у карт, я молчу бесплатно. Говорю — за деньги.',
               'Hoo. About those who sit at the cards I keep silent for free. I talk for money.'),
    },
    def: L('Угу. Это не ко мне, это выше.', 'Hoo. Not my department. That goes higher up.'),
    // spoken on the Underside: ragged lines, '~' marks an echo
    unmask: [
      L('Вьюнов. Осип. Тут не платят?.. Тогда скажу даром, один раз.', 'Vyunov. Osip. No pay here?.. Then I shall say it for free, once.'),
      L('Писал я. Рука моя, слова чужие: «Ищите браслет вашей жены на чужой руке». Ни слова лжи — браслет там и был.', 'I wrote it. My hand, another\'s words: "Look for your wife\'s bracelet on another\'s wrist." Not a word of a lie — the bracelet was right there.'),
      L('[[paid|Диктовал тот, кто больше не играет, но от стола не отходит]]. Платил старым золотом.', '[[paid|It was dictated by one who no longer plays yet never leaves the table]]. He paid in old gold.'),
      L('~почта не читает. почта не читает. я прочёл. я всегда читаю.', '~the post does not read. the post does not read. i read it. i always read.'),
      L('Я знал, чем кончаются такие записки. За это и берут дороже. Меня тридцать лет никто не зовёт по отчеству — пусть хоть платят.', 'I knew how such notes end. That is why they cost more. For thirty years no one has called me by my full name — let them at least pay.'),
    ],
    after: [
      { id: 'who', label: L('О том, кто диктовал', 'About the one who dictated'), text: L(
        'Имени не спрашивал — за это доплачивают. Но перья у него чёрные, и на карты он смотрит, как вдовец на свадьбу.',
        'I did not ask his name — one is paid extra for that. But his feathers are black, and he looks at cards the way a widower looks at a wedding.') },
    ],
  },

  raven: {
    name: 'belsky', proofs: ['paid', 'ravensaw', 'remedy', 'ring', 'coins'],
    intro: L(
      'Садитесь, белая. Не играете? И я нет. [[seven|Семь лет я только смотрю игру]]. Со стороны она честнее.',
      'Sit down, white one. You do not play? Nor do I. [[seven|For seven years I have only watched the game]]. It is more honest from the side.'),
    claims: {
      intro: L('«Семь лет я только смотрю игру»', '"For seven years I have only watched the game"'),
      self: L('«Я ссужаю тех, кто играет»', '"I lend to those who play"'),
      game: L('«Я не понтировал, я держал свечу»', '"I placed no bet; I held the candle"'),
      death: L('«Умерла женщина, которая никому не была должна»', '"A woman has died who owed nothing to anyone"'),
    },
    lie: { stmt: 'self', by: ['ring', 'remedy', 'coins'], crack: L(
      '…Верно. Мне нечего ссужать. Я смотрю — это всё, что у меня осталось. И смотрю внимательно: [[sawfall|я видел, как браслет упал у колонны и как рыжая лапа его накрыла]]. Я поклонился. Вежливость ничего не стоит.',
      '…True. I have nothing to lend. I watch — it is all I have left. And I watch closely: [[sawfall|I saw the bracelet fall by the column and a red paw cover it]]. I bowed. Courtesy costs nothing.') },
    idle: L('Вы вернулись. Значит, кто-то что-то сказал.', 'You are back. So someone has said something.'),
    topics: [
      { id: 'self', label: L('О себе', 'About yourself'), text: L(
        'Я ссужаю тех, кто играет. Это спокойнее, чем играть самому, и проценты вернее.',
        'I lend to those who play. It is calmer than playing oneself, and the interest is surer.') },
      { id: 'game', label: L('О сегодняшней игре', 'About tonight\'s game'), text: L(
        'Сегодня играли без карт. Один господин поставил всё на собственные глаза — и им же проиграл. Я не понтировал. Я держал свечу. [[owlmoney|А сова с утра занимала на извозчика — и к полуночи уже звенит]]. Вечер чудес.',
        'Tonight they played without cards. A certain gentleman staked everything on his own eyes — and lost to them. I placed no bet. I held the candle. [[owlmoney|And the owl was borrowing cab fare this morning — and by midnight it jingles]]. A night of wonders.') },
      { id: 'death', label: L('О смерти в буфетной', 'About the death in the buffet room'), text: L(
        'Умерла женщина, которая никому не была должна. Так бывает, когда долги мужа взыскивают не с того. Или как раз с того.',
        'A woman has died who owed nothing to anyone. It happens when a husband\'s debts are collected from the wrong person. Or from exactly the right one.') },
    ],
    react: {
      remedy: L('Аптекарь не отвечает за болезнь. Человек искал порошок — человек нашёл порошок. Я лишь знаю лавки.',
                'The apothecary does not answer for the illness. A man sought a powder — a man found a powder. I merely know the shops.'),
      ravensaw: L('Поклон — простая вежливость. Я всегда вежлив с теми, кто делает мою работу за меня.',
                  'A bow is plain courtesy. I am always courteous to those who do my work for me.'),
      paid: L('Золото не пахнет чернилами. А сова — птица глупая: видит ночью, понимает к утру.',
              'Gold does not smell of ink. And the owl is a foolish bird: it sees at night and understands by morning.'),
      ring: L('Перстнем стучат, когда карта идёт. Я запомнил этот стук. Он семь лет стоит у меня в ушах.',
              'A man taps his ring when the cards run his way. I remember that tapping. It has stayed in my ears for seven years.'),
      wrist: L('Пустое запястье. Красноречивее любого письма, не правда ли?',
               'A bare wrist. More eloquent than any letter, is it not?'),
    },
    def: L('Любопытно. Но это чужая партия, я в ней только зритель.', 'Curious. But that is someone else\'s game; I am only a spectator.'),
    // spoken on the Underside: ragged lines, '~' marks an echo
    unmask: [
      L('Бельский. Мне здесь привычно. Я живу тут семь лет.', 'Belsky. I am at home here. I have lived here for seven years.'),
      L('Он раздел меня за одну ночь: дом, имя, невеста. Стучал перстнем и не поднял глаз.', 'He stripped me in a single night: house, name, bride. He tapped his ring and never raised his eyes.'),
      L('Я не сделал ничего. Браслет упал сам. Лиса подняла сама. Шут звенел сам. Порошок он попросил сам.', 'I did nothing. The bracelet fell by itself. The Fox picked it up by herself. The jester jingled by himself. The powder he asked for himself.'),
      L('Я только промолчал одно слово — и продиктовал одну правду.', 'I merely kept back one word — and dictated one truth.'),
      L('~она смеялась у колонны. она была ни при чём. поэтому — она.', '~she was laughing by the column. she had nothing to do with it. that is why — her.'),
      L('Мне не стало легче. Я думал — станет. Спросите вашего хозяина: что именно я сделал?', 'I feel no lighter. I thought I would. Ask your master: what exactly did I do?'),
    ],
    after: [
      { id: 'vera', label: L('О Вере', 'About Vera'), text: L(
        'Она мне ничего не сделала. В этом и расчёт: чтобы ему было больно, платить должен был невиновный.',
        'She did nothing to me. That was the whole design: for him to hurt, the innocent had to pay.') },
    ],
  },
};

const GENERIC = {
  own: L('Это мои слова. Я их помню.', 'Those are my own words. I remember them.'),
  weak: L('«Это не обо мне». Маска не дрогнула.', '"That is not about me." The mask does not stir.'),
  wrong: L('«Мимо, белая». Маска смеётся. Где-то в доме гаснет свеча.', '"Wide of the mark, white one." The mask laughs. Somewhere in the house a candle goes out.'),
  falseAcc: L('«Ложь? На маскараде? Это вы напрасно». Маска отворачивается. Где-то в доме гаснет свеча.', '"A lie? At a masquerade? You wrong me." The mask turns away. Somewhere in the house a candle goes out.'),
  back: L('…Здесь вдруг стало холодно. Вы что-то спросили?', '…It has turned cold in here all of a sudden. Did you ask something?'),
  done: L('Я сказал всё. Остальное — не ко мне.', 'I have said everything. The rest is not mine to tell.'),
};

const DEVIL = {
  intro: [
    L('Полночь. Женщина под шалью — Вера Ладова. Бокал лимонада, щепоть порошка — и ко мне, раньше срока.',
      'Midnight. The woman under the shawl is Vera Ladova. A glass of lemonade, a pinch of powder — and she came to me before her time.'),
    L('Того, кто сыпал, искать не надо. Он стоит возле неё и уже мой. Рука всегда моя.',
      'There is no need to look for the one who poured it. He stands beside her and is mine already. The hand is always mine.'),
    L('Но руку вели. Мне нужен тот, кто вёл. Одна душа сверх счёта — таков мой интерес.',
      'But the hand was guided. I want the one who guided it. One soul over the count — such is my interest.'),
    L('Ты — Белая маска. Лица у тебя нет, имени пока тоже. Ходи, слушай. Здесь никто не говорит прямо — лови обмолвки, они светятся в речи.',
      'You are the White Mask. You have no face, and for now no name. Walk, listen. No one here speaks plainly — catch their slips; they glimmer in the speech.'),
    L('Пока маска надета, она врёт, когда ей удобно. Услышишь ложь — уличи: предъяви обмолвку, которая спорит с её словами, и маска проговорится о другом. Обвинишь зря — погаснет свеча.',
      'While a mask is on, it lies whenever it suits. Hear a lie — expose it: present a slip that quarrels with its words, and the mask will let something slip about another. Accuse without cause — a candle goes out.'),
    L('А можно назвать маску по имени — и предъявить то, что о ней сказали другие. Назовёшь верно — на минуту провалишься с ней на изнанку. Там не врут. Ошибёшься именем — тоже свеча. Их шесть. И помни: без маски уже не лгут. Сперва лови на лжи, потом называй.',
      'Or you may call a mask by its name — and present what others have said of it. Name one rightly — and for a minute you fall through with it to the Underside. No one lies there. Name wrongly — a candle as well. There are six. And remember: without a mask no one lies any more. Catch the lie first, name afterwards.'),
    L('Вот семь имён, они уже в твоей книжке. Масок пять: двое из списка сюда не дошли. Начни с того, кто рядом. А когда будешь готова — найди меня в большом зеркале, в галерее за бальным залом. Я спрошу трижды.',
      'Here are seven names; they are already in your notebook. There are five masks: two on the list never came. Begin with the one beside you. And when you are ready — find me in the great mirror, in the gallery beyond the ballroom. I shall ask three times.'),
  ],
  idle: L('Ну? Рука и так моя. Готова отвечать? Вопросов три.', 'Well? The hand is mine already. Ready to answer? There are three questions.'),
  out: L('Свечи вышли. Ходить больше некуда. Отвечай с тем, что есть.', 'The candles are spent. There is nowhere left to walk. Answer with what you have.'),
  hints: {
    start: L('Осмотри ту, что лежит под шалью в буфетной. Мёртвые тоже обмолвливаются.', 'Examine the one lying under the shawl in the buffet room. The dead let things slip too.'),
    exec: L('У тела стоит человек, который сам подал ей последний бокал. В моём списке такой один.', 'By the body stands a man who served her last glass himself. There is only one such on my list.'),
    wrist: L('Покажи шуту то, что осталось на запястье у мёртвой.', 'Show the jester what is left on the dead woman\'s wrist.'),
    catchH: L('Шут назвался чернильной душой, а клялся мундиром. Уличи его — пока он в маске.', 'The jester called himself a man of ink, yet swore by his uniform. Expose him — while the mask is still on.'),
    harlequin: L('Кто клянётся честью мундира, тот мундир и носит.', 'He who swears on the honour of his uniform wears one.'),
    catchFox: L('Лиса говорит, что пришла с мужем. А перчатка под мехом — траурная. Уличи её, прежде чем называть.', 'The Fox says she came with her husband. Yet the glove under the fur is a mourning one. Expose her before you name her.'),
    fox: L('Траурная перчатка — к той, что всегда в чёрном. Нет перчатки — выбирай из двух дам и плати свечой за ошибку.', 'A mourning glove points to the one always in black. No glove — choose between two ladies and pay a candle for a mistake.'),
    askRaven: L('Сова хвалится должниками. Спроси Ворона о сегодняшней игре — он видел её утром.', 'The Owl boasts of debtors. Ask the Raven about tonight\'s game — he saw the bird this morning.'),
    catchOwl: L('Сова хвалится должниками, а утром занимала на извозчика. Уличи её.', 'The Owl boasts of debtors, yet this morning it was borrowing cab fare. Expose it.'),
    owl: L('Записки носят птицы. Кто в моём списке кланяется столоначальникам?', 'Notes are carried by birds. Who on my list bows to heads of department?'),
    catchRaven: L('Ворон говорит, что ссужает игрокам. А мужу отсыпал даром, и тот его даже не помнит. Уличи его.', 'The Raven says he lends to players. Yet he gave to the husband for free, and the husband does not even remember him. Expose him.'),
    raven: L('Тот, кто платит по монете, — не барон. Кто остаётся в моём списке?', 'One who pays coin by coin is no baron. Who is left on my list?'),
    all: L('Ты знаешь всё, что можно знать. Отвечай.', 'You know all there is to know. Answer.'),
  },
  exam: {
    q: [
      L('Первый вопрос. Кто поднял браслет Веры и отдал его как свой?', 'The first question. Who picked up Vera\'s bracelet and gave it away as their own?'),
      L('Второй. Чьей рукой написана записка мужу?', 'The second. Whose hand wrote the note to the husband?'),
      L('Третий, главный. Кто всё видел, всё устроил и промолчал? Кто вёл руку?', 'The third, the one that matters. Who saw it all, arranged it all and kept silent? Who guided the hand?'),
    ],
    right: [L('Да. Рыжая лапа, чёрная перчатка.', 'Yes. A red paw, a black glove.'), L('Да. Перо дешёвое, почерк старательный.', 'Yes. A cheap pen, a painstaking hand.')],
    guess: [L('Да. Хотя лица её ты так и не увидела — угадала.', 'Yes. Though you never saw her face — you guessed.'), L('Да — наугад, но да.', 'Yes — a guess, but yes.')],
    wrong: [L('Нет. Браслет поднимали другие руки.', 'No. Other hands picked up the bracelet.'), L('Нет. Это писала другая рука.', 'No. Another hand wrote it.')],
    score: [
      L('Ни одного верного ответа. Ты видела маски, а не лица.', 'Not one right answer. You saw masks, not faces.'),
      L('Один ответ из трёх. Ты видела маски, а не лица.', 'One answer out of three. You saw masks, not faces.'),
      L('Два ответа из трёх. Клубок остался клубком — но конец нити у тебя в руке.', 'Two answers out of three. The tangle is still a tangle — but you hold the end of the thread.'),
      L('Три из трёх. Ты распутала всё.', 'Three out of three. You have untangled it all.'),
    ],
  },
  verdict: {
    ladov: L('Ты принесла мне то, что и так лежит у меня в кармане. Он сыпал — он мой, без тебя и без суда. Я просил второго. Что ж, возьму его дважды: раз за яд, раз за то, что не спросил жену. А остальные поедут домой и будут спать спокойно. Это тоже приговор — твой.',
      'You bring me what already lies in my pocket. He poured it — he is mine, with or without you. I asked for a second. Well, I shall take him twice: once for the poison, once for never asking his wife. And the rest will ride home and sleep soundly. That, too, is a verdict — yours.'),
    olenin: L('Мальчишку? Он звенел чужим золотом и чужой честью, это правда. Глупость — мой любимый хворост. Но хворост не поджигатель. Беру. Он даже не поймёт за что — в этом и будет его ад.',
      'The boy? He jingled with another\'s gold and another\'s honour, true. Foolishness is my favourite kindling. But kindling is not the arsonist. I take him. He will not even understand what for — and that will be his hell.'),
    turova: L('Вдову. Она видела вензель — и подарила. Могла вернуть — и отложила. Трусость одета лучше всех на этом балу. Беру охотно. Но заметила ли ты, кто ей поклонился?',
      'The widow. She saw the monogram — and gave it away. She could have returned it — and put it off. Cowardice is the best-dressed guest at this ball. I take her gladly. But did you notice who bowed to her?'),
    vyunov: L('Почтальона? Этот продаст и меня, если доплатят. Мелкая душа, медная. Беру на сдачу. Перо было его — а голос чей?',
      'The postman? That one would sell me too, for a little extra. A small soul, a copper one. I take him as change. The pen was his — but whose was the voice?'),
    absent: L('Этого имени на балу не было. Ты обвиняешь пустой стул. Что ж, пустые стулья я тоже беру — но тот, кто вёл руку, сегодня уедет домой.',
      'That name was never at the ball. You accuse an empty chair. Well, I take empty chairs too — but the one who guided the hand rides home tonight.'),
    belskyFull: L('Бельский. Да. Он не сыпал, не крал, не лгал — он семь лет ждал, пока чужие слабости сложатся в верёвку, и подал конец. «Что я сделал?» — спросит он меня. Ничего. Для «ничего» у меня отдельный круг, самый холодный. Хорошая работа, Белая маска.',
      'Belsky. Yes. He did not pour, did not steal, did not lie — he waited seven years for other people\'s weaknesses to twist into a rope, and handed over the end. "What did I do?" he will ask me. Nothing. For "nothing" I keep a separate circle, the coldest one. Good work, White Mask.'),
    belskyGuess: L('Бельский. Угадала. Но угадать — не знать: маску ты с него не сняла, и он уйдёт от меня на слове «докажи». Я подожду. Ждать я умею не хуже него.',
      'Belsky. You guessed. But to guess is not to know: you never took his mask off, and he will slip from me on the word "prove it". I shall wait. I can wait as well as he can.'),
  },
  recapHead: L('Теперь слушай, как было. Что ты услышала сама — горит. Что прошло мимо — тлеет.',
               'Now hear how it was. What you heard yourself burns bright. What passed you by only smoulders.'),
  recap: [
    L('Вера обронила браслет у колонны. Она никому его не дарила.', 'Vera dropped her bracelet by the column. She gave it to no one.'),
    L('Графиня Турова подняла его и надела корнету на руку — как свой залог, лишь бы не называть себя.', 'Countess Turova picked it up and clasped it on the cornet\'s wrist — as her own pledge, so as not to name herself.'),
    L('Корнет Оленин звенел им на весь зал и пошутил про щедрость замужних — в двух шагах от мужа.', 'Cornet Olenin jingled it across the whole ballroom and joked about generous married women — two steps from the husband.'),
    L('Вьюнов отнёс Ладову записку: одну строчку правды, проданную за золото.', 'Vyunov carried Ladov a note: one line of truth, sold for gold.'),
    L('Бельский видел всё с первой минуты. Он продиктовал записку, указал порошок — и промолчал слово, которое её спасло бы.', 'Belsky saw it all from the first minute. He dictated the note, pointed to the powder — and kept back the word that would have saved her.'),
  ],
  hand: L('А сыпал — Ладов. Своей рукой, ни о чём её не спросив. Его не выгородит никто: ни они, ни ты, ни я.',
          'And Ladov poured it. With his own hand, without asking her a single thing. No one will excuse him: not they, not you, not I.'),
  twist: [
    L('А теперь сними маску. Она тебе больше не нужна… Вера Дмитриевна.', 'And now take off the mask. You no longer need it… Vera Dmitrievna.'),
    L('Мёртвые первым забывают своё имя. Ты ходила и спрашивала у всех, виновата ли ты. Теперь знаешь сама.', 'The dead forget their own name first. You walked about asking everyone whether you were to blame. Now you know for yourself.'),
    L('Иди. Тебя ждут не у меня.', 'Go. It is not with me that you are expected.'),
  ],
};
