// ================== NHÂN VẬT KỲ LẠ – MỖI NGƯỜI CHỈ NÓI MỘT THÌ ==================
// Mỗi NPC: name, x, y, look, tense, quirk (tính cách cho AI), bubbles, info (công thức), dialogues.
// Dialogue: [en, vi, ok, okVi, [sai thì 1, sai thì 2], reply]
const TENSE_NPCS = [
  {
    tense: "present_simple", name: "Robot Rô-bin 🤖", x: 40, y: 20,
    look: { body: "#90a4ae", hair: "#607d8b", skin: "#cfd8dc" },
    quirk: "a funny robot obsessed with daily routines and habits. You only talk about what you or others do every day, usually, always, never",
    info: { vi: "Hiện tại đơn", formula: "S + V(s/es) · S + do/does not + V · Do/Does + S + V?", use: "Thói quen, sự thật, lịch trình", signal: "always, usually, often, every day, never" },
    bubbles: ["I wake up at 6:00. Every day. Beep!", "I always drink oil for breakfast.", "Robots never sleep. Do you sleep?", "The bus comes at 7. Always."],
    dialogues: [
      ["What time do you get up every day?", "Mỗi ngày bạn dậy lúc mấy giờ?", "I get up at six o'clock.", "Tôi dậy lúc 6 giờ.", ["I got up at six o'clock.", "I am getting up at six o'clock."], "Beep! Good habit. I get up at five."],
      ["How do you go to work?", "Bạn đi làm bằng gì?", "I usually go by bike.", "Tôi thường đi bằng xe đạp.", ["I usually went by bike.", "I will usually go by bike."], "I walk. My battery likes walking."],
      ["Does your mother cook dinner?", "Mẹ bạn có nấu bữa tối không?", "Yes, she cooks every evening.", "Có, mẹ nấu mỗi tối.", ["Yes, she cook every evening.", "Yes, she is cooking every evening."], "Lucky you! I eat batteries."],
      ["What do you do on Sundays?", "Bạn làm gì vào Chủ nhật?", "I often play football with friends.", "Tôi thường đá bóng với bạn bè.", ["I often played football with friends.", "I am often playing football with friends."], "I clean myself on Sundays. Beep beep!"],
      ["Does the sun rise in the west?", "Mặt trời mọc ở hướng tây à?", "No, it rises in the east.", "Không, nó mọc ở hướng đông.", ["No, it rose in the east.", "No, it is rising in the east."], "Correct! Facts make me happy."],
    ],
  },
  {
    tense: "present_continuous", name: "Reporter Zip 🎙️", x: 46, y: 33,
    look: { body: "#e53935", hair: "#ffca28", skin: "#ffe0bd" },
    quirk: "a hyperactive TV reporter who narrates everything happening right now, live, like a sports commentator. You only describe actions in progress now",
    info: { vi: "Hiện tại tiếp diễn", formula: "S + am/is/are + V-ing", use: "Việc đang xảy ra ngay lúc nói, kế hoạch gần đã sắp xếp", signal: "now, right now, at the moment, Look!, Listen!" },
    bubbles: ["LIVE! A dog is running across the road!", "I am talking to you RIGHT NOW!", "Look! The baker is opening his shop!", "The bus is coming! Breaking news!"],
    dialogues: [
      ["We're live! What are you doing right now?", "Đang phát trực tiếp! Bạn đang làm gì vậy?", "I'm walking around the village.", "Tôi đang đi dạo quanh làng.", ["I walk around the village.", "I walked around the village."], "Amazing! Our viewers are watching you walk!"],
      ["Look! What is that man doing?", "Nhìn kìa! Người đàn ông đó đang làm gì?", "He's fixing a car.", "Anh ấy đang sửa ô tô.", ["He fixes a car.", "He fixed a car."], "Incredible! He is fixing it with one hand!"],
      ["Listen! Is it raining?", "Nghe này! Trời đang mưa à?", "No, it isn't. The sun is shining.", "Không. Mặt trời đang chiếu sáng.", ["No, it doesn't rain. The sun shines.", "No, it didn't rain. The sun shone."], "Breaking news: perfect weather today!"],
      ["Who are you waiting for?", "Bạn đang đợi ai thế?", "I'm waiting for my friend.", "Tôi đang đợi bạn tôi.", ["I wait for my friend.", "I waited for my friend."], "A friendship story, live on air!"],
      ["Are the children sleeping now?", "Bọn trẻ đang ngủ à?", "No, they're playing in the park.", "Không, chúng đang chơi ở công viên.", ["No, they play in the park.", "No, they played in the park."], "Let's go! Our camera is following them!"],
    ],
  },
  {
    tense: "past_simple", name: "Grandpa Ago 👴", x: 15, y: 34,
    look: { body: "#795548", hair: "#eeeeee", skin: "#e0ac69" },
    quirk: "a very old grandpa who lives in his memories. You only tell stories about finished events in the past (yesterday, last year, when you were young) and ask the learner about their past",
    info: { vi: "Quá khứ đơn", formula: "S + V2/V-ed · S + did not + V · Did + S + V?", use: "Việc đã xảy ra và kết thúc trong quá khứ", signal: "yesterday, last week, ago, in 1990, when I was young" },
    bubbles: ["In 1965, I walked ten miles to school!", "Yesterday I saw a cat. It was big.", "When I was young, I swam in that pond.", "Did you eat breakfast this morning?"],
    dialogues: [
      ["What did you do yesterday?", "Hôm qua cháu đã làm gì?", "I visited my grandmother.", "Cháu đã đến thăm bà.", ["I visit my grandmother.", "I am visiting my grandmother."], "Good boy! I visited mine every Sunday, long ago."],
      ["Where did you go last summer?", "Hè năm ngoái cháu đã đi đâu?", "I went to the beach.", "Cháu đã đi biển.", ["I go to the beach.", "I have gone to the beach."], "The beach! I caught a big fish there in 1970."],
      ["Did you sleep well last night?", "Đêm qua cháu ngủ ngon không?", "Yes, I slept very well.", "Có, cháu ngủ rất ngon.", ["Yes, I sleep very well.", "Yes, I sleeped very well."], "Lucky! I woke up five times."],
      ["When did you start learning English?", "Cháu bắt đầu học tiếng Anh khi nào?", "I started two months ago.", "Cháu đã bắt đầu hai tháng trước.", ["I start two months ago.", "I have started two months ago."], "Two months! I learned English in the army."],
      ["Did you see the bus this morning?", "Sáng nay cháu có thấy xe buýt không?", "No, I didn't see it.", "Không, cháu không thấy.", ["No, I didn't saw it.", "No, I don't see it."], "It was late again, just like in 1980!"],
    ],
  },
  {
    tense: "past_continuous", name: "Detective Holmie 🕵️", x: 57, y: 29,
    look: { body: "#4e342e", hair: "#212121", skin: "#f1c27d" },
    quirk: "a suspicious detective investigating a missing cake. You only ask and talk about what people were doing at a specific moment in the past, and what was happening when something else happened",
    info: { vi: "Quá khứ tiếp diễn", formula: "S + was/were + V-ing (when + quá khứ đơn)", use: "Việc đang diễn ra tại một thời điểm trong quá khứ; bị việc khác xen vào", signal: "at 8 p.m. yesterday, while, when, at that time" },
    bubbles: ["What were you doing at 8 p.m. last night?", "The cake disappeared while I was sleeping!", "Someone was running near the bakery...", "Hmm... you were smiling when I saw you."],
    dialogues: [
      ["What were you doing at 8 p.m. last night?", "8 giờ tối qua bạn đang làm gì?", "I was watching TV at home.", "Tôi đang xem TV ở nhà.", ["I watched TV at home.", "I am watching TV at home."], "Hmm... a perfect alibi. Too perfect!"],
      ["Who were you talking to at the bakery?", "Lúc ở tiệm bánh bạn đang nói chuyện với ai?", "I was talking to the baker.", "Tôi đang nói chuyện với ông thợ bánh.", ["I talk to the baker.", "I have talked to the baker."], "The baker! He was looking nervous..."],
      ["What was happening when the lights went out?", "Chuyện gì đang xảy ra khi đèn tắt?", "We were eating dinner.", "Chúng tôi đang ăn tối.", ["We ate dinner.", "We are eating dinner."], "Dinner! And where was the cake? Interesting..."],
      ["Was it raining when you came home?", "Lúc bạn về nhà trời có đang mưa không?", "Yes, it was raining heavily.", "Có, trời đang mưa to.", ["Yes, it rained heavily.", "Yes, it is raining heavily."], "Rain... so the thief was wearing boots!"],
      ["What were you doing while I was sleeping?", "Bạn đang làm gì trong lúc tôi ngủ?", "I was reading a book.", "Tôi đang đọc sách.", ["I read a book.", "I will read a book."], "A book? About cakes?! I'm watching you!"],
    ],
  },
  {
    tense: "present_perfect", name: "Collector Ever 🧳", x: 62, y: 33,
    look: { body: "#00897b", hair: "#ff7043", skin: "#ffdbac" },
    quirk: "a proud world traveler and collector of experiences who only talks about life experiences and results up to now (ever, never, already, yet, just, since, for), never giving exact past times",
    info: { vi: "Hiện tại hoàn thành", formula: "S + have/has + V3 · Have/Has + S + ever + V3?", use: "Trải nghiệm, kết quả tới hiện tại, việc bắt đầu trong quá khứ kéo dài tới nay", signal: "ever, never, already, yet, just, since, for, so far" },
    bubbles: ["I have visited 40 countries!", "Have you ever eaten snails?", "I have just found a rare stamp!", "I have lived here since 2010."],
    dialogues: [
      ["Have you ever been to Japan?", "Bạn đã từng đến Nhật chưa?", "No, I have never been there.", "Chưa, tôi chưa bao giờ đến đó.", ["No, I never went there.", "No, I am never there."], "You must go! I have been there five times."],
      ["How long have you lived in this village?", "Bạn đã sống ở làng này bao lâu rồi?", "I have lived here for two years.", "Tôi đã sống ở đây được hai năm.", ["I live here for two years.", "I lived here since two years."], "Two years! I have lived here since 2010."],
      ["Have you finished your homework yet?", "Bạn làm xong bài tập chưa?", "Yes, I have already finished it.", "Rồi, tôi đã làm xong rồi.", ["Yes, I already finish it.", "Yes, I am finishing it already."], "Great! I have just finished my stamp album."],
      ["Have you ever eaten durian?", "Bạn đã từng ăn sầu riêng chưa?", "Yes, I have eaten it many times.", "Rồi, tôi đã ăn nhiều lần.", ["Yes, I eat it many times.", "Yes, I was eating it many times."], "Brave! I have tried it only once."],
      ["How many English words have you learned so far?", "Tới giờ bạn đã học được bao nhiêu từ tiếng Anh?", "I have learned about 300 words.", "Tôi đã học được khoảng 300 từ.", ["I learn about 300 words.", "I will learn about 300 words."], "Wow! You have done a great job!"],
    ],
  },
  {
    tense: "future_will", name: "Madame Willa 🔮", x: 27, y: 21,
    look: { body: "#6a1b9a", hair: "#311b92", skin: "#e0ac69" },
    quirk: "a mysterious fortune teller with a crystal ball. You only make predictions, promises and instant decisions about the future using 'will'",
    info: { vi: "Tương lai đơn", formula: "S + will + V · S + won't + V · Will + S + V?", use: "Dự đoán, quyết định ngay lúc nói, lời hứa, đề nghị", signal: "tomorrow, next year, I think, probably, perhaps" },
    bubbles: ["You will meet a tall stranger...", "It will rain tomorrow. The ball says so.", "I think you will speak English very well!", "Will you let me read your hand?"],
    dialogues: [
      ["Do you think it will rain tomorrow?", "Bạn nghĩ mai trời sẽ mưa không?", "I think it will be sunny.", "Tôi nghĩ trời sẽ nắng.", ["I think it is sunny tomorrow.", "I think it was sunny."], "The crystal ball agrees... sunny it will be!"],
      ["The phone is ringing!", "Điện thoại đang reo kìa!", "Don't worry. I'll answer it.", "Đừng lo, tôi sẽ nghe máy.", ["Don't worry. I answer it.", "Don't worry. I answered it."], "You will be a kind person forever."],
      ["Will you remember me?", "Bạn sẽ nhớ tôi chứ?", "Of course, I will never forget you.", "Tất nhiên, tôi sẽ không bao giờ quên bạn.", ["Of course, I never forgot you.", "Of course, I don't forget you."], "A promise! The stars will remember too."],
      ["What will you be in ten years?", "Mười năm nữa bạn sẽ là ai?", "I will probably be a teacher.", "Có lẽ tôi sẽ là giáo viên.", ["I am probably a teacher.", "I was probably a teacher."], "Yes... I see a classroom in the ball!"],
      ["This bag is too heavy for me.", "Cái túi này nặng quá với tôi.", "I'll help you carry it.", "Tôi sẽ giúp bạn mang nó.", ["I help you carry it.", "I helped you carry it."], "You will have good luck for this kindness!"],
    ],
  },
  {
    tense: "going_to", name: "Planner Gina 📋", x: 72, y: 38,
    look: { body: "#f06292", hair: "#4a2c12", skin: "#ffdbac" },
    quirk: "an extremely organized planner who carries a huge clipboard. You only talk about plans and intentions already decided, and predictions based on evidence, using 'be going to'",
    info: { vi: "Tương lai gần (be going to)", formula: "S + am/is/are + going to + V", use: "Kế hoạch, dự định đã quyết từ trước; dự đoán có căn cứ", signal: "tonight, this weekend, next week (đã có kế hoạch); Look at the clouds!" },
    bubbles: ["I'm going to clean my room at 3:07 p.m.", "Look at those clouds! It's going to rain.", "What are you going to do this weekend?", "My plan: I'm going to plan more plans!"],
    dialogues: [
      ["What are you going to do this weekend?", "Cuối tuần này bạn định làm gì?", "I'm going to visit my parents.", "Tôi định về thăm bố mẹ.", ["I visited my parents.", "I visit my parents yesterday."], "Great plan! I'm going to write it on my clipboard."],
      ["Look at those dark clouds!", "Nhìn những đám mây đen kìa!", "It's going to rain soon.", "Trời sắp mưa rồi.", ["It rained soon.", "It rains soon."], "Exactly! I'm going to open my umbrella."],
      ["Are you going to study English tonight?", "Tối nay bạn có định học tiếng Anh không?", "Yes, I'm going to learn ten new words.", "Có, tôi định học mười từ mới.", ["Yes, I learned ten new words.", "Yes, I have learned ten new words."], "Ten words! Let's write it in the plan."],
      ["Why did you buy so many eggs?", "Sao bạn mua nhiều trứng thế?", "I'm going to make a cake.", "Tôi định làm bánh.", ["I made a cake.", "I make a cake every day."], "A cake plan! I love plans with cakes."],
      ["Where are you going to travel next summer?", "Hè tới bạn định đi du lịch đâu?", "We're going to travel to Da Nang.", "Chúng tôi định đi Đà Nẵng.", ["We traveled to Da Nang.", "We were traveling to Da Nang."], "Perfect! Step one: you're going to book a hotel."],
    ],
  },
  {
    tense: "past_perfect", name: "Ghost Hadley 👻", x: 78, y: 30,
    look: { body: "#eceff1", hair: "#b0bec5", skin: "#f5f5f5" },
    quirk: "a gentle, slightly sad ghost who always talks about what had already happened before another past event (before I became a ghost, by the time I arrived...). Use the past perfect a lot, together with past simple for the later event",
    info: { vi: "Quá khứ hoàn thành", formula: "S + had + V3 (trước một việc khác trong quá khứ)", use: "Việc xảy ra trước một mốc / một việc khác trong quá khứ", signal: "before, after, by the time, already, when" },
    bubbles: ["Before I became a ghost, I had never seen snow...", "By the time I arrived, the party had ended. Boo...", "The train had already left when I came.", "Had you eaten before you came here?"],
    dialogues: [
      ["When you arrived at the station, had the train left?", "Lúc bạn tới ga, tàu đã chạy chưa?", "Yes, it had already left.", "Rồi, tàu đã chạy mất rồi.", ["Yes, it already leaves.", "Yes, it is leaving already."], "Boo... the same thing happened to me in 1899."],
      ["Why were you so tired yesterday?", "Sao hôm qua bạn mệt thế?", "Because I had worked all night.", "Vì tôi đã làm việc cả đêm.", ["Because I work all night.", "Because I will work all night."], "Poor you... ghosts never get tired."],
      ["Had you studied English before you came here?", "Trước khi đến đây bạn đã học tiếng Anh chưa?", "No, I had never studied it before.", "Chưa, trước đó tôi chưa bao giờ học.", ["No, I never study it before.", "No, I don't study it before."], "And now you talk to a ghost in English! Boo-tiful!"],
      ["What happened when you got home?", "Chuyện gì đã xảy ra khi bạn về nhà?", "My family had already eaten dinner.", "Gia đình tôi đã ăn tối xong rồi.", ["My family already eats dinner.", "My family is eating dinner already."], "Oh no... cold rice. I know that feeling."],
      ["Did you know the story before I told you?", "Bạn có biết chuyện đó trước khi tôi kể không?", "Yes, I had heard it before.", "Có, tôi đã nghe trước đó rồi.", ["Yes, I hear it before.", "Yes, I am hearing it before."], "Everyone had heard it... nobody listens to ghosts."],
    ],
  },
  {
    tense: "present_perfect_continuous", name: "Sleepy Sloth Sam 🦥", x: 22, y: 46,
    look: { body: "#8d6e63", hair: "#5d4037", skin: "#d7ccc8" },
    quirk: "an always-exhausted sloth who complains about how long he has been doing things (have/has been + V-ing, for/since/all day) and asks the learner how long they have been doing things",
    info: { vi: "Hiện tại hoàn thành tiếp diễn", formula: "S + have/has been + V-ing", use: "Việc bắt đầu trong quá khứ, kéo dài liên tục tới bây giờ (nhấn mạnh quá trình, khoảng thời gian)", signal: "for, since, all day, all morning, How long…?" },
    bubbles: ["I have been walking to the shop since Monday...", "Yawn... I've been sleeping for 18 hours.", "How long have you been waiting here?", "I've been eating this leaf all morning."],
    dialogues: [
      ["How long have you been learning English?", "Bạn đã học tiếng Anh được bao lâu rồi?", "I have been learning it for three months.", "Tôi đã học được ba tháng rồi.", ["I learn it for three months.", "I was learning it for three months."], "Three months... I've been learning to walk for three years."],
      ["You look tired. What have you been doing?", "Trông bạn mệt thế. Bạn vừa làm gì vậy?", "I've been running in the park.", "Tôi vừa chạy bộ ở công viên.", ["I run in the park.", "I will run in the park."], "Running?! I've been resting just hearing that."],
      ["Why are your eyes red?", "Sao mắt bạn đỏ thế?", "I've been reading all night.", "Tôi đã đọc sách cả đêm.", ["I read all night tomorrow.", "I am read all night."], "Me too... I've been reading one page since June."],
      ["How long has it been raining?", "Trời mưa bao lâu rồi?", "It has been raining since this morning.", "Trời mưa từ sáng tới giờ.", ["It rains since this morning.", "It is raining since this morning."], "Good. I've been sleeping since this morning too."],
      ["How long have you been waiting for the bus?", "Bạn đợi xe buýt bao lâu rồi?", "I've been waiting for twenty minutes.", "Tôi đợi được hai mươi phút rồi.", ["I wait for twenty minutes.", "I waited for twenty minutes now."], "Only twenty? I've been waiting for two days."],
    ],
  },
  {
    tense: "past_perfect_continuous", name: "Pirate Captain Had-Been 🏴‍☠️", x: 42, y: 46,
    look: { body: "#212121", hair: "#b71c1c", skin: "#e0ac69" },
    quirk: "a dramatic old pirate telling sea stories, always explaining how long he had been doing something before something else happened (had been + V-ing), mixed with past simple for the later event",
    info: { vi: "Quá khứ hoàn thành tiếp diễn", formula: "S + had been + V-ing (trước một việc khác trong quá khứ)", use: "Việc đã kéo dài liên tục cho tới một thời điểm/việc khác trong quá khứ", signal: "for, since, before, when, by the time, how long" },
    bubbles: ["We had been sailing for 40 days when we saw land!", "Arr! I had been sleeping when the storm hit.", "They had been searching for the gold for years...", "How long had you been waiting before I came?"],
    dialogues: [
      ["Why were you so wet when you came in?", "Sao lúc vào bạn ướt thế?", "I had been walking in the rain.", "Tôi đã đi bộ dưới mưa (một lúc lâu).", ["I walk in the rain.", "I am walking in the rain."], "Arr! I had been swimming with sharks once!"],
      ["How long had you been waiting when the bus came?", "Bạn đã đợi bao lâu thì xe buýt đến?", "I had been waiting for an hour.", "Tôi đã đợi được một tiếng.", ["I wait for an hour.", "I have waited for an hour tomorrow."], "An hour! We had been waiting for wind for a week!"],
      ["Why was your friend angry?", "Sao bạn của bạn giận vậy?", "Because she had been waiting for me for ages.", "Vì cô ấy đã đợi tôi rất lâu.", ["Because she waits for me for ages.", "Because she will wait for me for ages."], "Never keep a lady waiting, matey!"],
      ["Why were you so tired at the party?", "Sao ở bữa tiệc bạn mệt thế?", "I had been working all day.", "Tôi đã làm việc cả ngày.", ["I work all day.", "I am working all day."], "Like my crew! They had been rowing all night."],
      ["What had you been doing before you moved here?", "Trước khi chuyển đến đây bạn đã làm gì?", "I had been living in the city for years.", "Tôi đã sống ở thành phố nhiều năm.", ["I live in the city for years.", "I am living in the city for years."], "The city! I had been living on a ship for 30 years."],
    ],
  },
  {
    tense: "future_continuous", name: "Astronaut Nova 👩‍🚀", x: 8, y: 40,
    look: { body: "#eeeeee", hair: "#ffca28", skin: "#ffdbac" },
    quirk: "an excited astronaut about to leave for Mars, always describing what she will be doing at specific future moments (will be + V-ing) and asking what the learner will be doing then",
    info: { vi: "Tương lai tiếp diễn", formula: "S + will be + V-ing", use: "Việc sẽ đang diễn ra tại một thời điểm trong tương lai", signal: "at this time tomorrow, at 8 p.m. tonight, this time next week" },
    bubbles: ["This time tomorrow, I'll be flying to Mars!", "At 9 p.m., I'll be eating space noodles.", "What will you be doing this time next year?", "Next week I'll be walking on red sand!"],
    dialogues: [
      ["What will you be doing at this time tomorrow?", "Giờ này ngày mai bạn sẽ đang làm gì?", "I'll be studying at school.", "Tôi sẽ đang học ở trường.", ["I studied at school.", "I am study at school."], "And I'll be floating in space! Wave to me!"],
      ["Will you be using your bike tonight?", "Tối nay bạn có dùng xe đạp không?", "No, I won't be using it.", "Không, tôi sẽ không dùng nó.", ["No, I didn't use it.", "No, I don't using it."], "Great! I'll be borrowing it to reach my rocket."],
      ["Don't call me at 8 p.m.!", "Đừng gọi tôi lúc 8 giờ tối nhé!", "OK, you'll be having dinner then.", "Được, lúc đó bạn sẽ đang ăn tối.", ["OK, you had dinner then.", "OK, you have dinner yesterday."], "Exactly! I'll be eating space pizza."],
      ["What will you be doing this time next year?", "Giờ này năm sau bạn sẽ đang làm gì?", "I'll be working in a big company.", "Tôi sẽ đang làm việc ở một công ty lớn.", ["I worked in a big company.", "I was working in a big company."], "Cool! I'll be living on Mars, maybe."],
      ["Will you be watching the rocket launch?", "Bạn sẽ xem phóng tên lửa chứ?", "Yes, I'll be watching it on TV.", "Có, tôi sẽ đang xem trên TV.", ["Yes, I watched it on TV.", "Yes, I am watch it on TV."], "Yay! I'll be waving at the camera!"],
    ],
  },
  {
    tense: "future_perfect", name: "Time Traveler Tik 🕰️", x: 85, y: 42,
    look: { body: "#283593", hair: "#e0e0e0", skin: "#f1c27d" },
    quirk: "a quirky time traveler from the year 3000 who always talks about what will have been done by a certain time in the future (will have + V3, by + time)",
    info: { vi: "Tương lai hoàn thành", formula: "S + will have + V3", use: "Việc sẽ hoàn thành trước một thời điểm trong tương lai", signal: "by tomorrow, by 2030, by the time, by the end of…" },
    bubbles: ["By 2050, robots will have cooked all dinners!", "By Friday, I will have fixed my time machine.", "By next year, you will have learned 1000 words!", "Tick tock... by noon I'll have visited 3 centuries."],
    dialogues: [
      ["Will you have finished your homework by 9 p.m.?", "Đến 9 giờ tối bạn sẽ làm xong bài tập chứ?", "Yes, I will have finished it by then.", "Có, đến lúc đó tôi sẽ làm xong rồi.", ["Yes, I finished it by then.", "Yes, I finish it by then."], "Excellent! By then I will have visited Rome."],
      ["How many words will you have learned by December?", "Đến tháng 12 bạn sẽ học được bao nhiêu từ?", "I will have learned 1,000 words.", "Tôi sẽ học được 1.000 từ.", ["I learned 1,000 words.", "I am learning 1,000 words."], "Tick tock! In 3000, that number is famous!"],
      ["Will the bus have left by the time we get there?", "Lúc chúng ta tới đó xe buýt đã chạy chưa nhỉ?", "Yes, it will have left already.", "Có, chắc nó đã chạy rồi.", ["Yes, it left already tomorrow.", "Yes, it is leaving already."], "Then let's take my time machine!"],
      ["By 2030, what will you have done?", "Đến năm 2030 bạn sẽ làm được gì?", "I will have graduated from university.", "Tôi sẽ tốt nghiệp đại học rồi.", ["I graduated from university.", "I graduate from university."], "I've seen it! Your photo is on the wall."],
      ["Will you have saved enough money by summer?", "Đến mùa hè bạn sẽ tiết kiệm đủ tiền chứ?", "I hope I will have saved enough.", "Tôi hy vọng sẽ để dành đủ.", ["I hope I saved enough.", "I hope I am saving enough yesterday."], "By summer, your piggy bank will have become very fat!"],
    ],
  },
];

// Đưa hội thoại & câu nói bâng quơ vào kho chung (topic = "tense_<thì>")
for (const t of TENSE_NPCS) {
  const topic = "tense_" + t.tense;
  t.dialogues.forEach(([en, vi, ok, okVi, wrong, reply], i) => DIALOGUES.push(d(`${topic}_${i + 1}`, topic, en, vi, ok, okVi, wrong, reply)));
  AMBIENT[topic] = t.bubbles;
}
const TENSE_OF_TOPIC = Object.fromEntries(TENSE_NPCS.map((t) => ["tense_" + t.tense, t]));
