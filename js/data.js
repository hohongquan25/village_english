// ================== DỮ LIỆU HỘI THOẠI NPC ==================
// d(id, topic, npc nói, dịch, câu trả lời đúng, dịch, [câu sai], npc đáp lại)
function d(id, topic, en, vi, ok, okVi, wrong, reply) {
  return { id, topic, en, vi, ok, okVi, wrong, reply };
}

const DIALOGUES = [
  // --- Chào hỏi ---
  d("g1", "greet", "Good morning! How are you?", "Chào buổi sáng! Bạn khỏe không?", "I'm fine, thank you. And you?", "Tôi khỏe, cảm ơn. Còn bạn?", ["I'm 20 years old.", "Good night!"], "I'm great, thanks!"),
  d("g2", "greet", "Hi! What's your name?", "Chào! Bạn tên là gì?", "My name is Quan.", "Tên tôi là Quân.", ["I'm from Vietnam.", "Yes, I am."], "Nice to meet you, Quan!"),
  d("g3", "greet", "Nice to meet you!", "Rất vui được gặp bạn!", "Nice to meet you too!", "Tôi cũng rất vui được gặp bạn!", ["See you yesterday.", "I'm sorry."], "Welcome to our village!"),
  d("g4", "greet", "Where are you from?", "Bạn đến từ đâu?", "I'm from Vietnam.", "Tôi đến từ Việt Nam.", ["I'm a student.", "I'm fine."], "Oh, Vietnam is a beautiful country!"),
  d("g5", "greet", "See you later!", "Hẹn gặp lại sau!", "Bye! See you!", "Tạm biệt! Hẹn gặp lại!", ["Good morning!", "Yes, please."], "Take care!"),
  d("g6", "greet", "How's it going?", "Dạo này thế nào?", "Not bad. How about you?", "Không tệ. Còn bạn thì sao?", ["It's going to the market.", "I'm going."], "Pretty good, thanks!"),
  d("g7", "greet", "Long time no see!", "Lâu rồi không gặp!", "Yes! How have you been?", "Đúng vậy! Dạo này bạn thế nào?", ["No, I can't see.", "It's a long time."], "I've been busy, but good!"),
  // --- Quán cà phê ---
  d("c1", "cafe", "Hello! What would you like to drink?", "Xin chào! Bạn muốn uống gì?", "A coffee, please.", "Cho tôi một ly cà phê.", ["I like dogs.", "I'm drinking."], "Sure! Hot or iced?"),
  d("c2", "cafe", "Hot or iced?", "Nóng hay đá?", "Iced, please.", "Đá, làm ơn.", ["Yes, I do.", "It's cold today."], "Here you are. Enjoy!"),
  d("c3", "cafe", "Would you like some cake?", "Bạn có muốn ăn bánh không?", "Yes, please. Chocolate cake.", "Vâng. Bánh sô-cô-la.", ["I'm a cake.", "No, I'm not."], "Good choice!"),
  d("c4", "cafe", "For here or to go?", "Dùng ở đây hay mang đi?", "To go, please.", "Mang đi, làm ơn.", ["I go to school.", "Here is my house."], "Okay, one moment."),
  d("c5", "cafe", "That's 3 dollars, please.", "Của bạn 3 đô la.", "Here you are.", "Đây ạ (gửi bạn).", ["You're welcome.", "I'm three."], "Thank you! Have a nice day!"),
  // --- Chợ / mua sắm ---
  d("m1", "market", "Can I help you?", "Tôi có thể giúp gì cho bạn?", "Yes, I'm looking for apples.", "Vâng, tôi đang tìm táo.", ["Yes, I can swim.", "No, I'm a helper."], "They're over there!"),
  d("m2", "market", "How many do you want?", "Bạn muốn bao nhiêu?", "Three, please.", "Ba cái, làm ơn.", ["I want it.", "It's very much."], "Here are three apples."),
  d("m3", "market", "Anything else?", "Còn gì nữa không?", "No, that's all. Thanks.", "Không, vậy thôi. Cảm ơn.", ["Yes, everything.", "Else is good."], "Okay! Have a good day."),
  d("m4", "market", "This shirt is on sale.", "Cái áo này đang giảm giá.", "How much is it?", "Nó bao nhiêu tiền?", ["How old is it?", "Where is it from?"], "It's only ten dollars!"),
  d("m5", "market", "Do you want to try it on?", "Bạn có muốn thử không?", "Yes. Where is the fitting room?", "Có. Phòng thử đồ ở đâu?", ["No, I don't try.", "Yes, it's on the table."], "It's at the back of the shop."),
  // --- Chỉ đường ---
  d("r1", "direction", "Are you lost?", "Bạn bị lạc à?", "Yes. Where is the Study Room?", "Vâng. Phòng học ở đâu ạ?", ["No, I'm Lost.", "Yes, I lost my cat."], "Go straight and turn left."),
  d("r2", "direction", "Excuse me, where is the bank?", "Xin lỗi, ngân hàng ở đâu?", "It's next to the café.", "Nó ở cạnh quán cà phê.", ["It's a big bank.", "I don't have money."], "Thank you so much!"),
  d("r3", "direction", "Is it far from here?", "Nó có xa đây không?", "No, it's a five-minute walk.", "Không, đi bộ 5 phút.", ["Yes, it's here.", "Far is good."], "Great, I'll walk then."),
  d("r4", "direction", "How do I get to the Exam Hall?", "Làm sao để đến Phòng thi?", "Go up this road. It's on the right.", "Đi lên con đường này. Nó ở bên phải.", ["I get a bus.", "The exam is hard."], "Thanks! I'll find it."),
  // --- Thời tiết ---
  d("w1", "weather", "What's the weather like today?", "Hôm nay thời tiết thế nào?", "It's sunny and hot.", "Trời nắng và nóng.", ["It's Monday.", "I like weather."], "Perfect day for a walk!"),
  d("w2", "weather", "It's raining. Do you have an umbrella?", "Trời đang mưa. Bạn có ô không?", "No, I don't. Can I borrow one?", "Không. Tôi mượn một cái được không?", ["Yes, I rain.", "It's an umbrella."], "Sure, take this one."),
  d("w3", "weather", "It's so cold today!", "Hôm nay lạnh quá!", "Yes, I need a jacket.", "Đúng vậy, tôi cần áo khoác.", ["Yes, it's so hot.", "I'm a cold."], "Me too. Stay warm!"),
  d("w4", "weather", "Do you like summer or winter?", "Bạn thích mùa hè hay mùa đông?", "I like summer because I can swim.", "Tôi thích mùa hè vì tôi có thể bơi.", ["I like Monday.", "Yes, I like."], "Me too! Summer is fun."),
  // --- Gia đình ---
  d("f1", "family", "Do you have any brothers or sisters?", "Bạn có anh chị em không?", "Yes, I have one sister.", "Có, tôi có một chị/em gái.", ["Yes, I have a dog brother.", "No, I'm a sister."], "That's nice!"),
  d("f2", "family", "How many people are in your family?", "Gia đình bạn có mấy người?", "There are four people in my family.", "Gia đình tôi có bốn người.", ["My family is happy.", "I have four years."], "A lovely family!"),
  d("f3", "family", "What does your father do?", "Bố bạn làm nghề gì?", "He is a teacher.", "Bố tôi là giáo viên.", ["He is fine.", "He does a car."], "Teaching is a great job!"),
  d("f4", "family", "Are you married?", "Bạn đã kết hôn chưa?", "No, I'm single.", "Chưa, tôi còn độc thân.", ["Yes, I'm marry.", "I'm a husband."], "Okay! Me neither."),
  // --- Thời gian ---
  d("t1", "time", "What time is it?", "Mấy giờ rồi?", "It's nine o'clock.", "Bây giờ là chín giờ.", ["It's Tuesday.", "I have time."], "Oh no, I'm late!"),
  d("t2", "time", "What day is it today?", "Hôm nay là thứ mấy?", "It's Friday.", "Hôm nay là thứ Sáu.", ["It's ten o'clock.", "It's sunny."], "Yay, the weekend is coming!"),
  d("t3", "time", "What time do you get up?", "Bạn thức dậy lúc mấy giờ?", "I get up at 6 a.m.", "Tôi dậy lúc 6 giờ sáng.", ["I get up on the bed.", "I go to bed."], "Wow, that's early!"),
  d("t4", "time", "When is your birthday?", "Sinh nhật bạn khi nào?", "It's on May 5th.", "Vào ngày 5 tháng 5.", ["I'm 25.", "It's a cake."], "I'll remember that!"),
  // --- Sở thích ---
  d("h1", "hobby", "What do you do in your free time?", "Bạn làm gì lúc rảnh?", "I like playing football.", "Tôi thích chơi bóng đá.", ["I'm free.", "I do time."], "Cool! Let's play sometime."),
  d("h2", "hobby", "Do you like music?", "Bạn có thích âm nhạc không?", "Yes, I love pop music.", "Có, tôi rất thích nhạc pop.", ["Yes, I'm music.", "No, I like it."], "Me too!"),
  d("h3", "hobby", "Can you swim?", "Bạn biết bơi không?", "Yes, I can. But not very well.", "Có. Nhưng không giỏi lắm.", ["Yes, I swim yesterday.", "No, I can."], "Practice makes perfect!"),
  d("h4", "hobby", "Let's watch a movie tonight!", "Tối nay đi xem phim nhé!", "Good idea! What time?", "Ý hay đấy! Mấy giờ?", ["I watch my phone.", "Tonight is night."], "How about 8 p.m.?"),
  // --- Sức khỏe ---
  d("s1", "health", "You look tired. Are you okay?", "Trông bạn mệt. Bạn ổn chứ?", "I have a headache.", "Tôi bị đau đầu.", ["I look at you.", "Yes, I'm tired okay."], "You should get some rest."),
  d("s2", "health", "What's the matter?", "Bạn bị sao vậy?", "I have a cold.", "Tôi bị cảm lạnh.", ["It's a matter.", "Nothing is the matter of me."], "Drink warm water and rest."),
  d("s3", "health", "How often do you exercise?", "Bạn tập thể dục bao lâu một lần?", "Three times a week.", "Ba lần một tuần.", ["For three hours.", "Very often week."], "That's healthy!"),
  // --- Công việc ---
  d("j1", "work", "What do you do?", "Bạn làm nghề gì?", "I'm an engineer.", "Tôi là kỹ sư.", ["I'm doing fine.", "I do homework."], "Interesting job!"),
  d("j2", "work", "Do you like your job?", "Bạn có thích công việc của mình không?", "Yes, but it's a bit stressful.", "Có, nhưng hơi căng thẳng.", ["Yes, I like my jog.", "No, I'm a job."], "I understand. Work hard, rest well!"),
  d("j3", "work", "Where do you work?", "Bạn làm việc ở đâu?", "I work in an office in the city.", "Tôi làm ở văn phòng trong thành phố.", ["I work very well.", "At 8 o'clock."], "Is it far from home?"),
  d("j4", "work", "Could you help me with this?", "Bạn có thể giúp tôi việc này không?", "Of course. What do you need?", "Tất nhiên. Bạn cần gì?", ["Of course not, thanks.", "I could help yesterday."], "Thank you, you're so kind!"),
];

// Câu nói ngẫu nhiên hiện bong bóng trên đầu NPC
const AMBIENT = {
  greet: ["Hello!", "Hi there!", "Good morning!", "How are you?", "Have a nice day!"],
  cafe: ["Fresh coffee!", "Would you like tea?", "Bread is ready!", "Yummy cake!"],
  market: ["Fresh apples!", "Good price!", "Can I help you?", "Buy one, get one free!"],
  direction: ["Turn left!", "Go straight!", "It's over there.", "Excuse me!"],
  weather: ["It's sunny!", "What a nice day!", "Is it going to rain?", "So windy!"],
  family: ["I love my family.", "My sister is cute.", "Where is my mom?"],
  time: ["I'm late!", "What time is it?", "See you tomorrow!"],
  hobby: ["I love music!", "Let's play!", "I like reading."],
  health: ["Drink water!", "Exercise every day!", "Sleep early!"],
  work: ["I'm so busy!", "Time to work!", "Good job!"],
};

// ================== LỘ TRÌNH HỌC (cho người mất gốc) ==================
const ROADMAP = [
  {
    phase: "Giai đoạn 0 – Lấy lại gốc (Pre-A1)", time: "2 tuần · 30 phút/ngày",
    lessons: [
      { id: "L01", title: "Bảng chữ cái & phát âm", words: [["A /eɪ/", "a"], ["B /biː/", "bê"], ["C /siː/", "xê"], ["E /iː/", "e"], ["I /aɪ/", "i"], ["O /oʊ/", "ô"], ["U /juː/", "u"], ["Y /waɪ/", "y"]] },
      { id: "L02", title: "Số đếm 1 – 100", words: [["one", "một"], ["two", "hai"], ["three", "ba"], ["ten", "mười"], ["twelve", "mười hai"], ["twenty", "hai mươi"], ["fifty", "năm mươi"], ["one hundred", "một trăm"]] },
      { id: "L03", title: "Chào hỏi & giới thiệu", words: [["hello", "xin chào"], ["goodbye", "tạm biệt"], ["name", "tên"], ["nice to meet you", "rất vui được gặp"], ["thank you", "cảm ơn"], ["sorry", "xin lỗi"], ["please", "làm ơn"], ["yes / no", "có / không"]] },
      { id: "L04", title: "Đại từ & động từ TO BE", words: [["I am", "tôi là"], ["you are", "bạn là"], ["he is", "anh ấy là"], ["she is", "cô ấy là"], ["we are", "chúng tôi là"], ["they are", "họ là"], ["it is", "nó là"], ["I am not", "tôi không phải"]] },
    ],
  },
  {
    phase: "Giai đoạn 1 – A1 (Sơ cấp)", time: "4 tuần · 45 phút/ngày",
    lessons: [
      { id: "L05", title: "Gia đình", words: [["father", "bố"], ["mother", "mẹ"], ["brother", "anh/em trai"], ["sister", "chị/em gái"], ["son", "con trai"], ["daughter", "con gái"], ["husband", "chồng"], ["wife", "vợ"]] },
      { id: "L06", title: "Thói quen hằng ngày (Hiện tại đơn)", words: [["get up", "thức dậy"], ["have breakfast", "ăn sáng"], ["go to work", "đi làm"], ["take a shower", "tắm"], ["go to bed", "đi ngủ"], ["always", "luôn luôn"], ["usually", "thường xuyên"], ["never", "không bao giờ"]] },
      { id: "L07", title: "Đồ ăn & đồ uống", words: [["rice", "cơm"], ["bread", "bánh mì"], ["water", "nước"], ["coffee", "cà phê"], ["chicken", "thịt gà"], ["vegetables", "rau"], ["fruit", "trái cây"], ["delicious", "ngon"]] },
      { id: "L08", title: "Thời gian, ngày, tháng", words: [["Monday", "thứ Hai"], ["Sunday", "Chủ nhật"], ["morning", "buổi sáng"], ["afternoon", "buổi chiều"], ["evening", "buổi tối"], ["o'clock", "giờ đúng"], ["half past", "rưỡi"], ["week", "tuần"]] },
      { id: "L09", title: "Nơi chốn trong thị trấn", words: [["school", "trường học"], ["hospital", "bệnh viện"], ["bank", "ngân hàng"], ["market", "chợ"], ["park", "công viên"], ["next to", "bên cạnh"], ["opposite", "đối diện"], ["between", "ở giữa"]] },
      { id: "L10", title: "Mua sắm & giá cả", words: [["how much", "bao nhiêu tiền"], ["cheap", "rẻ"], ["expensive", "đắt"], ["buy", "mua"], ["sell", "bán"], ["size", "cỡ"], ["pay", "trả tiền"], ["cash", "tiền mặt"]] },
    ],
  },
  {
    phase: "Giai đoạn 2 – A2 (Sơ trung cấp)", time: "6 tuần · 45–60 phút/ngày",
    lessons: [
      { id: "L11", title: "Quá khứ đơn", words: [["went", "đã đi"], ["ate", "đã ăn"], ["saw", "đã thấy"], ["bought", "đã mua"], ["yesterday", "hôm qua"], ["last week", "tuần trước"], ["ago", "cách đây"], ["did", "đã làm"]] },
      { id: "L12", title: "Tương lai: will / going to", words: [["will", "sẽ"], ["going to", "dự định sẽ"], ["tomorrow", "ngày mai"], ["next year", "năm sau"], ["plan", "kế hoạch"], ["maybe", "có lẽ"], ["soon", "sớm thôi"], ["later", "sau đó"]] },
      { id: "L13", title: "So sánh hơn & nhất", words: [["bigger", "lớn hơn"], ["the biggest", "lớn nhất"], ["better", "tốt hơn"], ["the best", "tốt nhất"], ["more beautiful", "đẹp hơn"], ["worse", "tệ hơn"], ["than", "hơn"], ["as ... as", "bằng"]] },
      { id: "L14", title: "Du lịch & chỉ đường", words: [["ticket", "vé"], ["airport", "sân bay"], ["hotel", "khách sạn"], ["turn left", "rẽ trái"], ["go straight", "đi thẳng"], ["passport", "hộ chiếu"], ["luggage", "hành lý"], ["trip", "chuyến đi"]] },
      { id: "L15", title: "Sức khỏe", words: [["headache", "đau đầu"], ["fever", "sốt"], ["cough", "ho"], ["medicine", "thuốc"], ["doctor", "bác sĩ"], ["should", "nên"], ["rest", "nghỉ ngơi"], ["healthy", "khỏe mạnh"]] },
    ],
  },
  {
    phase: "Giai đoạn 3 – B1 (Trung cấp)", time: "8 tuần · 60 phút/ngày",
    lessons: [
      { id: "L16", title: "Hiện tại hoàn thành", words: [["have been", "đã từng ở/đến"], ["ever", "đã từng"], ["never", "chưa bao giờ"], ["already", "đã rồi"], ["yet", "chưa"], ["just", "vừa mới"], ["since", "kể từ"], ["for", "trong khoảng"]] },
      { id: "L17", title: "Câu điều kiện loại 1 & 2", words: [["if", "nếu"], ["unless", "trừ khi"], ["would", "sẽ (giả định)"], ["could", "có thể"], ["imagine", "tưởng tượng"], ["chance", "cơ hội"], ["result", "kết quả"], ["condition", "điều kiện"]] },
      { id: "L18", title: "Công việc & phỏng vấn", words: [["interview", "phỏng vấn"], ["salary", "lương"], ["experience", "kinh nghiệm"], ["skill", "kỹ năng"], ["colleague", "đồng nghiệp"], ["deadline", "hạn chót"], ["meeting", "cuộc họp"], ["apply", "ứng tuyển"]] },
      { id: "L19", title: "Bày tỏ ý kiến", words: [["I think", "tôi nghĩ"], ["in my opinion", "theo ý tôi"], ["I agree", "tôi đồng ý"], ["I disagree", "tôi không đồng ý"], ["however", "tuy nhiên"], ["because", "bởi vì"], ["for example", "ví dụ"], ["on the other hand", "mặt khác"]] },
    ],
  },
  {
    phase: "Giai đoạn 4 – B2 (Trung cao cấp)", time: "10 tuần · 60–90 phút/ngày",
    lessons: [
      { id: "L20", title: "Câu bị động", words: [["is made", "được làm"], ["was built", "đã được xây"], ["has been done", "đã được làm xong"], ["by", "bởi"], ["produce", "sản xuất"], ["invent", "phát minh"], ["design", "thiết kế"], ["publish", "xuất bản"]] },
      { id: "L21", title: "Câu tường thuật", words: [["said that", "nói rằng"], ["told me", "bảo tôi"], ["asked if", "hỏi liệu"], ["explained", "giải thích"], ["suggested", "gợi ý"], ["promised", "hứa"], ["admitted", "thừa nhận"], ["denied", "phủ nhận"]] },
      { id: "L22", title: "Tranh luận & thuyết phục", words: [["advantage", "lợi thế"], ["disadvantage", "bất lợi"], ["furthermore", "hơn nữa"], ["nevertheless", "tuy vậy"], ["consequently", "do đó"], ["evidence", "bằng chứng"], ["significant", "đáng kể"], ["convince", "thuyết phục"]] },
    ],
  },
];

// ================== BỘ ĐỀ THI ==================
// listen: câu sẽ được đọc lên; a: index đáp án đúng
const EXAMS = {
  A1: [
    { q: "My name ___ Anna.", opts: ["am", "is", "are", "be"], a: 1 },
    { q: "They ___ students.", opts: ["is", "am", "are", "be"], a: 2 },
    { q: "___ do you live? – In Hanoi.", opts: ["What", "Where", "When", "Who"], a: 1 },
    { q: "I have two ___.", opts: ["cat", "cats", "a cat", "cates"], a: 1 },
    { q: "She ___ coffee every morning.", opts: ["drink", "drinks", "drinking", "is drink"], a: 1 },
    { q: "Chọn nghĩa của 'expensive'", opts: ["rẻ", "đắt", "đẹp", "to"], a: 1 },
    { q: "___ is your birthday? – In June.", opts: ["When", "Where", "How", "Why"], a: 0 },
    { q: "There ___ a book on the table.", opts: ["are", "is", "am", "have"], a: 1 },
    { q: "I ___ like fish.", opts: ["doesn't", "don't", "not", "isn't"], a: 1 },
    { q: "This is ___ apple.", opts: ["a", "an", "the two", "some"], a: 1 },
    { q: "🔊 Nghe và chọn câu bạn nghe được", listen: "I get up at seven o'clock.", opts: ["I get up at seven o'clock.", "I go to bed at seven.", "I get up at eleven o'clock.", "I eat at seven o'clock."], a: 0 },
    { q: "🔊 Nghe và chọn câu trả lời phù hợp", listen: "How old are you?", opts: ["I'm fine.", "I'm twenty-five.", "I'm from Hue.", "I'm a doctor."], a: 1 },
  ],
  A2: [
    { q: "I ___ to the cinema yesterday.", opts: ["go", "went", "gone", "goes"], a: 1 },
    { q: "She is ___ than her sister.", opts: ["tall", "taller", "tallest", "more tall"], a: 1 },
    { q: "We ___ visit Da Nang next month.", opts: ["are going to", "went", "visiting", "have"], a: 0 },
    { q: "___ you see the film last night?", opts: ["Do", "Did", "Does", "Were"], a: 1 },
    { q: "You ___ smoke here. It's dangerous.", opts: ["mustn't", "must", "should", "can"], a: 0 },
    { q: "This is the ___ day of my life!", opts: ["good", "better", "best", "most good"], a: 2 },
    { q: "I was watching TV when the phone ___.", opts: ["ring", "rang", "rings", "ringing"], a: 1 },
    { q: "How ___ water do you drink?", opts: ["many", "much", "long", "often"], a: 1 },
    { q: "He is good ___ playing the guitar.", opts: ["in", "on", "at", "for"], a: 2 },
    { q: "Chọn nghĩa của 'luggage'", opts: ["vé", "hành lý", "khách sạn", "hộ chiếu"], a: 1 },
    { q: "🔊 Nghe và chọn câu bạn nghe được", listen: "I bought a new jacket last weekend.", opts: ["I bought a new jacket last weekend.", "I buy a new jacket every weekend.", "I bought a blue jacket last week.", "I brought a new jacket last weekend."], a: 0 },
    { q: "🔊 Nghe và chọn câu trả lời phù hợp", listen: "What did you do last weekend?", opts: ["I'll go shopping.", "I went camping with friends.", "I'm doing homework.", "I go swimming."], a: 1 },
  ],
  B1: [
    { q: "I ___ in this city since 2018.", opts: ["live", "lived", "have lived", "am living"], a: 2 },
    { q: "If it rains tomorrow, we ___ at home.", opts: ["stay", "will stay", "would stay", "stayed"], a: 1 },
    { q: "Have you ___ been to Japan?", opts: ["ever", "yet", "already", "since"], a: 0 },
    { q: "The man ___ lives next door is a pilot.", opts: ["which", "who", "where", "whose"], a: 1 },
    { q: "If I ___ rich, I would travel the world.", opts: ["am", "was/were", "will be", "have been"], a: 1 },
    { q: "I'm not used to ___ up early.", opts: ["get", "getting", "got", "gets"], a: 1 },
    { q: "She suggested ___ a taxi.", opts: ["take", "to take", "taking", "took"], a: 2 },
    { q: "I haven't finished my report ___.", opts: ["already", "yet", "just", "ever"], a: 1 },
    { q: "'In my opinion' gần nghĩa nhất với:", opts: ["I think", "I know", "I hope", "I forget"], a: 0 },
    { q: "Choose the correct sentence:", opts: ["He told that he was tired.", "He said me he was tired.", "He said that he was tired.", "He told he is tired me."], a: 2 },
    { q: "🔊 Nghe và chọn ý chính", listen: "I've been working here for three years, and I really enjoy it, although the salary isn't very high.", opts: ["He hates his job.", "He likes his job but the pay is low.", "He just started working.", "He earns a lot of money."], a: 1 },
    { q: "🔊 Nghe và chọn câu trả lời phù hợp", listen: "Would you mind opening the window?", opts: ["Yes, I'd love to mind.", "Not at all. Here you go.", "I don't have a window.", "No, I wouldn't open."], a: 1 },
  ],
  B2: [
    { q: "The bridge ___ in 1990.", opts: ["built", "was built", "has built", "is building"], a: 1 },
    { q: "If I had studied harder, I ___ the exam.", opts: ["would pass", "will pass", "would have passed", "passed"], a: 2 },
    { q: "She asked me where I ___.", opts: ["live", "lived", "do live", "am living"], a: 1 },
    { q: "___ the bad weather, the event went ahead.", opts: ["Although", "Despite", "However", "Because"], a: 1 },
    { q: "I wish I ___ more time to relax.", opts: ["have", "had", "will have", "am having"], a: 1 },
    { q: "By next year, they ___ the new hospital.", opts: ["will finish", "will have finished", "finish", "are finished"], a: 1 },
    { q: "Hardly ___ arrived when it started to rain.", opts: ["I had", "had I", "I have", "did I"], a: 1 },
    { q: "'Consequently' có nghĩa là:", opts: ["tuy nhiên", "do đó", "hơn nữa", "mặc dù"], a: 1 },
    { q: "He denied ___ the money.", opts: ["to steal", "stealing", "steal", "stole"], a: 1 },
    { q: "It's high time we ___ a decision.", opts: ["make", "made", "will make", "making"], a: 1 },
    { q: "🔊 Nghe và chọn ý chính", listen: "Although remote work offers flexibility, many employees report feeling isolated and find it harder to separate work from personal life.", opts: ["Remote work has only advantages.", "Remote work is flexible but has social and balance problems.", "Employees prefer working in the office every day.", "Remote work makes people earn more."], a: 1 },
    { q: "🔊 Nghe và suy luận", listen: "I'd have come to the party if I hadn't had to finish that report.", opts: ["The speaker went to the party.", "The speaker didn't go because of work.", "The speaker didn't want to go.", "The report was finished before the party."], a: 1 },
  ],
};

// ================== CÂU LUYỆN NÓI ==================
const SPEAKING = {
  "Cơ bản": ["Hello, my name is Quan.", "Nice to meet you.", "How are you today?", "I'm from Vietnam.", "Thank you very much.", "Where is the bathroom?", "I would like a coffee, please.", "What time is it?"],
  "Hằng ngày": ["I usually get up at six o'clock.", "I go to work by motorbike.", "Can you speak more slowly, please?", "I'm sorry, I don't understand.", "How much is this shirt?", "Could you help me, please?", "I'm looking for the train station."],
  "Nâng cao": ["I have been learning English for three months.", "If I have time, I will visit my parents.", "In my opinion, reading books is very useful.", "I'm really looking forward to the weekend.", "Would you mind closing the door?"],
};
