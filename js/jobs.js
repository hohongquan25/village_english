// ================== NGHỀ NGHIỆP: hội thoại của những người thợ ==================
DIALOGUES.push(
  // Lính cứu hỏa
  d("jf1", "firefighter", "Hi! I'm a firefighter. Do you know the emergency number?", "Chào! Tôi là lính cứu hỏa. Bạn biết số khẩn cấp không?", "Yes, it's 114 in Vietnam.", "Có, ở Việt Nam là 114.", ["Yes, I'm on fire.", "No, I know a number."], "Great! Remember it."),
  d("jf2", "firefighter", "We check the fire alarms every month.", "Chúng tôi kiểm tra chuông báo cháy hằng tháng.", "That's important. Is your job dangerous?", "Việc đó quan trọng. Công việc của anh có nguy hiểm không?", ["That's alarm. I'm month.", "Yes, I check you."], "Sometimes, but we train very hard."),
  d("jf3", "firefighter", "What should you do if there is a fire?", "Bạn nên làm gì nếu có cháy?", "Leave the building and call for help.", "Rời khỏi tòa nhà và gọi giúp đỡ.", ["Take a shower.", "Stay and watch TV."], "Exactly! Safety first."),
  // Cảnh sát
  d("jp1", "police", "Good afternoon. I'm a police officer. Can I help you?", "Chào buổi chiều. Tôi là cảnh sát. Tôi giúp gì được không?", "Yes, I lost my wallet.", "Vâng, tôi bị mất ví.", ["Yes, I'm a police.", "No, I help you."], "Where did you last see it?"),
  d("jp2", "police", "Where did you last see it?", "Lần cuối bạn thấy nó ở đâu?", "I think I left it at the café.", "Tôi nghĩ tôi để quên ở quán cà phê.", ["I see it last.", "It's brown and small yesterday."], "Let's go and check together."),
  d("jp3", "police", "Please always wear a helmet on your motorbike.", "Hãy luôn đội mũ bảo hiểm khi đi xe máy.", "Of course. I always wear one.", "Tất nhiên. Tôi luôn đội.", ["Yes, I wear a motorbike.", "Helmet is always."], "Good! Drive safely."),
  // Thợ sửa xe
  d("jm1", "mechanic", "Hi! I'm a mechanic. What's wrong with your bike?", "Chào! Tôi là thợ sửa xe. Xe bạn bị sao vậy?", "It makes a strange noise.", "Nó kêu tiếng lạ.", ["It's a strange bike.", "I'm wrong with it."], "Let me take a look."),
  d("jm2", "mechanic", "You have a flat tire.", "Xe bạn bị xẹp lốp.", "How long will it take to fix?", "Sửa mất bao lâu?", ["How flat is it?", "I have a tire."], "About twenty minutes."),
  d("jm3", "mechanic", "I fix cars and motorbikes every day.", "Tôi sửa ô tô và xe máy mỗi ngày.", "Do you enjoy your job?", "Anh có thích công việc của mình không?", ["Do you fix me?", "Every day is a car."], "Yes! I love working with engines."),
  // Thợ mộc
  d("jc1", "carpenter", "Hello! I'm a carpenter. I make furniture from wood.", "Xin chào! Tôi là thợ mộc. Tôi làm đồ gỗ.", "Wow! What are you making now?", "Ồ! Bây giờ anh đang làm gì?", ["Wow, I'm wood.", "I make a carpenter."], "A dining table for the restaurant."),
  d("jc2", "carpenter", "How long does it take to make a chair?", "Làm một cái ghế mất bao lâu?", "I guess about two days?", "Tôi đoán khoảng hai ngày?", ["A chair is long.", "It takes a wood."], "Good guess! Two or three days."),
  d("jc3", "carpenter", "Be careful, the saw is very sharp.", "Cẩn thận, cái cưa rất sắc.", "Thanks for the warning.", "Cảm ơn đã nhắc.", ["I'm very sharp.", "Yes, I saw it yesterday."], "Safety glasses are important too."),
  // Thợ may
  d("jt1", "tailor", "Welcome! I'm a tailor. I can make clothes for you.", "Chào mừng! Tôi là thợ may. Tôi có thể may đồ cho bạn.", "I'd like a new shirt, please.", "Tôi muốn may một chiếc áo sơ mi mới.", ["I'd like a new tailor.", "Clothes are for me make."], "Let me take your measurements."),
  d("jt2", "tailor", "These trousers are too long. Shall I shorten them?", "Quần này dài quá. Tôi cắt ngắn nhé?", "Yes, please. About three centimeters.", "Vâng. Khoảng ba phân.", ["Yes, they are trousers.", "No, I'm too long."], "No problem. Come back tomorrow."),
  d("jt3", "tailor", "What color do you prefer?", "Bạn thích màu nào hơn?", "I prefer dark blue.", "Tôi thích màu xanh đậm hơn.", ["I prefer a color.", "Yes, I do color."], "Dark blue looks very smart."),
  // Nông dân
  d("ja1", "farmer", "Good morning! I'm a farmer. I grow rice and vegetables.", "Chào buổi sáng! Tôi là nông dân. Tôi trồng lúa và rau.", "What time do you start work?", "Bác bắt đầu làm việc lúc mấy giờ?", ["I grow every morning.", "Rice is a farmer."], "At five o'clock, before it gets hot."),
  d("ja2", "farmer", "The tomatoes are ready to pick.", "Cà chua đã sẵn sàng để hái.", "Can I help you pick them?", "Tôi giúp bác hái được không?", ["Can I pick you?", "Tomatoes are ready to me."], "Sure! Thank you so much."),
  d("ja3", "farmer", "We need rain for the crops.", "Chúng ta cần mưa cho mùa màng.", "I hope it rains soon.", "Tôi mong trời sớm mưa.", ["I need a crop.", "Rain is a farmer."], "Me too. The soil is very dry."),
  // Thợ xây
  d("jb1", "builder", "Hi! I'm a builder. We're building a new library.", "Chào! Tôi là thợ xây. Chúng tôi đang xây thư viện mới.", "When will it be finished?", "Khi nào thì xong?", ["When are you a library?", "I'm building you."], "Next spring, I hope."),
  d("jb2", "builder", "Please don't come in. You need a helmet here.", "Đừng vào nhé. Ở đây cần đội mũ bảo hộ.", "Sorry, I didn't know.", "Xin lỗi, tôi không biết.", ["Sorry, I'm a helmet.", "Yes, I come in now."], "No worries. Safety first!"),
  d("jb3", "builder", "I carry bricks and mix cement all day.", "Tôi khuân gạch và trộn xi măng cả ngày.", "That sounds like hard work.", "Nghe có vẻ vất vả.", ["That sounds like bricks.", "I'm all day cement."], "It is, but I'm proud of my work."),
  // Người câu cá / ngư dân
  d("jn1", "fisherman", "Shh! I'm fishing. The fish are shy today.", "Suỵt! Tôi đang câu cá. Hôm nay cá nhát quá.", "Sorry! Have you caught anything?", "Xin lỗi! Bác câu được con nào chưa?", ["Sorry, I'm a fish.", "Yes, I'm shy today."], "Just two small ones so far."),
  d("jn2", "fisherman", "I go fishing every morning.", "Sáng nào tôi cũng đi câu cá.", "Do you sell the fish at the market?", "Bác có bán cá ở chợ không?", ["Do you fish every me?", "I go morning fishing you."], "Yes, at Mrs. Lan's stall."),
  d("jn3", "fisherman", "Patience is the most important thing.", "Kiên nhẫn là điều quan trọng nhất.", "I need to learn to be patient.", "Tôi cần học tính kiên nhẫn.", ["I'm the most thing.", "Patience is a fish."], "Learning English needs patience too!"),
  // Người làm vườn
  d("jg1", "gardener", "Hello! I'm the gardener. I look after the village flowers.", "Xin chào! Tôi là người làm vườn. Tôi chăm sóc hoa của làng.", "They're beautiful! How often do you water them?", "Đẹp quá! Bác tưới chúng bao lâu một lần?", ["I'm a flower.", "Yes, I look after."], "Twice a day in summer."),
  d("jg2", "gardener", "I'm planting some new trees today.", "Hôm nay tôi trồng vài cây mới.", "What kind of trees are they?", "Đó là loại cây gì vậy?", ["What a tree today!", "I'm a new tree."], "Mango trees. They'll give fruit in a few years."),
  d("jg3", "gardener", "Please don't step on the grass.", "Làm ơn đừng giẫm lên cỏ.", "Oh, sorry. I'll walk on the path.", "Ồ, xin lỗi. Tôi sẽ đi trên lối đi.", ["Oh, I'm the grass.", "Yes, I step on it."], "Thank you!"),
  // Lao công
  d("jl1", "cleaner", "Good morning! I keep the streets clean.", "Chào buổi sáng! Tôi giữ cho đường phố sạch sẽ.", "Thank you for your hard work!", "Cảm ơn vì sự vất vả của bác!", ["Good morning, I'm a street.", "Clean is the morning."], "You're welcome! Please use the bins."),
  d("jl2", "cleaner", "Where do you put your rubbish?", "Bạn để rác ở đâu?", "In the bin, of course.", "Trong thùng rác, tất nhiên rồi.", ["On the street, of course.", "I put rubbish me."], "Perfect! The village thanks you."),
  d("jl3", "cleaner", "I start work at four in the morning.", "Tôi bắt đầu làm việc lúc 4 giờ sáng.", "Wow, that's very early!", "Ồ, sớm quá!", ["Wow, I'm four.", "That's a morning work."], "Yes, but I finish at noon."),
  // Tài xế xe buýt
  d("jd1", "busdriver", "Hello! This bus goes to the city center.", "Xin chào! Xe buýt này đi vào trung tâm thành phố.", "How much is a ticket?", "Vé bao nhiêu tiền?", ["How much is a bus?", "I go to the center bus."], "It's seven thousand dong."),
  d("jd2", "busdriver", "The next bus leaves in ten minutes.", "Chuyến xe tiếp theo khởi hành sau mười phút.", "Okay, I'll wait here.", "Được, tôi sẽ đợi ở đây.", ["Okay, I leave ten.", "The bus is minutes."], "Please have your ticket ready."),
  d("jd3", "busdriver", "I drive this route six times a day.", "Tôi lái tuyến này sáu lần một ngày.", "Do you ever get tired?", "Anh có bao giờ thấy mệt không?", ["Do you drive a route me?", "Six is a day."], "Sometimes, but I like meeting people."),
  // Y tá
  d("jy1", "nurse", "Hello, I'm a nurse. How are you feeling today?", "Xin chào, tôi là y tá. Hôm nay bạn thấy thế nào?", "Much better, thank you.", "Đỡ hơn nhiều rồi, cảm ơn.", ["I'm feeling a nurse.", "Much nurse, thanks."], "Great! Keep taking your medicine."),
  d("jy2", "nurse", "Can I check your temperature?", "Tôi kiểm tra nhiệt độ cho bạn nhé?", "Sure, go ahead.", "Vâng, chị cứ làm.", ["Sure, I'm temperature.", "No, I check you."], "Thirty-seven degrees. That's normal."),
  d("jy3", "nurse", "I work night shifts this week.", "Tuần này tôi làm ca đêm.", "Is it hard to sleep during the day?", "Ngủ ban ngày có khó không?", ["Is it a night week?", "I shift every night."], "A little, but I'm used to it."),
  // Người giao hàng / kho
  d("jw1", "delivery", "Hi! I deliver parcels all over the village.", "Chào! Tôi giao bưu kiện khắp làng.", "Do you have a parcel for me?", "Có bưu kiện nào cho tôi không?", ["Do you deliver me village?", "Parcels are all over."], "Let me check... Yes! Sign here, please."),
  d("jw2", "delivery", "This box is heavy. Can you hold the door?", "Thùng này nặng. Bạn giữ cửa giúp được không?", "Sure, no problem.", "Được, không vấn đề gì.", ["Sure, I'm a door.", "The box is me."], "Thanks a lot!"),
  d("jw3", "delivery", "I ride my motorbike about eighty kilometers a day.", "Mỗi ngày tôi chạy xe máy khoảng 80 cây số.", "That's a lot! Be careful on the road.", "Nhiều quá! Đi đường cẩn thận nhé.", ["That's a kilometer.", "I ride a day."], "Thanks, I always drive carefully."),
  // Giáo viên
  d("je1", "teacher", "Hello! I teach English at the village school.", "Xin chào! Tôi dạy tiếng Anh ở trường làng.", "Can you give me some tips for learning?", "Thầy cho tôi vài mẹo học được không?", ["Can you teach a school?", "I'm English village."], "Practice a little every day, and don't be afraid of mistakes."),
  d("je2", "teacher", "How long have you been learning English?", "Bạn học tiếng Anh được bao lâu rồi?", "For about two months.", "Khoảng hai tháng.", ["Since two months.", "I'm learning long."], "You're doing really well!"),
  d("je3", "teacher", "Did you do your homework?", "Bạn làm bài tập về nhà chưa?", "Yes, I finished it last night.", "Rồi, tôi làm xong tối qua.", ["Yes, I do homework tomorrow.", "No, I'm a homework."], "Excellent! Let's check it together."),
);
Object.assign(AMBIENT, {
  firefighter: ["Safety first!", "Call 114 for fire!", "Check your smoke alarm!"],
  police: ["Drive safely!", "Wear your helmet!", "Need help?"],
  mechanic: ["Flat tire? I can fix it!", "Oil change today?", "Engines are my life!"],
  carpenter: ["Fresh wood!", "Handmade chairs!", "Measure twice, cut once!"],
  tailor: ["Clothes made for you!", "Perfect fit!", "New fabric arrived!"],
  farmer: ["Fresh vegetables!", "We need rain!", "Rice grows well this year!"],
  builder: ["Helmets on!", "New library coming!", "More bricks, please!"],
  fisherman: ["Shh... fish!", "Big one today?", "Patience, patience..."],
  gardener: ["Water the flowers!", "Don't step on the grass!", "Planting trees today!"],
  cleaner: ["Keep it clean!", "Use the bins, please!", "Good morning!"],
  busdriver: ["Bus to the city!", "All aboard!", "Next stop: Village Square!"],
  nurse: ["Get well soon!", "Drink water!", "How are you feeling?"],
  delivery: ["Parcel for you!", "Delivery!", "Sign here, please!"],
  teacher: ["Study a little every day!", "Don't fear mistakes!", "Homework time!"],
});
// Mô tả công việc (dùng cho chat AI)
const JOBS = {
  firefighter: "a firefighter working at the village fire station",
  police: "a police officer at the village police station",
  mechanic: "a mechanic who repairs motorbikes and cars at the village garage",
  carpenter: "a carpenter who makes wooden furniture in a workshop",
  tailor: "a tailor who makes and alters clothes in a small tailor shop",
  farmer: "a farmer who grows rice and vegetables in the fields",
  builder: "a construction worker building the new village library",
  fisherman: "a fisherman who fishes at the village pond every morning",
  gardener: "the village gardener who looks after flowers, trees and the park",
  cleaner: "a street cleaner who keeps the village roads clean",
  busdriver: "a bus driver who drives the bus between the village and the city",
  nurse: "a nurse who works at the village clinic",
  delivery: "a delivery worker who brings parcels from the warehouse to homes",
  teacher: "an English teacher at the village school",
};
