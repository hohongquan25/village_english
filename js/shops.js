// ================== HỘI THOẠI CỬA HÀNG ==================
DIALOGUES.push(
  // Nhà hàng
  d("re1", "restaurant", "Good evening! Do you have a reservation?", "Chào buổi tối! Bạn đã đặt bàn chưa?", "No. A table for two, please.", "Chưa. Cho tôi bàn hai người.", ["Yes, I'm a reservation.", "Good evening, I'm hungry table."], "Right this way, please."),
  d("re2", "restaurant", "Are you ready to order?", "Bạn sẵn sàng gọi món chưa?", "Yes. I'd like the chicken soup.", "Rồi. Tôi muốn món súp gà.", ["Yes, I'm ready to eat you.", "No, I order yesterday."], "Great choice. Anything to drink?"),
  d("re3", "restaurant", "How was your meal?", "Bữa ăn thế nào ạ?", "It was delicious, thank you!", "Rất ngon, cảm ơn!", ["It was a meal.", "I was delicious."], "I'm glad you liked it!"),
  d("re4", "restaurant", "Would you like the bill?", "Bạn muốn thanh toán chứ?", "Yes, please. Can I pay by card?", "Vâng. Tôi trả bằng thẻ được không?", ["Yes, I like Bill.", "No, I'm the bill."], "Of course. Here's the machine."),
  // Quần áo
  d("cl1", "clothes", "What size do you wear?", "Bạn mặc cỡ nào?", "Medium, please.", "Cỡ vừa (M), làm ơn.", ["I wear a shirt.", "Size is good."], "Here's a medium."),
  d("cl2", "clothes", "How does it fit?", "Bạn mặc có vừa không?", "It's a little too big.", "Nó hơi rộng quá.", ["It fits a lot.", "It's a fit."], "Let me get you a smaller one."),
  d("cl3", "clothes", "We have it in blue and black.", "Chúng tôi có màu xanh và màu đen.", "I'll take the black one.", "Tôi lấy cái màu đen.", ["I'm black and blue.", "Take it, please, blue."], "Good choice! It looks great."),
  // Nhà thuốc
  d("ph1", "pharmacy", "Hello. What do you need?", "Xin chào. Bạn cần gì?", "I need something for a sore throat.", "Tôi cần thuốc trị đau họng.", ["I need a throat.", "I'm sore."], "Try these. Take one every four hours."),
  d("ph2", "pharmacy", "Do you have a prescription?", "Bạn có đơn thuốc không?", "Yes, here it is.", "Có, đây ạ.", ["Yes, I'm prescription.", "No, I have a doctor."], "Thank you. Please wait a moment."),
  d("ph3", "pharmacy", "Are you allergic to anything?", "Bạn có dị ứng gì không?", "No, I'm not.", "Không, tôi không bị.", ["Yes, I love it.", "Anything is allergic."], "Okay, this medicine is safe for you."),
  // Hiệu sách
  d("bk1", "bookstore", "Are you looking for a book?", "Bạn đang tìm sách à?", "Yes. Do you have English books for beginners?", "Vâng. Có sách tiếng Anh cho người mới không?", ["Yes, I'm a book.", "No, I look at me."], "Yes! They're on the second shelf."),
  d("bk2", "bookstore", "Do you like reading?", "Bạn có thích đọc sách không?", "Yes, I read every night.", "Có, tôi đọc mỗi tối.", ["Yes, I'm reading you.", "No, I read never."], "Reading is the best way to learn!"),
  d("bk3", "bookstore", "This book is very popular.", "Cuốn sách này rất nổi tiếng.", "What is it about?", "Nó nói về gì vậy?", ["Who is it?", "Where is it popular?"], "It's about a boy who travels the world."),
  // Tiệm hoa
  d("fl1", "flower", "These flowers are beautiful, right?", "Những bông hoa này đẹp nhỉ?", "Yes! How much are the roses?", "Đúng vậy! Hoa hồng bao nhiêu tiền?", ["Yes, I'm a flower.", "Right, I'm beautiful."], "Two dollars each."),
  d("fl2", "flower", "Who are the flowers for?", "Hoa này tặng ai vậy?", "They're for my mother.", "Tặng mẹ tôi.", ["They're from flowers.", "For flowers."], "How sweet! She will love them."),
  d("fl3", "flower", "Would you like a card with that?", "Bạn có muốn kèm thiệp không?", "Yes, please. 'Happy Birthday'.", "Vâng. Ghi 'Chúc mừng sinh nhật'.", ["Yes, I'd like a car.", "No, I'm a card."], "I'll write it for you."),
  // Bưu điện
  d("po1", "post", "Where would you like to send this?", "Bạn muốn gửi cái này đi đâu?", "To Vietnam, please.", "Gửi về Việt Nam ạ.", ["I send it yesterday.", "This is a letter."], "That will be five dollars."),
  d("po2", "post", "How long does it take?", "Mất bao lâu ạ?", "About one week.", "Khoảng một tuần.", ["It takes a box.", "Very long letter."], "Okay, that's fine."),
  d("po3", "post", "Do you want to send it by express?", "Bạn có muốn gửi hỏa tốc không?", "No, regular mail is fine.", "Không, gửi thường là được.", ["Yes, I'm express.", "I send by foot."], "Okay, regular mail it is."),
  // Ngân hàng
  d("ba1", "bank", "Good morning. How can I help you?", "Chào buổi sáng. Tôi giúp gì được ạ?", "I'd like to open an account.", "Tôi muốn mở tài khoản.", ["I'd like to open the door.", "Help is good morning."], "Sure. Can I see your ID card?"),
  d("ba2", "bank", "Can I see your ID card?", "Cho tôi xem căn cước được không?", "Sure, here you are.", "Vâng, đây ạ.", ["I can see it.", "No, I'm ID."], "Thank you. Please sign here."),
  d("ba3", "bank", "Would you like to exchange money?", "Bạn có muốn đổi tiền không?", "Yes, dollars to dong, please.", "Vâng, đổi đô sang đồng ạ.", ["Yes, I exchange you.", "No, money is good."], "Today's rate is very good."),
  // Tiệm cắt tóc
  d("hb1", "barber", "How would you like your hair?", "Bạn muốn cắt tóc kiểu gì?", "Short on the sides, please.", "Hai bên ngắn, làm ơn.", ["I like my hair, thanks.", "Hair is long."], "No problem!"),
  d("hb2", "barber", "Do you want a wash too?", "Bạn có muốn gội đầu luôn không?", "Yes, please.", "Vâng, làm ơn.", ["Yes, wash my car.", "No, I'm washing."], "Please sit here."),
  d("hb3", "barber", "What do you think? Do you like it?", "Bạn thấy sao? Có thích không?", "It looks great. Thank you!", "Trông rất đẹp. Cảm ơn!", ["I think hair.", "It likes me."], "You look ten years younger!"),
  // Sạp trái cây / chợ
  d("fr1", "fruit", "Fresh mangoes today! Want some?", "Hôm nay có xoài tươi! Mua không?", "Yes, one kilo, please.", "Có, một ký, làm ơn.", ["Yes, I'm fresh.", "No, I want some."], "Here you go. They're very sweet!"),
  d("fr2", "fruit", "Are these bananas ripe?", "Chuối này chín chưa?", "Yes, you can eat them today.", "Rồi, hôm nay ăn được.", ["Yes, they're right.", "No, they are yellow banana."], "Thanks, I'll take them."),
  d("fr3", "fruit", "Can you give me a discount?", "Bớt cho tôi chút được không?", "Okay, for you, eight dollars.", "Được, bán cho bạn tám đô.", ["Discount is me.", "Yes, I give you a count."], "Thank you! You're very kind."),
  // Đồ chơi
  d("ty1", "toy", "This toy is for children aged five and up.", "Đồ chơi này dành cho trẻ từ 5 tuổi.", "Perfect. My nephew is six.", "Tuyệt. Cháu tôi sáu tuổi.", ["I'm five and up.", "The toy is old."], "He'll love it!"),
  d("ty2", "toy", "Do you need a gift bag?", "Bạn có cần túi quà không?", "Yes, please. It's a present.", "Vâng. Đây là quà tặng.", ["No, I need a bag of gifts for me bag.", "Yes, I'm a gift."], "Here's a nice red one."),
);
Object.assign(AMBIENT, {
  restaurant: ["Table for two?", "Today's special: pho!", "Enjoy your meal!"],
  clothes: ["New collection!", "50% off today!", "Try it on!"],
  pharmacy: ["Feel better soon!", "Need medicine?", "Take care!"],
  bookstore: ["New books today!", "Do you like reading?", "Shh... quiet please."],
  flower: ["Fresh roses!", "Flowers for your love?", "Smell these!"],
  post: ["Letters and parcels!", "Send a postcard!", "Next, please!"],
  bank: ["Good morning!", "Next customer, please.", "Exchange money here!"],
  barber: ["Haircut? Come in!", "New style today?", "Looking good!"],
  fruit: ["Fresh mangoes!", "Sweet bananas!", "Three for two dollars!"],
  toy: ["Toys for kids!", "Fun games here!", "Gift for your child?"],
});
